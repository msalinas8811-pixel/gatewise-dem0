/* GateWise · pruebas de firestore.rules contra el emulador.
   GitHub Actions las corre con:  firebase emulators:exec --only firestore "npm --prefix tests test"  */
'use strict';
const { test, before, after, beforeEach } = require('node:test');
const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, serverTimestamp } = require('firebase/firestore');

const RID = 'res1';
let env;
const OWNER = { email: 'msalinas8811@gmail.com' };
const quien = {
  admin: ['u_admin', { rid: RID, rol: 'admin', casa: '' }],
  rosa: ['u_rosa', { rid: RID, rol: 'residente', casa: 'c1' }],
  pedro: ['u_pedro', { rid: RID, rol: 'residente', casa: 'c2' }],
  ines: ['u_ines', { rid: RID, rol: 'inquilino', casa: 'c1' }],
  vig: ['u_vig', { rid: RID, rol: 'vigilante', casa: '' }],
  cob: ['u_cob', { rid: RID, rol: 'cobrador', casa: '' }],
  ven: ['u_ven', { rid: RID, rol: 'vendedor', casa: '' }],
  otra: ['u_otra', { rid: 'res2', rol: 'admin', casa: '' }],
};
const db = k => { if (k === 'owner') return env.authenticatedContext('owner_uid', OWNER).firestore(); if (!k) return env.unauthenticatedContext().firestore(); const [u, c] = quien[k]; return env.authenticatedContext(u, c).firestore(); };
const uidDe = k => quien[k][0];
const sobre = (k, rec, prom) => Object.assign({ d: JSON.stringify(rec), _u: uidDe(k), _t: serverTimestamp() }, prom || {});
const R = (...p) => ['r', RID, ...p].join('/');

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'gatewise-test', firestore: { rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8') } });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c => {
    const f = c.firestore(); const s = (p, o) => setDoc(doc(f, p), o);
    await s('plataforma/publico', { d: '{"residenciales":[]}' });
    await s('plataforma/privado', { d: '{"tarifas":[]}' });
    await s(R(), { nombre: 'Res 1', estado: 'activa' });
    await s(R('casas', 'c1'), { d: '{}', numero: '1', pasaje: 'A', duenoId: 'u_rosa' });
    await s(R('casasPriv', 'c1'), { d: '{"codigo":"123456"}' });
    await s(R('casasPriv', 'c2'), { d: '{"codigo":"654321"}' });
    await s(R('miembros', 'u_rosa'), { d: '{}', rol: 'residente', casaId: 'c1', activo: true, nombre: 'Rosa' });
    await s(R('miembros', 'u_ines'), { d: '{}', rol: 'inquilino', casaId: 'c1', padreId: 'u_rosa', activo: true, nombre: 'Ines' });
    await s(R('perfiles', 'u_rosa'), { d: '{"tel":"7000"}' });
    await s(R('perfiles', 'u_pedro'), { d: '{"tel":"7001"}' });
    await s(R('perfiles', 'u_ines'), { d: '{"tel":"7002"}' });
    await s(R('cuotas', 'q_c1_2026-10'), { d: '{}', casaId: 'c1', periodo: '2026-10', estado: 'pendiente', monto: 25 });
    await s(R('cuotas', 'q_c2_2026-10'), { d: '{}', casaId: 'c2', periodo: '2026-10', estado: 'pendiente', monto: 25 });
    await s(R('avisos', 'a1'), { d: '{}' });
    await s(R('areas', 'salon'), { d: '{}', aprobacion: true });
    await s(R('areas', 'cancha'), { d: '{}', aprobacion: false });
    await s(R('notifs', 'n1'), { d: '{}', userId: 'u_rosa', leida: false });
    await s(R('solicitudes', 's1'), { d: '{}', casaId: 'c3', estado: 'pendiente' });
  });
});

/* ---------- Plataforma ---------- */
test('cualquiera lee la lista pública; solo el dueño la cambia', async () => {
  await assertSucceeds(getDoc(doc(db(), 'plataforma/publico')));
  await assertFails(setDoc(doc(db('admin'), 'plataforma/publico'), { d: '{}' }));
  await assertSucceeds(setDoc(doc(db('owner'), 'plataforma/publico'), { d: '{}' }));
});
test('datos del negocio: solo el dueño', async () => {
  await assertFails(getDoc(doc(db('admin'), 'plataforma/privado')));
  await assertSucceeds(getDoc(doc(db('owner'), 'plataforma/privado')));
});
test('solicitud de residencial: se puede crear sin cuenta, pero no leer', async () => {
  await assertSucceeds(setDoc(doc(db(), 'solicitudesRes/x1'), { d: '{"nombre":"Nueva"}', _t: serverTimestamp() }));
  await assertFails(getDoc(doc(db(), 'solicitudesRes/x1')));
  await assertFails(setDoc(doc(db(), 'solicitudesRes/x2'), { d: '{}', _t: serverTimestamp(), extra: 1 }));
});

