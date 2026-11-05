/* =====================================================================
   GateWise · Lógica del servidor (Cloud Functions)
   Este archivo no depende de Firebase: recibe un "adaptador" con la base
   de datos, Authentication y mensajería. index.js lo conecta con los
   servicios reales; las pruebas lo conectan con un simulador.

   Adaptador esperado:
     db.get(path)               -> objeto | null
     db.set(path, obj)          (reemplaza)
     db.update(path, obj)       (combina)
     db.del(path)
     db.query(colPath, [[campo, op, valor], ...]) -> [{id, data}]
     db.deleteTree(path)        borra un documento y todo lo que tenga debajo
     auth.create({uid,email,password,displayName,disabled})
     auth.update(uid, {password?, email?, disabled?, displayName?})
     auth.remove(uid)
     auth.claims(uid, obj)
     auth.byEmail(email)        -> {uid} | null
     auth.revoke(uid)
     push(tokens, {title, body, data}) -> [tokens inválidos]
     ts()                       hora del servidor
     now()                      Date actual
   ===================================================================== */
'use strict';
const OWNER = 'msalinas8811@gmail.com';
const PROM = {
  miembros: ['rol', 'casaId', 'padreId', 'activo', 'nombre'],
  perfiles: [],
  casas: ['numero', 'pasaje', 'duenoId'],
  casasPriv: [],
  cuotas: ['casaId', 'periodo', 'estado', 'monto'],
  solicitudes: ['casaId', 'estado'],
  notifs: ['userId', 'leida'],
};
const PRIV_U = ['tel', 'dui', 'email', 'user', 'pass'];
const ROLES = ['admin', 'residente', 'inquilino', 'vigilante', 'cobrador', 'vendedor'];

function slugUser(u) {
  return String(u || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 60);
}
function emailDe(user, rid) { return slugUser(user) + '@' + String(rid).toLowerCase().replace(/[^a-z0-9-]/g, '') + '.u.gatewise.app'; }
// La clave que escribe la persona se transforma igual en la app y aquí,
// para cumplir el mínimo de 6 caracteres de Firebase con claves cortas antiguas.
function claveAuth(p) { return 'gw:' + String(p || ''); }

