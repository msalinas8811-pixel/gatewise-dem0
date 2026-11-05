/* =====================================================================
   GateWise · Cloud Functions (Firebase, 2.ª generación)
   Conecta la lógica de core.js con Firestore, Authentication y Cloud
   Messaging. Región us-east1 (la misma de la base de datos).
   ===================================================================== */
'use strict';
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { setGlobalOptions, logger } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { crearCore } = require('./core');

admin.initializeApp();
setGlobalOptions({ region: 'us-east1', maxInstances: 20 });
const fdb = admin.firestore();
const FV = admin.firestore.FieldValue;

/* ---------- Adaptador: lo que core.js necesita ---------- */
function aplicarFiltros(ref, filtros) { (filtros || []).forEach(([c, op, v]) => { ref = ref.where(c, op, v); }); return ref; }
const A = {
  ts: () => FV.serverTimestamp(),
  now: () => new Date(),
  db: {
    get: async p => { const s = await fdb.doc(p).get(); return s.exists ? s.data() : null; },
    set: (p, o) => fdb.doc(p).set(o),
    update: (p, o) => fdb.doc(p).set(o, { merge: true }),
    del: p => fdb.doc(p).delete(),
    query: async (col, filtros) => (await aplicarFiltros(fdb.collection(col), filtros).get()).docs.map(d => ({ id: d.id, data: d.data() })),
    deleteTree: p => fdb.recursiveDelete(fdb.doc(p)),
  },
  auth: {
    create: o => admin.auth().createUser(o),
    update: (uid, o) => admin.auth().updateUser(uid, o),
    remove: uid => admin.auth().deleteUser(uid),
    claims: (uid, c) => admin.auth().setCustomUserClaims(uid, c),
    byEmail: async e => { try { return await admin.auth().getUserByEmail(e); } catch (x) { if (x.code === 'auth/user-not-found') return null; throw x; } },
    revoke: uid => admin.auth().revokeRefreshTokens(uid),
  },
  push: async (tokens, m) => {
    const r = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: m.title, body: m.body },
      data: m.data || {},
      webpush: { fcmOptions: { link: '/' }, notification: { icon: '/icon-192.png', badge: '/icon-192.png' } },
      android: { priority: 'high' },
    });
    const malos = [];
    r.responses.forEach((x, i) => {
      const c = x.error && x.error.code;
      if (c === 'messaging/registration-token-not-registered' || c === 'messaging/invalid-registration-token') malos.push(tokens[i]);
    });
    return malos;
  },
};
const core = crearCore(A);

/* ---------- Llamadas desde la app ---------- */
const ctxDe = req => ({ uid: req.auth && req.auth.uid, token: (req.auth && req.auth.token) || {} });
const CODIGOS = ['invalid-argument', 'failed-precondition', 'out-of-range', 'unauthenticated', 'permission-denied', 'not-found', 'already-exists', 'resource-exhausted'];
function llamada(fn, opts) {
  return onCall(Object.assign({ cors: true, enforceAppCheck: false }, opts || {}), async req => {
    try { return await fn(req.data || {}, ctxDe(req)); }
    catch (e) {
      if (CODIGOS.includes(e.code)) throw new HttpsError(e.code, e.message);
      if (e.code === 'auth/email-already-exists' || e.code === 'auth/uid-already-exists') throw new HttpsError('already-exists', 'Ese usuario ya existe');
      if (e.code === 'auth/invalid-password') throw new HttpsError('invalid-argument', 'La clave no es válida (mínimo 6 caracteres)');
      logger.error('Error en función', e);
      throw new HttpsError('internal', 'Ocurrió un error. Intenta de nuevo.');
    }
  });
}
exports.usuarios = llamada(core.usuarios);
exports.registroInfo = llamada(core.registroInfo);
exports.registro = llamada(core.registro, { memory: '512MiB' });
exports.aprobarRegistro = llamada(core.aprobarRegistro);
exports.eliminarMiCuenta = llamada(core.eliminarMiCuenta);
exports.eliminarResidencial = llamada(core.eliminarResidencial, { timeoutSeconds: 540, memory: '1GiB' });

/* ---------- Disparadores de la base de datos ---------- */
exports.alCrearNotificacion = onDocumentCreated('r/{rid}/notifs/{id}', async ev => {
  if (!ev.data) return;
  try { await core.onNotifCreada(ev.params.rid, ev.params.id, ev.data.data()); } catch (e) { logger.warn('push', e.message); }
});
exports.alCambiarMiembro = onDocumentUpdated('r/{rid}/miembros/{uid}', async ev => {
  await core.onMiembroCambio(ev.params.rid, ev.params.uid, ev.data.before.data(), ev.data.after.data());
});
exports.alCambiarResidencial = onDocumentUpdated('r/{rid}', async ev => {
  await core.onResidencialCambio(ev.params.rid, ev.data.before.data(), ev.data.after.data());
});
exports.alCambiarSolicitud = onDocumentUpdated('r/{rid}/solicitudes/{id}', async ev => {
  await core.onSolicitudCambio(ev.params.rid, ev.params.id, ev.data.before.data(), ev.data.after.data());
});

/* ---------- Tareas programadas ---------- */
// Todos los días 5:10 a. m. (El Salvador): cuotas del mes, inquilinos vencidos y estadísticas
exports.tareaDiaria = onSchedule({ schedule: '10 5 * * *', timeZone: 'America/El_Salvador', timeoutSeconds: 540, memory: '512MiB' }, async () => {
  const r = await core.diario(-6);
  logger.info('Tarea diaria', r);
});
// Todos los días 2:30 a. m.: respaldo completo de Firestore en Cloud Storage
exports.respaldoDiario = onSchedule({ schedule: '30 2 * * *', timeZone: 'America/El_Salvador', timeoutSeconds: 540 }, async () => {
  const projectId = process.env.GCLOUD_PROJECT || JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId;
  const bucket = 'gs://' + projectId + '-respaldos';
  const client = new (require('@google-cloud/firestore').v1.FirestoreAdminClient)();
  const fecha = new Date().toISOString().slice(0, 10);
  const [op] = await client.exportDocuments({
    name: client.databasePath(projectId, '(default)'),
    outputUriPrefix: bucket + '/' + fecha,
    collectionIds: [],
  });
  logger.info('Respaldo iniciado', op.name);
});
