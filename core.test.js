/* Pruebas de la lógica del servidor con un simulador en memoria (sin internet ni Firebase).
   Ejecutar: node functions/test/core.test.js */
'use strict';
const assert = require('assert');
const { crearCore, emailDe } = require('../core');

function memoria() {
  const docs = new Map(); const users = new Map(); const pushes = [];
  const matches = (data, filtros) => (filtros || []).every(([c, op, v]) => op === '==' ? data[c] === v : true);
  let t = 0;
  const A = {
    ts: () => ++t, now: () => new Date('2026-11-15T12:00:00Z'),
    db: {
      get: async p => docs.has(p) ? JSON.parse(JSON.stringify(docs.get(p))) : null,
      set: async (p, o) => { docs.set(p, JSON.parse(JSON.stringify(o))); },
      update: async (p, o) => { docs.set(p, Object.assign({}, docs.get(p) || {}, JSON.parse(JSON.stringify(o)))); },
      del: async p => { docs.delete(p); },
      query: async (col, f) => [...docs.entries()].filter(([p]) => p.startsWith(col + '/') && p.split('/').length === col.split('/').length + 1)
        .map(([p, d]) => ({ id: p.split('/').pop(), data: JSON.parse(JSON.stringify(d)) })).filter(x => matches(x.data, f)),
      deleteTree: async p => { [...docs.keys()].filter(k => k === p || k.startsWith(p + '/')).forEach(k => docs.delete(k)); },
    },
    auth: {
      create: async o => { if (users.has(o.uid)) { const e = new Error('uid'); e.code = 'auth/uid-already-exists'; throw e; } if ([...users.values()].some(u => u.email === o.email)) { const e = new Error('email'); e.code = 'auth/email-already-exists'; throw e; } users.set(o.uid, Object.assign({ claims: {} }, o)); },
      update: async (uid, o) => { const u = users.get(uid); if (!u) { const e = new Error('nf'); e.code = 'auth/user-not-found'; throw e; } Object.assign(u, o); },
      remove: async uid => { if (!users.delete(uid)) { const e = new Error('nf'); e.code = 'auth/user-not-found'; throw e; } },
      claims: async (uid, c) => { users.get(uid).claims = c; },
      byEmail: async e => [...users.values()].find(u => u.email === e) || null,
      revoke: async () => {},
    },
    push: async (tokens, m) => { pushes.push({ tokens, m }); return tokens.filter(x => x.startsWith('malo')); },
  };
  return { A, docs, users, pushes };
}
const env = (o, prom) => { const r = { d: JSON.stringify(o), _u: 'x', _t: 0 }; (prom || []).forEach(k => r[k] = o[k] === undefined ? null : o[k]); return r; };

async function esperaError(p, code) { try { await p; } catch (e) { assert.strictEqual(e.code, code, 'código esperado ' + code + ' y fue ' + e.code + ': ' + e.message); return e; } throw new Error('Se esperaba error ' + code); }