function crearCore(A) {
  const err = (code, msg) => { const e = new Error(msg); e.code = code; throw e; };
  const isOwner = ctx => !!(ctx && ctx.token && String(ctx.token.email || '').toLowerCase() === OWNER);
  function quien(ctx) {
    if (!ctx || !ctx.uid) err('unauthenticated', 'Inicia sesión para continuar');
    const t = ctx.token || {};
    return { uid: ctx.uid, owner: isOwner(ctx), rid: t.rid || '', rol: t.rol || '', casa: t.casa || '' };
  }
  const rp = (rid, ...p) => ['r', rid, ...p].join('/');
  function env(rec, prom, uid) {
    const r = JSON.parse(JSON.stringify(rec || {}));
    const o = { d: JSON.stringify(r), _u: uid, _t: A.ts() };
    (prom || []).forEach(k => { o[k] = r[k] === undefined ? null : r[k]; });
    return o;
  }
  function leer(doc) {
    if (!doc) return null;
    let r = {}; try { r = JSON.parse(doc.d || '{}'); } catch (e) { r = {}; }
    Object.keys(doc).forEach(k => { if (k !== 'd' && k[0] !== '_') r[k] = doc[k]; });
    return r;
  }
  function partirUsuario(u) {
    const pub = {}, priv = {};
    Object.keys(u || {}).forEach(k => { if (PRIV_U.includes(k)) { if (k !== 'pass') priv[k] = u[k]; } else pub[k] = u[k]; });
    if (u.rol === 'vendedor' && u.tel) pub.tel = u.tel;   // el teléfono del negocio es público
    return { pub, priv };
  }
  const idValido = s => typeof s === 'string' && /^[A-Za-z0-9_-]{2,80}$/.test(s);
  const hoy = () => { const d = A.now(); return d.toISOString().slice(0, 10); };
  function ymdLocal(d, off) { const x = new Date(d.getTime() + off * 3600000); return x.toISOString().slice(0, 10); }
  const periodoDe = f => f.slice(0, 7);
  async function admins(rid) { return (await A.db.query(rp(rid, 'miembros'), [['rol', '==', 'admin'], ['activo', '==', true]])).map(x => x.id); }
  async function notificar(rid, ids, titulo, texto, accion, autor) {
    const f = A.now().toISOString().slice(0, 16);
    for (const u of [...new Set(ids)]) {
      const id = 'n' + Math.random().toString(36).slice(2, 12);
      await A.db.set(rp(rid, 'notifs', id), env({ id, userId: u, titulo, texto, accion: accion || null, leida: false, fecha: f }, PROM.notifs, autor || 'sistema'));
    }
  }

  /* ---------------- Usuarios ---------------- */
  async function crearUno(rid, u, c, admin, legado) {
    u = Object.assign({}, u, { activo: !u || u.activo !== false });
    if (!u || !idValido(u.id)) err('invalid-argument', 'Identificador de usuario no válido');
    if (!u.user || !String(u.user).trim()) err('invalid-argument', 'Falta el usuario');
    if (!ROLES.includes(u.rol)) err('invalid-argument', 'Rol no válido');
    const pass = String(u.pass || '');
    if (!legado && pass.length < 6) err('invalid-argument', 'La clave debe tener al menos 6 caracteres');
    if (legado && pass.length < 1) err('invalid-argument', 'Falta la clave de ' + u.user);
    if (!admin) {
      if (!(c.rol === 'residente' && u.rol === 'inquilino' && u.casaId === c.casa && u.padreId === c.uid))
        err('permission-denied', 'No tienes permiso para crear este usuario');
    }
    const email = emailDe(u.user, rid);
    if (await A.auth.byEmail(email)) err('already-exists', 'El usuario "' + u.user + '" ya existe en esta residencial');
    await A.auth.create({ uid: u.id, email, password: claveAuth(pass), displayName: String(u.nombre || u.user).slice(0, 100), disabled: u.activo === false });
    await A.auth.claims(u.id, { rid, rol: u.rol, casa: u.casaId || '' });
    const { pub, priv } = partirUsuario(Object.assign({}, u, { user: String(u.user).trim().toLowerCase() }));
    await A.db.set(rp(rid, 'miembros', u.id), env(pub, PROM.miembros, c.uid));
    await A.db.set(rp(rid, 'perfiles', u.id), env(priv, PROM.perfiles, c.uid));
    return { uid: u.id };
  }

  async function usuarios(data, ctx) {
    const c = quien(ctx);
    const rid = data && data.rid;
    if (!rid || !idValido(rid)) err('invalid-argument', 'Falta la residencial');
    if (!c.owner && c.rid !== rid) err('permission-denied', 'No perteneces a esta residencial');
    const admin = c.owner || c.rol === 'admin';
    const accion = data.accion;

    if (accion === 'crear') {
      const lista = data.usuarios || (data.usuario ? [data.usuario] : []);
      if (!lista.length) err('invalid-argument', 'No hay usuarios para crear');
      if (lista.length > 500) err('invalid-argument', 'Máximo 500 usuarios por envío');
      const legado = !!data.legado && c.owner;
      const res = [];
      for (const u of lista) {
        try { res.push(Object.assign({ id: u.id, ok: true }, await crearUno(rid, u, c, admin, legado))); }
        catch (e) { if (lista.length === 1) throw e; res.push({ id: u && u.id, ok: false, error: e.message }); }
      }
      return { ok: true, res };
    }

    const uidT = data.uid;
    if (!idValido(uidT)) err('invalid-argument', 'Usuario no válido');
    const mDoc = await A.db.get(rp(rid, 'miembros', uidT));
    if (!mDoc) err('not-found', 'El usuario no existe');
    const m = leer(mDoc);
    const esPadre = c.rol === 'residente' && m.padreId === c.uid;

    if (accion === 'clave') {
      if (!(admin || c.uid === uidT || esPadre)) err('permission-denied', 'No puedes cambiar esta clave');
      const p = String(data.pass || '');
      if (p.length < 6) err('invalid-argument', 'La clave debe tener al menos 6 caracteres');
      await A.auth.update(uidT, { password: claveAuth(p) });
      return { ok: true };
    }
    if (accion === 'actualizar') {
      const cb = data.cambios || {};
      if (!admin) {
        if (!(esPadre && Object.keys(cb).every(k => ['nombre', 'tel', 'dui', 'hasta', 'activo', 'email'].includes(k))))
          err('permission-denied', 'No puedes modificar este usuario');
      }
      if (cb.rol !== undefined && !ROLES.includes(cb.rol)) err('invalid-argument', 'Rol no válido');
      const pDoc = await A.db.get(rp(rid, 'perfiles', uidT));
      const full = Object.assign({}, m, leer(pDoc) || {}, cb);
      if (cb.user !== undefined) {
        const email = emailDe(cb.user, rid);
        const otro = await A.auth.byEmail(email);
        if (otro && otro.uid !== uidT) err('already-exists', 'El usuario "' + cb.user + '" ya existe');
        await A.auth.update(uidT, { email });
        full.user = String(cb.user).trim().toLowerCase();
      }
      if (cb.rol !== undefined || cb.casaId !== undefined) await A.auth.claims(uidT, { rid, rol: full.rol, casa: full.casaId || '' });
      const { pub, priv } = partirUsuario(full);
      await A.db.set(rp(rid, 'miembros', uidT), env(pub, PROM.miembros, c.uid));
      await A.db.set(rp(rid, 'perfiles', uidT), env(priv, PROM.perfiles, c.uid));
      return { ok: true };
    }
    if (accion === 'borrar') {
      if (!(admin || esPadre)) err('permission-denied', 'No puedes borrar este usuario');
      if (uidT === c.uid) err('failed-precondition', 'No puedes borrar tu propio usuario aquí');
      try { await A.auth.remove(uidT); } catch (e) { /* ya no existía en Authentication */ }
      await A.db.del(rp(rid, 'miembros', uidT));
      await A.db.del(rp(rid, 'perfiles', uidT));
      await A.db.del('tokens/' + uidT);
      return { ok: true };
    }
    err('invalid-argument', 'Acción no válida');
  }

  /* ---------------- Registro de propietarios (sin sesión) ---------------- */
  async function residencialAbierta(rid) {
    if (!idValido(rid)) err('invalid-argument', 'Residencial no válida');
    const r = await A.db.get('r/' + rid);
    if (!r) err('not-found', 'Residencial no encontrada');
    if (r.estado === 'suspendida') err('failed-precondition', 'El servicio de esta residencial está suspendido');
    return r;
  }
  async function registroInfo(data) {
    const rid = data && data.rid; await residencialAbierta(rid);
    const casas = await A.db.query(rp(rid, 'casas'), []);
    return { casas: casas.map(x => { const c = leer(x.data); return { id: x.id, numero: c.numero, pasaje: c.pasaje, torre: c.torre || null, piso: c.piso || null, ocupada: !!c.duenoId }; }) };
  }
  async function registro(data) {
    const d = data || {};
    const rid = d.rid; await residencialAbierta(rid);
    if (JSON.stringify(d).length > 900000) err('invalid-argument', 'Las fotos o documentos son muy pesados. Usa fotos más livianas.');
    if (!idValido(d.casaId)) err('invalid-argument', 'Elige tu casa');
    const casaDoc = await A.db.get(rp(rid, 'casas', d.casaId));
    if (!casaDoc) err('not-found', 'Casa no encontrada');
    const priv = leer(await A.db.get(rp(rid, 'casasPriv', d.casaId))) || {};
    if (!priv.codigo || String(d.codigo || '').trim().toUpperCase() !== String(priv.codigo).toUpperCase())
      err('permission-denied', 'El código no coincide con la casa seleccionada');
    const user = String(d.user || '').trim().toLowerCase();
    if (!user) err('invalid-argument', 'Escribe tu usuario');
    if (String(d.pass || '').length < 6) err('invalid-argument', 'La clave debe tener al menos 6 caracteres');
    const pend = await A.db.query(rp(rid, 'solicitudes'), [['casaId', '==', d.casaId], ['estado', '==', 'pendiente']]);
    if (pend.length) err('already-exists', 'Ya hay una solicitud pendiente para esa casa');
    const email = emailDe(user, rid);
    if (await A.auth.byEmail(email)) err('already-exists', 'Ese usuario ya existe, elige otro');
    const uidN = 'u_' + Math.random().toString(36).slice(2, 12);
    await A.auth.create({ uid: uidN, email, password: claveAuth(d.pass), displayName: String(d.nombre || user).slice(0, 100), disabled: true });
    const sid = 's' + Math.random().toString(36).slice(2, 12);
    const rec = Object.assign({}, d, { id: sid, uid: uidN, user, estado: 'pendiente', fecha: A.now().toISOString().slice(0, 16) });
    delete rec.pass; delete rec.codigo; delete rec.rid;
    await A.db.set(rp(rid, 'solicitudes', sid), env(rec, PROM.solicitudes, 'registro'));
    const c = leer(casaDoc);
    await notificar(rid, await admins(rid), '🏠 Nueva solicitud de registro', `${rec.nombre || user} pide ser propietario de la casa ${c.numero}${c.pasaje ? ' · ' + c.pasaje : ''}.`, { tab: 'solicitudes' });
    return { ok: true, id: sid };
  }
  async function aprobarRegistro(data, ctx) {
    const c = quien(ctx); const rid = data && data.rid;
    if (!(c.owner || (c.rid === rid && c.rol === 'admin'))) err('permission-denied', 'Solo la administración aprueba registros');
    const sDoc = await A.db.get(rp(rid, 'solicitudes', data.solId));
    if (!sDoc) err('not-found', 'Solicitud no encontrada');
    const s = leer(sDoc);
    if (s.estado !== 'pendiente') err('failed-precondition', 'Esta solicitud ya fue atendida');
    const casaDoc = await A.db.get(rp(rid, 'casas', s.casaId));
    if (!casaDoc) err('not-found', 'La casa ya no existe');
    const casa = leer(casaDoc);
    if (casa.duenoId && !data.reemplazar) err('failed-precondition', 'La casa ya tiene propietario');
    if (casa.duenoId) {
      const viejos = (await A.db.query(rp(rid, 'miembros'), [['casaId', '==', s.casaId]])).filter(x => {
        const m = leer(x.data); return x.id === casa.duenoId || (m.rol === 'inquilino' && m.padreId === casa.duenoId);
      });
      for (const x of viejos) { const m = leer(x.data); m.activo = false; await A.db.set(rp(rid, 'miembros', x.id), env(m, PROM.miembros, c.uid)); }
    }
    const u = { id: s.uid, rol: 'residente', nombre: s.nombre, casaId: s.casaId, activo: true, foto: s.foto || null, user: s.user, tel: s.tel || '', email: s.email || '', dui: s.dui || '' };
    await A.auth.update(s.uid, { disabled: false });
    await A.auth.claims(s.uid, { rid, rol: 'residente', casa: s.casaId });
    const { pub, priv } = partirUsuario(u);
    await A.db.set(rp(rid, 'miembros', s.uid), env(pub, PROM.miembros, c.uid));
    await A.db.set(rp(rid, 'perfiles', s.uid), env(priv, PROM.perfiles, c.uid));
    casa.duenoId = s.uid; if (s.familia) casa.familia = s.familia;
    await A.db.set(rp(rid, 'casas', s.casaId), env(casa, PROM.casas, c.uid));
    const cp = leer(await A.db.get(rp(rid, 'casasPriv', s.casaId))) || { id: s.casaId };
    cp.codigo = Math.random().toString(36).slice(2, 8).toUpperCase();
    await A.db.set(rp(rid, 'casasPriv', s.casaId), env(cp, PROM.casasPriv, c.uid));
    s.estado = 'aprobada'; s.resp = A.now().toISOString().slice(0, 16);
    await A.db.set(rp(rid, 'solicitudes', s.id), env(s, PROM.solicitudes, c.uid));
    await notificar(rid, [s.uid], '🎉 Cuenta aprobada', 'Bienvenido(a). Ya puedes gestionar accesos, pagos y reportes de tu casa.', null, c.uid);
    return { ok: true, uid: s.uid };
  }

  /* ---------------- Cuenta propia y residencial ---------------- */
  async function eliminarMiCuenta(data, ctx) {
    const c = quien(ctx);
    if (c.owner) err('failed-precondition', 'La cuenta del Administrador de la APP no se elimina desde aquí');
    const rid = c.rid; if (!rid) err('failed-precondition', 'Cuenta sin residencial');
    const m = leer(await A.db.get(rp(rid, 'miembros', c.uid)));
    if (m) { m.activo = false; m.eliminado = A.now().toISOString().slice(0, 10); delete m.foto; await A.db.set(rp(rid, 'miembros', c.uid), env(m, PROM.miembros, c.uid)); }
    await A.db.del(rp(rid, 'perfiles', c.uid));
    await A.db.del('tokens/' + c.uid);
    // fotos de verificación de su registro y sus notificaciones
    if (m && m.casaId) for (const x of await A.db.query(rp(rid, 'solicitudes'), [['casaId', '==', m.casaId]])) { if ((leer(x.data) || {}).uid === c.uid) await A.db.del(rp(rid, 'solicitudes', x.id)); }
    for (const x of await A.db.query(rp(rid, 'notifs'), [['userId', '==', c.uid]])) await A.db.del(rp(rid, 'notifs', x.id));
    await notificar(rid, await admins(rid), 'Cuenta eliminada', `${(m && m.nombre) || 'Un usuario'} eliminó su cuenta de la app.`, { tab: 'casas' });
    try { await A.auth.remove(c.uid); } catch (e) { /* ya no existía */ }
    return { ok: true };
  }
  async function eliminarResidencial(data, ctx) {
    const c = quien(ctx); if (!c.owner) err('permission-denied', 'Solo el Administrador de la APP');
    const rid = data && data.rid; if (!idValido(rid)) err('invalid-argument', 'Residencial no válida');
    const ms = await A.db.query(rp(rid, 'miembros'), []);
    for (const x of ms) { try { await A.auth.remove(x.id); } catch (e) { /* */ } await A.db.del('tokens/' + x.id); }
    await A.db.deleteTree('r/' + rid);
    return { ok: true, usuarios: ms.length };
  }

  /* ---------------- Disparadores ---------------- */
  async function onNotifCreada(rid, id, doc) {
    const n = leer(doc); if (!n || !n.userId) return { enviados: 0 };
    const t = await A.db.get('tokens/' + n.userId);
    const tokens = (t && Array.isArray(t.tokens)) ? t.tokens : [];
    if (!tokens.length) return { enviados: 0 };
    const malos = await A.push(tokens, { title: String(n.titulo || 'GateWise').slice(0, 120), body: String(n.texto || '').slice(0, 240), data: { rid, tab: String((n.accion && n.accion.tab) || 'inicio') } });
    if (malos && malos.length) await A.db.update('tokens/' + n.userId, { tokens: tokens.filter(x => !malos.includes(x)) });
    return { enviados: tokens.length - ((malos && malos.length) || 0) };
  }
  async function onMiembroCambio(rid, uidT, antes, despues) {
    if (!despues) return;
    const a = leer(antes) || {}, b = leer(despues);
    if (a.activo !== b.activo) {
      const r = await A.db.get('r/' + rid);
      const suspendida = r && r.estado === 'suspendida';
      try {
        await A.auth.update(uidT, { disabled: b.activo === false || suspendida });
        if (b.activo === false) await A.auth.revoke(uidT);
      } catch (e) { /* el usuario puede no existir en Authentication */ }
    }
  }
  async function onResidencialCambio(rid, antes, despues) {
    if (!antes || !despues || antes.estado === despues.estado) return;
    const susp = despues.estado === 'suspendida';
    if (!susp && antes.estado !== 'suspendida') return;
    const ms = await A.db.query(rp(rid, 'miembros'), []);
    for (const x of ms) {
      const m = leer(x.data);
      try { await A.auth.update(x.id, { disabled: susp || m.activo === false }); if (susp) await A.auth.revoke(x.id); } catch (e) { /* */ }
    }
  }
  async function onSolicitudCambio(rid, id, antes, despues) {
    const a = leer(antes), b = leer(despues);
    if (a && b && a.estado === 'pendiente' && b.estado === 'rechazada' && b.uid) {
      try { await A.auth.remove(b.uid); } catch (e) { /* */ }
    }
  }

  /* ---------------- Tarea diaria ---------------- */
  async function diarioRes(rid, r, offset) {
    const hoyL = ymdLocal(A.now(), offset); const per = periodoDe(hoyL);
    const cfg = (leer(await A.db.get(rp(rid, 'meta', 'config'))) || {}).v || {};
    const ini = (leer(await A.db.get(rp(rid, 'meta', 'inicioCobro'))) || {}).v || per;
    const cuotaBase = Number(cfg.cuota || 0);
    const casas = (await A.db.query(rp(rid, 'casas'), [])).map(x => Object.assign({ id: x.id }, leer(x.data)));
    const ya = new Set((await A.db.query(rp(rid, 'cuotas'), [['periodo', '==', per]])).map(x => x.data.casaId));
    let creadas = 0;
    if (per >= ini && cuotaBase >= 0) {
      for (const c of casas) {
        if (ya.has(c.id)) continue;
        if (c.desde && c.desde > per) continue;
        const id = 'q_' + c.id + '_' + per;
        await A.db.set(rp(rid, 'cuotas', id), env({ id, casaId: c.id, periodo: per, monto: Number(c.cuota || cuotaBase), estado: 'pendiente' }, PROM.cuotas, 'sistema'));
        creadas++;
      }
    }
    // Inquilinos cuyo acceso venció
    let vencidos = 0;
    const inq = await A.db.query(rp(rid, 'miembros'), [['rol', '==', 'inquilino'], ['activo', '==', true]]);
    for (const x of inq) {
      const m = leer(x.data);
      if (m.hasta && m.hasta < hoyL) { m.activo = false; await A.db.set(rp(rid, 'miembros', x.id), env(m, PROM.miembros, 'sistema')); vencidos++; }
    }
    // Estadísticas para el panel del Administrador de la APP
    const dia = Number(cfg.diaVence || 10);
    const pend = await A.db.query(rp(rid, 'cuotas'), [['estado', '==', 'pendiente']]);
    const enMora = new Set(pend.filter(x => { const p = x.data.periodo; return p < per || (p === per && Number(hoyL.slice(8)) > dia); }).map(x => x.data.casaId));
    const ms = (await A.db.query(rp(rid, 'miembros'), [['activo', '==', true]]));
    const stats = { casas: casas.length, conDueno: casas.filter(c => c.duenoId).length, usuarios: ms.length, mora: enMora.size, fecha: hoyL };
    await A.db.update('r/' + rid, { stats });
    return { creadas, vencidos, stats };
  }
  async function diario(offsetHoras) {
    const off = offsetHoras === undefined ? -6 : offsetHoras;
    const rs = await A.db.query('r', []);
    const out = {};
    for (const x of rs) {
      if (x.data && x.data.estado === 'suspendida') continue;
      try { out[x.id] = await diarioRes(x.id, x.data, off); } catch (e) { out[x.id] = { error: e.message }; }
    }
    return out;
  }

  return { usuarios, registroInfo, registro, aprobarRegistro, eliminarMiCuenta, eliminarResidencial,
    onNotifCreada, onMiembroCambio, onResidencialCambio, onSolicitudCambio, diario, diarioRes,
    _util: { env, leer, partirUsuario, emailDe, claveAuth, slugUser } };
}

const api = { crearCore, emailDe, claveAuth, slugUser, PROM, OWNER };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.GW_CORE = api;