/* ---------- Aislamiento entre residenciales ---------- */
test('un admin de otra residencial no ve nada de esta', async () => {
  await assertFails(getDoc(doc(db('otra'), R('casas', 'c1'))));
  await assertFails(getDocs(collection(db('otra'), R('miembros'))));
  await assertFails(setDoc(doc(db('otra'), R('avisos', 'a2')), sobre('otra', {})));
});
test('sin sesión no se lee nada de la residencial', async () => {
  await assertFails(getDoc(doc(db(), R('casas', 'c1'))));
});

/* ---------- Datos personales ---------- */
test('perfiles privados: cada quien el suyo; el propietario, los de sus inquilinos', async () => {
  await assertSucceeds(getDoc(doc(db('rosa'), R('perfiles', 'u_rosa'))));
  await assertFails(getDoc(doc(db('rosa'), R('perfiles', 'u_pedro'))));
  await assertSucceeds(getDoc(doc(db('rosa'), R('perfiles', 'u_ines'))));
  await assertSucceeds(getDoc(doc(db('vig'), R('perfiles', 'u_pedro'))));
  await assertFails(getDocs(collection(db('rosa'), R('perfiles'))));
});
test('códigos de registro de casas: solo la propia casa, la administración y portería', async () => {
  await assertSucceeds(getDoc(doc(db('rosa'), R('casasPriv', 'c1'))));
  await assertFails(getDoc(doc(db('rosa'), R('casasPriv', 'c2'))));
  await assertSucceeds(getDoc(doc(db('vig'), R('casasPriv', 'c2'))));
  await assertFails(getDoc(doc(db('ven'), R('casasPriv', 'c2'))));
});
test('nadie crea usuarios desde la app (solo Cloud Functions)', async () => {
  await assertFails(setDoc(doc(db('admin'), R('miembros', 'u_nuevo')), sobre('admin', {}, { rol: 'admin' })));
});
test('un residente no puede subirse de rol', async () => {
  await assertFails(updateDoc(doc(db('rosa'), R('miembros', 'u_rosa')), { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), rol: 'admin' }));
  await assertSucceeds(updateDoc(doc(db('rosa'), R('miembros', 'u_rosa')), { d: '{"foto":"x"}', _u: 'u_rosa', _t: serverTimestamp() }));
});
test('el admin no cambia rol ni casa directamente (pasa por la función)', async () => {
  await assertFails(updateDoc(doc(db('admin'), R('miembros', 'u_rosa')), { d: '{}', _u: 'u_admin', _t: serverTimestamp(), casaId: 'c9' }));
  await assertSucceeds(updateDoc(doc(db('admin'), R('miembros', 'u_rosa')), { d: '{}', _u: 'u_admin', _t: serverTimestamp(), activo: false }));
});
test('el sobre debe ser de quien escribe', async () => {
  await assertFails(setDoc(doc(db('rosa'), R('pases', 'p1')), Object.assign(sobre('rosa', {}, { casaId: 'c1' }), { _u: 'u_pedro' })));
});

/* ---------- Finanzas ---------- */
test('cuotas: cada casa ve solo las suyas', async () => {
  await assertSucceeds(getDocs(query(collection(db('rosa'), R('cuotas')), where('casaId', '==', 'c1'))));
  await assertFails(getDocs(query(collection(db('rosa'), R('cuotas')), where('casaId', '==', 'c2'))));
  await assertFails(getDocs(collection(db('rosa'), R('cuotas'))));
  await assertSucceeds(getDocs(collection(db('cob'), R('cuotas'))));
});
test('el residente puede reportar pago (revisión) pero no marcar pagada', async () => {
  const ref = doc(db('rosa'), R('cuotas', 'q_c1_2026-10'));
  await assertFails(updateDoc(ref, { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), estado: 'pagada' }));
  await assertFails(updateDoc(ref, { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), estado: 'revision', monto: 1 }));
  await assertSucceeds(updateDoc(ref, { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), estado: 'revision' }));
  await assertFails(updateDoc(doc(db('rosa'), R('cuotas', 'q_c2_2026-10')), { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), estado: 'revision' }));
});
test('pagos del residente: solo de su casa y en revisión', async () => {
  await assertSucceeds(setDoc(doc(db('rosa'), R('pagos', 'pg1')), sobre('rosa', {}, { casaId: 'c1', estado: 'revision', monto: 25 })));
  await assertFails(setDoc(doc(db('rosa'), R('pagos', 'pg2')), sobre('rosa', {}, { casaId: 'c1', estado: 'aprobado', monto: 25 })));
  await assertFails(setDoc(doc(db('rosa'), R('pagos', 'pg3')), sobre('rosa', {}, { casaId: 'c2', estado: 'revision', monto: 25 })));
});