(async () => {
  const M = memoria(); const C = crearCore(M.A); let n = 0; const ok = m => { n++; console.log('✓', m); };
  const owner = { uid: 'own', token: { email: 'msalinas8811@gmail.com' } };
  const rid = 'r1';
  await M.A.db.set('r/r1', { nombre: 'Los Almendros', estado: 'activa' });
  await M.A.db.set('r/r1/meta/config', env({ v: { cuota: 35, diaVence: 10 } }));
  await M.A.db.set('r/r1/meta/inicioCobro', env({ v: '2026-10' }));
  for (const c of ['c1', 'c2', 'c3']) await M.A.db.set('r/r1/casas/' + c, env({ id: c, numero: c.slice(1), pasaje: 'Polígono A', duenoId: c === 'c1' ? 'u_c1' : null }, ['numero', 'pasaje', 'duenoId']));
  await M.A.db.set('r/r1/casasPriv/c2', env({ id: 'c2', codigo: 'ABC123' }));

  // Dueño crea admin (clave antigua corta permitida solo en migración)
  await esperaError(C.usuarios({ rid, accion: 'crear', usuario: { id: 'u_admin', rol: 'admin', nombre: 'Lucía', user: 'admin', pass: '1234' } }, owner), 'invalid-argument');
  let r = await C.usuarios({ rid, accion: 'crear', legado: true, usuarios: [{ id: 'u_admin', rol: 'admin', nombre: 'Lucía', user: 'Admin', pass: '1234', tel: '7000-2222' }] }, owner);
  assert.ok(r.res[0].ok); assert.strictEqual(M.users.get('u_admin').email, emailDe('admin', 'r1')); assert.deepStrictEqual(M.users.get('u_admin').claims, { rid: 'r1', rol: 'admin', casa: '' });
  const mAdm = await M.A.db.get('r/r1/miembros/u_admin'); assert.strictEqual(mAdm.rol, 'admin'); assert.ok(!JSON.parse(mAdm.d).tel, 'teléfono no va en miembros');
  assert.strictEqual(JSON.parse((await M.A.db.get('r/r1/perfiles/u_admin')).d).tel, '7000-2222'); assert.ok(!JSON.parse((await M.A.db.get('r/r1/perfiles/u_admin')).d).pass, 'nunca se guarda la clave');
  ok('el dueño crea el admin; teléfono en perfil privado; la clave no se guarda');

  const adm = { uid: 'u_admin', token: { rid: 'r1', rol: 'admin', casa: '' } };
  await C.usuarios({ rid, accion: 'crear', usuario: { id: 'u_c1', rol: 'residente', nombre: 'Marta', user: 'casa1', pass: 'secreta1', casaId: 'c1', dui: '01234567-8' } }, adm);
  await esperaError(C.usuarios({ rid, accion: 'crear', usuario: { id: 'u_c1b', rol: 'residente', nombre: 'Otra', user: 'CASA1', pass: 'secreta1', casaId: 'c1' } }, adm), 'already-exists');
  ok('usuario repetido rechazado (sin importar mayúsculas)');

  const res1 = { uid: 'u_c1', token: { rid: 'r1', rol: 'residente', casa: 'c1' } };
  await esperaError(C.usuarios({ rid, accion: 'crear', usuario: { id: 'u_v2', rol: 'vigilante', nombre: 'X', user: 'vig2', pass: 'secreta1' } }, res1), 'permission-denied');
  await esperaError(C.usuarios({ rid, accion: 'crear', usuario: { id: 'u_i2', rol: 'inquilino', nombre: 'X', user: 'inq2', pass: 'secreta1', casaId: 'c2', padreId: 'u_c1' } }, res1), 'permission-denied');
  await C.usuarios({ rid, accion: 'crear', usuario: { id: 'u_i1', rol: 'inquilino', nombre: 'Pedro', user: 'inq1', pass: 'secreta1', casaId: 'c1', padreId: 'u_c1', hasta: '2026-11-01' } }, res1);
  ok('el residente solo crea inquilinos de su propia casa');

  await esperaError(C.usuarios({ rid: 'r2', accion: 'crear', usuario: { id: 'u_z', rol: 'admin', nombre: 'Z', user: 'z', pass: 'secreta1' } }, adm), 'permission-denied');
  ok('un admin no puede tocar otra residencial');

  await C.usuarios({ rid, accion: 'clave', uid: 'u_i1', pass: 'nueva123' }, res1);
  assert.strictEqual(M.users.get('u_i1').password, 'gw:nueva123');
  await esperaError(C.usuarios({ rid, accion: 'clave', uid: 'u_admin', pass: 'nueva123' }, res1), 'permission-denied');
  ok('cambio de clave: propio inquilino sí, admin ajeno no');

  await C.usuarios({ rid, accion: 'actualizar', uid: 'u_c1', cambios: { casaId: 'c3' } }, adm);
  assert.strictEqual(M.users.get('u_c1').claims.casa, 'c3');
  await C.usuarios({ rid, accion: 'actualizar', uid: 'u_c1', cambios: { casaId: 'c1', user: 'marta' } }, adm);
  assert.strictEqual(M.users.get('u_c1').email, emailDe('marta', 'r1'));
  ok('cambiar casa o usuario actualiza permisos y correo interno');

  // Registro de propietario sin sesión
  const info = await C.registroInfo({ rid });
  assert.strictEqual(info.casas.length, 3); assert.ok(!JSON.stringify(info).includes('ABC123'), 'no expone el código');
  await esperaError(C.registro({ rid, casaId: 'c2', codigo: 'MAL', user: 'nuevo', pass: 'secreta1', nombre: 'Ana' }), 'permission-denied');
  const rg = await C.registro({ rid, casaId: 'c2', codigo: 'abc123', user: 'nuevo', pass: 'secreta1', nombre: 'Ana', dui: '01234567-8', familia: 'Flores' });
  const sol = await M.A.db.get('r/r1/solicitudes/' + rg.id);
  assert.strictEqual(sol.estado, 'pendiente'); assert.ok(!sol.d.includes('secreta1'), 'la solicitud no guarda la clave');
  const sUid = JSON.parse(sol.d).uid; assert.strictEqual(M.users.get(sUid).disabled, true);
  await esperaError(C.registro({ rid, casaId: 'c2', codigo: 'ABC123', user: 'otro', pass: 'secreta1', nombre: 'B' }), 'already-exists');
  const notAdm = await M.A.db.query('r/r1/notifs', [['userId', '==', 'u_admin']]); assert.strictEqual(notAdm.length, 1);
  ok('registro: valida código, crea cuenta desactivada, avisa a la administración');

  await esperaError(C.aprobarRegistro({ rid, solId: rg.id }, res1), 'permission-denied');
  await C.aprobarRegistro({ rid, solId: rg.id }, adm);
  assert.strictEqual(M.users.get(sUid).disabled, false); assert.strictEqual(M.users.get(sUid).claims.casa, 'c2');
  assert.strictEqual((await M.A.db.get('r/r1/casas/c2')).duenoId, sUid);
  assert.notStrictEqual(JSON.parse((await M.A.db.get('r/r1/casasPriv/c2')).d).codigo, 'ABC123');
  ok('aprobar: activa la cuenta, asigna la casa y renueva el código');

  // Rechazo borra la cuenta pendiente
  await M.A.db.set('r/r1/casasPriv/c3', env({ id: 'c3', codigo: 'ZZZ999' }));
  const rg2 = await C.registro({ rid, casaId: 'c3', codigo: 'ZZZ999', user: 'tres', pass: 'secreta1', nombre: 'Tres' });
  const antes = await M.A.db.get('r/r1/solicitudes/' + rg2.id); const s2 = JSON.parse(antes.d); const despues = Object.assign({}, antes, { estado: 'rechazada' });
  await C.onSolicitudCambio(rid, rg2.id, antes, despues); assert.ok(!M.users.has(s2.uid));
  ok('rechazar una solicitud elimina la cuenta pendiente');

  // Desactivar miembro desactiva Authentication
  const mi = await M.A.db.get('r/r1/miembros/u_i1'); const mi2 = Object.assign({}, mi, { activo: false });
  await C.onMiembroCambio(rid, 'u_i1', mi, mi2); assert.strictEqual(M.users.get('u_i1').disabled, true);
  ok('desactivar un usuario bloquea su ingreso');

  // Tarea diaria: cuotas sin duplicar
  await M.A.db.set('r/r1/cuotas/vieja', env({ id: 'vieja', casaId: 'c1', periodo: '2026-11', monto: 35, estado: 'pendiente' }, ['casaId', 'periodo', 'estado', 'monto']));
  let d1 = await C.diario(-6); assert.strictEqual(d1.r1.creadas, 2);
  let d2 = await C.diario(-6); assert.strictEqual(d2.r1.creadas, 0);
  assert.strictEqual(d1.r1.stats.casas, 3);
  ok('cuotas del mes: crea las que faltan y no duplica');

  // Inquilino vencido
  await M.A.db.set('r/r1/miembros/u_i1', Object.assign(mi, { activo: true }));
  const d3 = await C.diario(-6); assert.strictEqual(d3.r1.vencidos, 1);
  ok('inquilinos con acceso vencido se desactivan solos');

  // Push
  await M.A.db.set('tokens/u_c1', { tokens: ['bueno1', 'malo1'] });
  const pr = await C.onNotifCreada(rid, 'n1', env({ userId: 'u_c1', titulo: 'Hola', texto: 'Visita en portería', accion: { tab: 'accesos' } }, ['userId']));
  assert.strictEqual(pr.enviados, 1); assert.deepStrictEqual((await M.A.db.get('tokens/u_c1')).tokens, ['bueno1']);
  ok('notificación push enviada y token vencido limpiado');

  // Suspensión
  await C.onResidencialCambio(rid, { estado: 'activa' }, { estado: 'suspendida' });
  assert.ok([...M.users.values()].filter(u => u.claims.rid === 'r1').every(u => u.disabled));
  await C.onResidencialCambio(rid, { estado: 'suspendida' }, { estado: 'activa' });
  assert.strictEqual(M.users.get('u_c1').disabled, false);
  ok('suspender la residencial bloquea a todos; reactivarla los desbloquea');

  // Eliminar mi cuenta
  await C.eliminarMiCuenta({}, { uid: sUid, token: { rid: 'r1', rol: 'residente', casa: 'c2' } });
  assert.ok(!M.users.has(sUid)); assert.strictEqual(await M.A.db.get('r/r1/perfiles/' + sUid), null);
  assert.ok(![...M.docs.entries()].some(([k, v]) => k.startsWith('r/r1/solicitudes/') && JSON.parse(v.d).uid === sUid), 'quedaron fotos de verificación');
  assert.ok(![...M.docs.entries()].some(([k, v]) => k.startsWith('r/r1/notifs/') && v.userId === sUid), 'quedaron notificaciones');
  ok('eliminar mi cuenta borra el acceso y los datos personales');

  await esperaError(C.eliminarResidencial({ rid }, adm), 'permission-denied');
  await C.eliminarResidencial({ rid }, owner);
  assert.strictEqual([...M.docs.keys()].filter(k => k.startsWith('r/r1')).length, 0);
  ok('solo el dueño de la app elimina una residencial completa');

  console.log(`\n${n} pruebas del servidor correctas`);
})().catch(e => { console.error('✗', e); process.exit(1); });