/* ---------- Comunicación y comunidad ---------- */
test('avisos: todos leen, solo la administración publica', async () => {
  await assertSucceeds(getDoc(doc(db('ines'), R('avisos', 'a1'))));
  await assertFails(setDoc(doc(db('rosa'), R('avisos', 'a2')), sobre('rosa', {})));
  await assertSucceeds(setDoc(doc(db('admin'), R('avisos', 'a2')), sobre('admin', {})));
});
test('notificaciones: cada quien las suyas', async () => {
  await assertSucceeds(getDocs(query(collection(db('rosa'), R('notifs')), where('userId', '==', 'u_rosa'))));
  await assertFails(getDocs(query(collection(db('pedro'), R('notifs')), where('userId', '==', 'u_rosa'))));
});
test('solicitudes de registro: solo la administración, y nadie las crea desde la app', async () => {
  await assertFails(getDoc(doc(db('vig'), R('solicitudes', 's1'))));
  await assertSucceeds(getDoc(doc(db('admin'), R('solicitudes', 's1'))));
  await assertFails(setDoc(doc(db('rosa'), R('solicitudes', 's2')), sobre('rosa', {}, { casaId: 'c1', estado: 'pendiente' })));
});
test('voto: solo con la clave de la propia casa', async () => {
  await assertSucceeds(setDoc(doc(db('rosa'), R('kvVoto', 'vto_v1_c1')), sobre('rosa', {}, { casaId: 'c1' })));
  await assertFails(setDoc(doc(db('rosa'), R('kvVoto', 'vto_v1_c2')), sobre('rosa', {}, { casaId: 'c2' })));
  await assertFails(setDoc(doc(db('ines'), R('kvVoto', 'vto_v1_c1')), sobre('ines', {}, { casaId: 'c1' })));
});
test('reservas: área con aprobación queda pendiente; sin aprobación se puede confirmar', async () => {
  await assertFails(setDoc(doc(db('rosa'), R('kvReserva', 'rsv_1')), sobre('rosa', {}, { casaId: 'c1', areaId: 'salon', estado: 'aprobada' })));
  await assertSucceeds(setDoc(doc(db('rosa'), R('kvReserva', 'rsv_2')), sobre('rosa', {}, { casaId: 'c1', areaId: 'salon', estado: 'pendiente' })));
  await assertSucceeds(setDoc(doc(db('rosa'), R('kvReserva', 'rsv_3')), sobre('rosa', {}, { casaId: 'c1', areaId: 'cancha', estado: 'aprobada' })));
  await assertFails(updateDoc(doc(db('rosa'), R('kvReserva', 'rsv_2')), { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), estado: 'aprobada' }));
  await assertSucceeds(updateDoc(doc(db('rosa'), R('kvReserva', 'rsv_2')), { d: '{}', _u: 'u_rosa', _t: serverTimestamp(), estado: 'cancelada' }));
});
test('tienda: el vendedor solo maneja sus productos', async () => {
  await assertSucceeds(setDoc(doc(db('ven'), R('tiendaProductos', 'p1')), sobre('ven', {}, { vendedorId: 'u_ven' })));
  await assertFails(setDoc(doc(db('ven'), R('tiendaProductos', 'p2')), sobre('ven', {}, { vendedorId: 'u_otro' })));
});
test('portería: el vigilante no ve finanzas', async () => {
  await assertFails(getDocs(collection(db('vig'), R('cuotas'))));
  await assertFails(getDocs(collection(db('vig'), R('pagos'))));
});
test('lo que no está en las reglas queda cerrado', async () => {
  await assertFails(setDoc(doc(db('admin'), 'otraCosa/x'), { a: 1 }));
  await assertFails(setDoc(doc(db('admin'), R('auditoria', 'x')), { a: 1 }));
});
