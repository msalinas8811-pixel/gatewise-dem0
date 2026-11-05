/* =====================================================================
   GateWise · MODO PRODUCCIÓN
   Se activa solo si config.js tiene  window.GATEWISE_MODO = "produccion".
   - Ingreso con Firebase Authentication (usuario + clave; la clave nunca
     se guarda en la base de datos).
   - Cloud Firestore: cada registro es un documento; cada persona descarga
     solo lo que su rol le permite (las reglas lo hacen cumplir en el servidor).
   - Usuarios, registro de propietarios y bajas pasan por Cloud Functions.
   - Notificaciones push con Firebase Cloud Messaging.
   ===================================================================== */
(function () {
  if (window.GATEWISE_MODO !== 'produccion') return;
  const CFG = window.GATEWISE_FIREBASE_PROD || null;
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.5/';
  const OWNER_EMAIL = String(window.GATEWISE_OWNER_EMAIL || '').trim().toLowerCase();
  const REGION = 'us-east1';
  const PKEY_PROD = 'gw_prod_plat';

  /* ---------- Mapa de datos: colección de Firestore por clave de la app ---------- */
  const PROMC = {
    casas: ['numero', 'pasaje', 'duenoId'], casasPriv: [], miembros: ['rol', 'casaId', 'padreId', 'activo', 'nombre'], perfiles: [],
    cuotas: ['casaId', 'periodo', 'estado', 'monto'], pagos: ['casaId', 'estado', 'monto', 'metodo', 'cobradorId'],
    visitasCobro: ['casaId', 'estado', 'cobradorId'], cierres: ['cobradorId', 'estado'], pases: ['casaId'],
    autorizaciones: ['casaId', 'estado'], acadIngresos: [], avisos: [], reclamos: ['casaId'], notifs: ['userId', 'leida'],
    solicitudes: ['casaId', 'estado'], votaciones: [], eventos: [], areas: ['aprobacion'], academias: [],
    alumnos: ['casaId', 'tipo'], acadPagos: ['casaId', 'alumnoId'], resenas: ['userId', 'tipo', 'ref'],
    tiendaProductos: ['vendedorId'], tiendaPedidos: ['casaId', 'vendedorId', 'compradorId', 'estado'],
    kvVoto: ['casaId'], kvBoleta: [], kvRsvp: ['casaId'], kvEquipo: ['capId', 'casaId', 'estado'],
    kvReserva: ['casaId', 'estado', 'areaId'], kvSolAcad: ['casaId', 'estado'], meta: [],
  };
  const ARR = ['cuotas', 'pagos', 'visitasCobro', 'cierres', 'pases', 'autorizaciones', 'acadIngresos', 'avisos', 'reclamos', 'notifs', 'solicitudes', 'votaciones', 'eventos', 'areas', 'academias', 'alumnos', 'acadPagos', 'resenas'];
  const KVP = { vto: 'kvVoto', vtb: 'kvBoleta', evr: 'kvRsvp', evq: 'kvEquipo', rsv: 'kvReserva', acs: 'kvSolAcad' };
  const KVRE = /^(vto|vtb|evr|evq|rsv|acs)_/;
  const CASA_PRIV = ['codigo', 'prop', 'placas', 'habitantes', 'nota'];
  const U_PRIV = ['tel', 'dui', 'email', 'user'];
  const TODAS = Object.keys(PROMC).filter(c => c !== 'meta').concat(['meta']);

  /* ---------- Utilidades (deben coincidir con functions/core.js) ---------- */
  const slugUser = u => String(u || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '').slice(0, 60);
  const emailDe = (user, rid) => slugUser(user) + '@' + String(rid).toLowerCase().replace(/[^a-z0-9-]/g, '') + '.u.gatewise.app';
  const claveAuth = p => 'gw:' + String(p || '');
  function ordenar(v) { if (Array.isArray(v)) return v.map(x => x === undefined ? null : ordenar(x)); if (v && typeof v === 'object') { const o = {}; Object.keys(v).sort().forEach(k => { if (v[k] !== undefined && typeof v[k] !== 'function') o[k] = ordenar(v[k]); }); return o; } return v; }
  const estable = o => JSON.stringify(ordenar(o));
  const clon = o => JSON.parse(JSON.stringify(o));
  const RP = (rid, ...p) => ['r', rid, ...p].join('/');
  const partesDe = path => { const s = path.split('/'); return { rid: s[1], col: s[2], id: s.slice(3).join('/') }; };

  const P = {
    app: null, auth: null, fs: null, fn: null, msg: null, on: false,
    rid: null, rol: null, uid: null, claims: {}, owner: false, listo: false,
    server: new Map(), sent: new Map(), subs: [], cargadas: new Set(), pend: { casasPriv: new Map(), perfiles: new Map() },
    creando: new Set(), timer: null, corriendo: false, otraVez: false, avisos: new Set(), cache: {}, platSent: {}, resDocs: {}, perfilSubs: new Set(),
  };
  window.GW_PROD = P;
  const FS = () => P.fs;
  const avisarUnaVez = (k, t) => { if (P.avisos.has(k)) return; P.avisos.add(k); setTimeout(() => P.avisos.delete(k), 8000); toast(t); };

  /* ---------- Documento <-> registro ---------- */
  function sobre(col, rec) {
    const r = ordenar(rec);
    const o = { d: JSON.stringify(r), _u: P.uid, _t: firebase.firestore.FieldValue.serverTimestamp() };
    (PROMC[col] || []).forEach(k => { if (r[k] !== undefined) o[k] = r[k]; });
    return o;
  }
  function leerDoc(data) {
    let r = {}; try { r = JSON.parse(data.d || '{}'); } catch (e) { r = {}; }
    Object.keys(data).forEach(k => { if (k !== 'd' && k[0] !== '_') r[k] = data[k]; });
    return r;
  }
  const kvCol = k => KVP[k.slice(0, 3)];
  function kvRec(k, v) {
    const o = (v && typeof v === 'object' && !Array.isArray(v)) ? Object.assign({}, v) : { __v: v };
    if (/^(vto|evr)_/.test(k)) o.casaId = k.slice(k.lastIndexOf('_') + 1);
    return o;
  }
  function partirCasa(c) { const pub = {}, priv = { id: c.id }; Object.keys(c).forEach(k => { if (CASA_PRIV.includes(k)) priv[k] = c[k]; else pub[k] = c[k]; }); return { pub, priv }; }
  function partirU(u) {
    const pub = {}, priv = {};
    Object.keys(u).forEach(k => { if (k === 'pass') return; if (U_PRIV.includes(k)) priv[k] = u[k]; else pub[k] = u[k]; });
    if (u.rol === 'vendedor' && u.tel) pub.tel = u.tel;
    return { pub, priv };
  }
  const reemplazar = (obj, rec, conservar) => { Object.keys(obj).forEach(k => { if (!(k in rec) && !(conservar || []).includes(k)) delete obj[k]; }); Object.assign(obj, rec); return obj; };

  /* ---------- Esqueleto vacío de una residencial ---------- */
  function esqueleto(rid) {
    const pub = ((PLAT && PLAT.residenciales) || []).find(r => r.id === rid) || {};
    return {
      version: 1, inicioCobro: periodoActual(),
      residencial: { nombre: pub.nombre || '', municipio: pub.municipio || '', tipo: pub.tipo || 'residencial', pais: pub.pais || 'SV', portones: [], equipo: [], banco: {}, vigilancia: {}, presidente: {}, admin: {}, portonTipo: {} },
      config: { cuota: 0, diaVence: 10, recargo: 0, linkPago: '', diasAviso: 5 },
      casas: [], usuarios: [], cuotas: [], pagos: [], pases: [], avisos: [], reclamos: [], notifs: [], solicitudes: [], autorizaciones: [],
      recordados: {}, recaudoBase: {}, visitasCobro: [], reciboSeq: 0, cierres: [], directorio: { emergencia: [], servicios: [] },
      tienda: { seq: 0, productos: [], pedidos: [] }, resenas: [], votaciones: [], areas: [], academias: [], alumnos: [], acadPagos: [], acadIngresos: [], eventos: [],
      tiendaSeeded: true, comunidadSeed: true,
    };
  }

  /* ---------- Aplicar un documento del servidor a un DB en memoria ---------- */
  function aplicar(D, path, rec) {
    const { col, id } = partesDe(path);
    const arrPut = (arr, r) => { const i = arr.findIndex(x => x && String(x.id) === String(id)); if (!r) { if (i >= 0) arr.splice(i, 1); return; } if (i >= 0) reemplazar(arr[i], r); else if (r.fecha) arr.unshift(r); else arr.push(r); };
    if (ARR.includes(col)) { D[col] = D[col] || []; arrPut(D[col], rec); return; }
    if (col === 'casas') {
      D.casas = D.casas || [];
      const i = D.casas.findIndex(x => x.id === id);
      if (!rec) { if (i >= 0) D.casas.splice(i, 1); return; }
      if (i >= 0) reemplazar(D.casas[i], rec, CASA_PRIV); else { D.casas.push(rec); }
      const pp = P.pend.casasPriv.get(D === DB ? id : '!'); if (pp) { Object.assign(rec, pp); P.pend.casasPriv.delete(id); }
      return;
    }
    if (col === 'casasPriv') {
      const c = (D.casas || []).find(x => x.id === id);
      if (!c) { if (rec && D === DB) P.pend.casasPriv.set(id, rec); return; }
      CASA_PRIV.forEach(k => { if (!rec || !(k in rec)) delete c[k]; else c[k] = rec[k]; });
      return;
    }
    if (col === 'miembros') {
      D.usuarios = D.usuarios || [];
      const i = D.usuarios.findIndex(x => x.id === id);
      if (!rec) { if (i >= 0) D.usuarios.splice(i, 1); return; }
      const r = Object.assign({ id }, rec);
      let u;
      if (i >= 0) u = reemplazar(D.usuarios[i], r, U_PRIV); else { u = r; D.usuarios.push(u); }
      if (!('user' in u)) u.user = '';
      const pp = D === DB && P.pend.perfiles.get(id); if (pp) { Object.assign(u, pp); P.pend.perfiles.delete(id); }
      if (D === DB && !P.owner && P.rol === 'residente' && u.padreId === P.uid) escucharPerfil(id);
      return;
    }
    if (col === 'perfiles') {
      const u = (D.usuarios || []).find(x => x.id === id);
      if (!u) { if (rec && D === DB) P.pend.perfiles.set(id, rec); return; }
      U_PRIV.forEach(k => { if (!rec || !(k in rec)) { if (k !== 'tel' || u.rol !== 'vendedor') delete u[k]; } else u[k] = rec[k]; });
      if (!('user' in u)) u.user = '';
      return;
    }
    if (col === 'tiendaProductos' || col === 'tiendaPedidos') {
      D.tienda = D.tienda || { seq: 0, productos: [], pedidos: [] };
      const k = col === 'tiendaProductos' ? 'productos' : 'pedidos'; D.tienda[k] = D.tienda[k] || []; arrPut(D.tienda[k], rec); return;
    }
    if (col.startsWith('kv')) { if (!rec) delete D[id]; else D[id] = rec.__v !== undefined ? rec.__v : rec; return; }
    if (col === 'meta') {
      if (id === 'tiendaSeq') { D.tienda = D.tienda || { seq: 0, productos: [], pedidos: [] }; if (rec) D.tienda.seq = rec.v; return; }
      if (rec) D[id] = rec.v;
    }
  }
  function ordenarArrays(D) {
    const porFecha = (a, b) => String(b.fecha || '').localeCompare(String(a.fecha || ''));
    ARR.forEach(k => { if (Array.isArray(D[k]) && D[k].some(x => x && x.fecha)) D[k].sort(porFecha); });
    if (Array.isArray(D.cuotas)) D.cuotas.sort((a, b) => String(a.casaId).localeCompare(String(b.casaId)) || String(a.periodo).localeCompare(String(b.periodo)));
    if (D.tienda && Array.isArray(D.tienda.pedidos)) D.tienda.pedidos.sort(porFecha);
    if (Array.isArray(D.casas)) D.casas.sort((a, b) => String(a.pasaje).localeCompare(String(b.pasaje)) || String(a.numero).localeCompare(String(b.numero), undefined, { numeric: true }));
  }

  /* ---------- Lo que la app quiere guardar ---------- */
  function docsDe(rid, D, conPriv) {
    const out = new Map(), cols = new Set();
    const put = (col, id, rec) => { out.set(RP(rid, col, String(id)), { col, rec }); cols.add(col); };
    ARR.forEach(k => {
      cols.add(k);
      (D[k] || []).forEach(rec => {
        if (!rec || rec.id == null || String(rec.id).includes('/')) return;
        let r = rec;
        if (k === 'acadPagos' && !r.casaId) { const al = (D.alumnos || []).find(a => a.id === r.alumnoId); r = Object.assign({}, r, { casaId: (al && al.casaId) || '' }); }
        if (k === 'areas' && r.aprobacion === undefined) r = Object.assign({}, r, { aprobacion: true });
        put(k, rec.id, r);
      });
    });
    cols.add('casas'); if (conPriv) cols.add('casasPriv');
    (D.casas || []).forEach(c => { const { pub, priv } = partirCasa(c); put('casas', c.id, pub); if (conPriv) put('casasPriv', c.id, priv); });
    const t = D.tienda || {};
    cols.add('tiendaProductos'); cols.add('tiendaPedidos');
    (t.productos || []).forEach(p => p && p.id != null && put('tiendaProductos', p.id, p));
    (t.pedidos || []).forEach(p => p && p.id != null && put('tiendaPedidos', p.id, p));
    Object.values(KVP).forEach(c => cols.add(c));
    cols.add('meta');
    Object.keys(D).forEach(k => {
      if (KVRE.test(k)) { if (D[k] != null) put(kvCol(k), k, kvRec(k, D[k])); return; }
      if (ARR.includes(k) || ['casas', 'usuarios', 'tienda'].includes(k)) return;
      put('meta', k, { v: D[k] === undefined ? null : D[k] });
    });
    if (t.seq !== undefined) put('meta', 'tiendaSeq', { v: t.seq });
    return { out, cols };
  }

  /* ---------- Escrituras ---------- */
  function revertir(path) {
    const rec = P.server.get(path);
    P.sent.set(path, rec ? estable(rec) : undefined); if (!rec) P.sent.delete(path);
    aplicar(DB, path, rec ? clon(rec) : null);
  }
  function fallo(t, e) {
    const code = String((e && e.code) || '');
    console.warn('GateWise · no se guardó', t.path, code, e && e.message);
    if (/permission/.test(code)) { revertir(t.path); avisarUnaVez('perm', 'Ese cambio no está permitido para tu usuario'); programarRefresco(); }
    else if (/invalid-argument|failed-precondition/.test(code)) { revertir(t.path); avisarUnaVez('inv', 'No se pudo guardar: ' + (e.message || code)); programarRefresco(); }
  }
  async function ejecutar(tareas, enLote) {
    if (!tareas.length) return;
    const uno = async t => { try { const ref = FS().doc(t.path); if (t.tipo === 'del') await ref.delete(); else await ref.set(sobre(t.col, t.rec)); } catch (e) { fallo(t, e); } };
    if (!enLote) { await Promise.all(tareas.map(uno)); return; }
    for (let i = 0; i < tareas.length; i += 400) {
      const parte = tareas.slice(i, i + 400); const b = FS().batch();
      parte.forEach(t => { const ref = FS().doc(t.path); if (t.tipo === 'del') b.delete(ref); else b.set(ref, sobre(t.col, t.rec)); });
      try { await b.commit(); } catch (e) { console.warn('lote rechazado, se reintenta uno por uno', e.code); await Promise.all(parte.map(uno)); }
    }
  }
  const ocupado = pr => { const B = window.GW_BUSY; if (!B) return pr; B.inc(); return Promise.resolve(pr).finally(() => B.dec()); };
  // Mientras una función del servidor responde, el botón que la pidió muestra "cargando" (23-botones.js)
  const llamar = async (nombre, datos) => { const B = window.GW_BUSY; B && B.inc(); try { return (await P.fn.httpsCallable(nombre)(datos)).data; } finally { B && B.dec(); } };

  async function syncUsuarios(rid, D, sent, server, opts) {
    const nuevos = [], claves = [], cambios = [], tareas = [], borrar = [];
    const vistos = new Set();
    (D.usuarios || []).forEach(u => {
      if (!u || !u.id) return;
      const mp = RP(rid, 'miembros', u.id), pp = RP(rid, 'perfiles', u.id); vistos.add(mp);
      if (!server.has(mp)) { if (u.pass && !P.creando.has(u.id)) nuevos.push(u); return; }
      if (u.pass) claves.push(u);
      const { pub, priv } = partirU(u); const sv = server.get(mp) || {}; const spv = server.get(pp);
      const cb = {};
      ['rol', 'casaId', 'padreId'].forEach(k => { if ((pub[k] == null ? null : pub[k]) !== (sv[k] == null ? null : sv[k])) cb[k] = pub[k] == null ? null : pub[k]; });
      if (spv && priv.user !== undefined && priv.user !== '' && String(priv.user).toLowerCase() !== String(spv.user || '').toLowerCase()) cb.user = priv.user;
      if (Object.keys(cb).length) { if (opts.admin) cambios.push({ uid: u.id, cambios: Object.assign({}, cb, { nombre: u.nombre }) }); else { revertir(mp); } return; }
      if (estable(pub) !== sent.get(mp)) tareas.push({ tipo: 'set', path: mp, col: 'miembros', rec: pub });
      if (spv) { const pr = Object.assign({}, priv); if (pr.user === '') delete pr.user; if (estable(pr) !== sent.get(pp) && estable(pr) !== estable(spv)) tareas.push({ tipo: 'set', path: pp, col: 'perfiles', rec: Object.assign({}, spv, pr) }); }
    });
    for (const p of server.keys()) if (p.startsWith(RP(rid, 'miembros') + '/') && !vistos.has(p)) borrar.push(p.split('/').pop());
    let fallaron = false;
    if (nuevos.length) {
      nuevos.forEach(u => P.creando.add(u.id));
      try {
        const r = await llamar('usuarios', { accion: 'crear', rid, legado: !!opts.legado, usuarios: nuevos.map(u => Object.assign({}, u)) });
        (r.res || []).forEach(x => { const u = D.usuarios.find(y => y.id === x.id); if (x.ok) { if (u) delete u.pass; } else { fallaron = true; toast('No se creó el usuario: ' + x.error); } });
      } catch (e) { fallaron = true; toast(e.message || 'No se pudo crear el usuario'); }
      nuevos.forEach(u => P.creando.delete(u.id));
    }
    for (const u of claves) {
      try { await llamar('usuarios', { accion: 'clave', rid, uid: u.id, pass: u.pass }); toast('Clave actualizada'); }
      catch (e) { toast(e.message || 'No se pudo cambiar la clave'); }
      delete u.pass;
    }
    for (const c of cambios) { try { await llamar('usuarios', Object.assign({ accion: 'actualizar', rid }, c)); } catch (e) { fallaron = true; toast(e.message || 'No se pudo actualizar el usuario'); } }
    if (borrar.length > 5) { console.warn('Borrado masivo de usuarios bloqueado', borrar); avisarUnaVez('bm', 'Se bloqueó un borrado masivo de usuarios por seguridad'); fallaron = true; }
    else for (const id of borrar) { try { await llamar('usuarios', { accion: 'borrar', rid, uid: id }); } catch (e) { fallaron = true; toast(e.message || 'No se pudo borrar el usuario'); } }
    return { tareas, fallaron };
  }

  function planTareas(rid, D, sent, conPriv, permitirBorrar) {
    const { out, cols } = docsDe(rid, D, conPriv);
    const tareas = [];
    for (const [path, x] of out) { const j = estable(x.rec); if (sent.get(path) === j) continue; tareas.push({ tipo: 'set', path, col: x.col, rec: x.rec, j }); }
    if (permitirBorrar) {
      const porCol = {};
      for (const path of sent.keys()) {
        const { col } = partesDe(path);
        if (!cols.has(col) || out.has(path) || !path.startsWith(RP(rid) + '/')) continue;
        (porCol[col] = porCol[col] || []).push(path);
      }
      Object.entries(porCol).forEach(([col, ps]) => {
        const total = [...sent.keys()].filter(p => partesDe(p).col === col).length;
        if (ps.length > 20 && ps.length > total * 0.3) { console.warn('Borrado masivo bloqueado en', col, ps.length); avisarUnaVez('bd' + col, 'Se bloqueó un borrado masivo en ' + col + ' por seguridad'); return; }
        ps.forEach(p => tareas.push({ tipo: 'del', path: p, col }));
      });
    }
    return tareas;
  }

  async function sincronizar() {
    if (!P.on || !P.listo || !DB || !P.rid) return;
    if (P.corriendo) { P.otraVez = true; return; }
    P.corriendo = true;
    try {
      const adm = P.owner || P.rol === 'admin';
      const u = await syncUsuarios(P.rid, DB, P.sent, P.server, { admin: adm });
      if (u.fallaron) { reconstruir(); programarRefresco(); return; }
      const tareas = u.tareas.concat(planTareas(P.rid, DB, P.sent, adm && P.cargadas.has('casasPriv'), true));
      tareas.forEach(t => { if (t.tipo === 'del') P.sent.delete(t.path); else P.sent.set(t.path, t.j || estable(t.rec)); });
      await ejecutar(tareas, adm);
    } finally { P.corriendo = false; if (P.otraVez) { P.otraVez = false; programar(); } }
  }
  function programar() { clearTimeout(P.timer); P.timer = setTimeout(sincronizar, 250); }
  let refrT = null;
  function programarRefresco() { clearTimeout(refrT); refrT = setTimeout(() => { try { refrescarVista(); } catch (e) { } }, 60); }

  function reconstruir() {
    const D = esqueleto(P.rid); P.pend.casasPriv.clear(); P.pend.perfiles.clear();
    const orden = p => { const c = partesDe(p).col; return c === 'casas' || c === 'miembros' ? 0 : 1; };
    [...P.server.keys()].sort((a, b) => orden(a) - orden(b)).forEach(p => aplicar(D, p, clon(P.server.get(p))));
    ordenarArrays(D); DB = D;
    P.sent = new Map([...P.server.entries()].map(([p, r]) => [p, estable(r)]));
  }

  /* ---------- Lectura en vivo, según el rol ---------- */
  function plan(rol, uid, casa) {
    const full = c => ({ col: c }), w = (c, f, v) => ({ col: c, f, v });
    const comunes = ['casas', 'miembros', 'avisos', 'meta'].map(full);
    const yo = [w('notifs', 'userId', uid), { doc: 'perfiles/' + uid }];
    if (P.owner || rol === 'admin') return TODAS.filter(c => c !== 'notifs').map(full).concat([w('notifs', 'userId', uid)]);
    if (rol === 'residente' || rol === 'inquilino') {
      const q = comunes.concat(['votaciones', 'eventos', 'areas', 'academias', 'resenas', 'tiendaProductos', 'kvVoto', 'kvBoleta', 'kvRsvp', 'kvEquipo', 'kvReserva'].map(full), yo);
      if (casa) {
        (rol === 'residente' ? ['cuotas', 'pagos', 'visitasCobro'] : []).concat(['pases', 'autorizaciones', 'reclamos', 'alumnos', 'acadPagos', 'tiendaPedidos', 'kvSolAcad'])
          .forEach(c => q.push(w(c, 'casaId', casa)));
        q.push({ doc: 'casasPriv/' + casa });
      }
      return q;
    }
    if (rol === 'vigilante') return comunes.concat(['perfiles', 'casasPriv', 'pases', 'autorizaciones', 'acadIngresos', 'academias', 'areas', 'eventos', 'kvReserva'].map(full), [w('alumnos', 'tipo', 'ext'), w('notifs', 'userId', uid)]);
    if (rol === 'cobrador') return comunes.concat(['perfiles', 'casasPriv', 'cuotas', 'pagos', 'visitasCobro', 'cierres'].map(full), [w('notifs', 'userId', uid)]);
    if (rol === 'vendedor') return comunes.concat(['tiendaProductos', 'resenas'].map(full), [w('tiendaPedidos', 'vendedorId', uid)], yo);
    return comunes.concat(yo);
  }
  function recibir(path, data) {
    if (!data) { P.server.delete(path); P.sent.delete(path); aplicar(DB, path, null); return true; }
    const rec = leerDoc(data); const j = estable(rec);
    P.server.set(path, rec);
    if (P.sent.get(path) === j) return false;
    P.sent.set(path, j); aplicar(DB, path, clon(rec)); return true;
  }
  function escuchar(rid, q) {
    const fs = FS(); let ref;
    if (q.doc) ref = fs.doc(RP(rid, q.doc));
    else { ref = fs.collection(RP(rid, q.col)); if (q.f) ref = ref.where(q.f, '==', q.v); }
    return new Promise(res => {
      let primera = true;
      const un = ref.onSnapshot(snap => {
        if (rid !== P.rid) return;
        let cambio = false;
        if (q.doc) cambio = recibir(RP(rid, q.doc), snap.exists ? snap.data() : null) || cambio;
        else snap.docChanges().forEach(ch => { cambio = recibir(RP(rid, q.col, ch.doc.id), ch.type === 'removed' ? null : ch.doc.data()) || cambio; });
        P.cargadas.add(q.col || q.doc.split('/')[0]);
        if (primera) { primera = false; res(); } else if (cambio && P.listo) programarRefresco();
      }, err => { console.warn('GateWise · sin acceso a', q.col || q.doc, err.code); if (primera) { primera = false; res(); } });
      P.subs.push(un);
    });
  }
  function escucharPerfil(id) { if (P.perfilSubs.has(id) || !P.rid) return; P.perfilSubs.add(id); escuchar(P.rid, { doc: 'perfiles/' + id }); }
  function cerrarRes() { P.subs.forEach(u => { try { u(); } catch (e) { } }); P.subs = []; P.perfilSubs.clear(); P.server.clear(); P.sent.clear(); P.cargadas.clear(); P.listo = false; P.pend.casasPriv.clear(); P.pend.perfiles.clear(); }
  function pantallaCarga(t) { const a = document.getElementById('app'); if (a) a.innerHTML = `<div class="login" style="align-items:center;text-align:center"><div class="logo">${ic('gatewise', 36)}</div><h2 style="margin:16px 0 6px">${esc(t || 'Cargando su residencial…')}</h2><p class="muted">Un momento, por favor.</p></div>`; }
  async function abrirRes(rid, rol, uid, casa) {
    cerrarRes(); P.rid = rid; P.rol = rol; RES = rid; DB = esqueleto(rid);
    pantallaCarga();
    await Promise.all(plan(rol, uid, casa).map(q => escuchar(rid, q)));
    ordenarArrays(DB);
    // Punto de partida: lo descargado (y los valores por defecto) no se vuelve a escribir;
    // solo se suben los cambios que haga la persona a partir de aquí.
    const adm = P.owner || rol === 'admin';
    for (const [path, x] of docsDe(rid, DB, adm && P.cargadas.has('casasPriv')).out) if (!P.sent.has(path) || x.col === 'meta') P.sent.set(path, estable(x.rec));
    P.listo = true;
    if (adm) { ensureCuotas(); programar(); }
  }

  /* ---------- Plataforma (lista de residenciales, negocio) ---------- */
  function platVacia() { return { version: 1, ultima: '', superadmins: [], residenciales: [], solicitudes: [], demo: false }; }
  function duenoObj() { return { id: 'owner', rol: 'superadmin', nombre: 'Administrador de la APP', user: OWNER_EMAIL, email: OWNER_EMAIL, activo: true }; }
  function publicoDe(r) { return { id: r.id, nombre: r.nombre, municipio: r.municipio || '', estado: r.estado || 'activa', vencePrueba: r.vencePrueba || null, casasAut: (typeof casasAutDe === 'function' ? casasAutDe(r, null) : null) || null, tipo: (r.init && r.init.tipo) || r.tipo || 'residencial', pais: (r.init && r.init.pais) || r.pais || 'SV' }; }
  function guardarCachePlat() { try { localStorage.setItem(PKEY_PROD, JSON.stringify({ residenciales: (PLAT.residenciales || []).map(publicoDe) })); } catch (e) { } }
  async function syncPlat() {
    if (!P.on || !P.owner || !P.platListo) return;
    const priv = clon(PLAT); delete priv.superadmins; delete priv.solicitudes; delete priv.ultima; (priv.residenciales || []).forEach(r => { if (r.init) delete r.init.adminPass; });
    const tareas = [];
    const jp = estable(priv); if (P.platSent.privado !== jp) { P.platSent.privado = jp; tareas.push(FS().doc('plataforma/privado').set({ d: jp, _t: firebase.firestore.FieldValue.serverTimestamp() })); }
    const pub = { residenciales: (PLAT.residenciales || []).map(publicoDe) }; const jpu = estable(pub);
    if (P.platSent.publico !== jpu) { P.platSent.publico = jpu; tareas.push(FS().doc('plataforma/publico').set({ d: jpu, _t: firebase.firestore.FieldValue.serverTimestamp() })); }
    (PLAT.residenciales || []).forEach(r => {
      const o = { nombre: r.nombre, estado: r.estado || 'activa', casasAut: (typeof casasAutDe === 'function' ? casasAutDe(r, null) : null) || null, vencePrueba: r.vencePrueba || null };
      const j = estable(o); if (P.platSent['r_' + r.id] !== j) { P.platSent['r_' + r.id] = j; tareas.push(FS().doc('r/' + r.id).set(o, { merge: true })); }
    });
    (PLAT.solicitudes || []).forEach(s => { const j = estable(s); if (P.platSent['s_' + s.id] !== j) { P.platSent['s_' + s.id] = j; tareas.push(FS().doc('solicitudesRes/' + s.id).set({ d: j, _t: firebase.firestore.FieldValue.serverTimestamp() })); } });
    try { await Promise.all(tareas); } catch (e) { console.warn('plataforma', e); toast('No se guardó la plataforma: ' + e.message); }
  }
  let platT = null;
  async function iniciarDueno() {
    P.owner = true; P.platListo = false;
    pantallaCarga('Cargando la plataforma…');
    const fs = FS();
    await new Promise(res => {
      let n = 0; const fin = () => { if (++n === 3) res(); };
      P.subs.push(fs.doc('plataforma/privado').onSnapshot(s => {
        if (s.exists) { try { const o = JSON.parse(s.data().d || '{}'); Object.assign(PLAT, o); P.platSent.privado = estable(o); } catch (e) { } }
        PLAT.superadmins = [duenoObj()]; guardarCachePlat(); if (P.platListo) programarRefresco(); fin();
      }, () => fin()));
      P.subs.push(fs.collection('solicitudesRes').onSnapshot(s => {
        PLAT.solicitudes = s.docs.map(d => { try { const o = JSON.parse(d.data().d); P.platSent['s_' + d.id] = estable(o); return o; } catch (e) { return null; } }).filter(Boolean).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
        if (P.platListo) programarRefresco(); fin();
      }, () => fin()));
      P.subs.push(fs.collection('r').onSnapshot(s => { s.docs.forEach(d => { P.resDocs[d.id] = d.data(); }); if (P.platListo) programarRefresco(); fin(); }, () => fin()));
    });
    P.platListo = true;
    S.user = PLAT.superadmins[0]; S.modoPlat = false; S.tab = 'inicio'; S.imp = null; render();
  }

  /* ---------- Caché ligera de otra residencial (panel del dueño) ---------- */
  async function cargarLigero(rid) {
    const fs = FS(); const D = esqueleto(rid); const server = new Map();
    const tomar = async (col, f, v) => { let ref = fs.collection(RP(rid, col)); if (f) ref = ref.where(f, '==', v); const s = await ref.get(); s.docs.forEach(d => { const rec = leerDoc(d.data()); server.set(RP(rid, col, d.id), rec); }); };
    await Promise.all([tomar('meta'), tomar('casas'), tomar('miembros'), tomar('cuotas', 'estado', 'pendiente')]);
    await Promise.all([tomar('casasPriv'), tomar('perfiles')]);
    const orden = p => { const c = partesDe(p).col; return c === 'casas' || c === 'miembros' ? 0 : 1; };
    [...server.keys()].sort((a, b) => orden(a) - orden(b)).forEach(p => aplicar(D, p, clon(server.get(p))));
    ordenarArrays(D);
    P.cache[rid] = { d: D, server, sent: new Map([...server.entries()].map(([p, r]) => [p, estable(r)])) };
    return D;
  }
  const colaSubir = {};
  function subirDB(rid, D, legado) { const p = (colaSubir[rid] || Promise.resolve()).then(() => subirDB1(rid, D, legado)); colaSubir[rid] = p.catch(() => { }); return p; }
  async function subirDB1(rid, D, legado) {
    if (rid === P.rid && P.listo) { DB = D; save(); return; }
    if (!P.owner) return toast('Solo el Administrador de la APP');
    const c = P.cache[rid] || { server: new Map(), sent: new Map() };
    await FS().doc('r/' + rid).set({ nombre: (D.residencial && D.residencial.nombre) || '' }, { merge: true });
    const u = await syncUsuarios(rid, D, c.sent, c.server, { admin: true, legado: legado !== false });
    const tareas = u.tareas.concat(planTareas(rid, D, c.sent, true, false));
    tareas.forEach(t => c.sent.set(t.path, t.j || estable(t.rec)));
    const viejoRid = P.rid; P.rid = rid; try { await ejecutar(tareas, true); } finally { P.rid = viejoRid; }
    P.cache[rid] = Object.assign(c, { d: D });
    try { await cargarLigero(rid); } catch (e) { console.warn('recarga', e); }   // la caché queda igual que el servidor
    return u.fallaron ? false : true;
  }

  /* ---------- Push ---------- */
  async function activarPush() {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return toast(esIOS() && !esStandalone() ? 'En iPhone, primero agrega GateWise a tu pantalla de inicio' : 'Este teléfono no permite notificaciones desde la web');
      if (!window.GATEWISE_VAPID || /PEGAR/.test(window.GATEWISE_VAPID)) return toast('Falta configurar la clave de notificaciones (VAPID) en config.js');
      if (!firebase.messaging) await cargarJS(SDK + 'firebase-messaging-compat.js');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return toast('Las notificaciones quedaron desactivadas');
      const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
      P.msg = P.msg || firebase.messaging();
      const token = await P.msg.getToken({ vapidKey: window.GATEWISE_VAPID, serviceWorkerRegistration: reg });
      if (!token) return toast('No se pudo activar');
      await FS().doc('tokens/' + P.uid).set({ tokens: firebase.firestore.FieldValue.arrayUnion(token), rid: P.rid || 'plataforma', _t: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      P.msg.onMessage(m => { const n = m.notification || {}; toast((n.title ? n.title + ' · ' : '') + (n.body || '')); });
      render(); toast('Notificaciones activadas');
    } catch (e) { console.warn(e); toast('No se pudo activar: ' + (e.message || e)); }
  }
  const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const esStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  let instalarEv = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); instalarEv = e; });
  async function instalar() { if (instalarEv) { instalarEv.prompt(); instalarEv = null; return; } guiaInstalar(); }
  function guiaInstalar() {
    sheet('Instalar GateWise', esIOS()
      ? `<ol style="padding-left:20px;line-height:1.7;margin-top:0"><li>Abre esta página en <b>Safari</b>.</li><li>Toca el botón <b>Compartir</b> (el cuadro con la flecha hacia arriba).</li><li>Elige <b>Agregar a pantalla de inicio</b> y toca <b>Agregar</b>.</li><li>Abre GateWise desde el ícono nuevo y activa las notificaciones en Menú.</li></ol><p class="note">Las notificaciones en iPhone necesitan iOS 16.4 o más reciente.</p>`
      : `<ol style="padding-left:20px;line-height:1.7;margin-top:0"><li>Abre esta página en <b>Chrome</b>.</li><li>Toca el menú <b>⋮</b> y elige <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b>.</li><li>Abre GateWise desde el ícono nuevo.</li></ol>`);
  }

  /* ---------- Eliminar mi cuenta (requisito de Play Store) ---------- */
  function pedirEliminarCuenta() {
    sheet('Eliminar mi cuenta', `${alertBox('bad', 'Esto no se puede deshacer', 'Se borra tu acceso a la app y tus datos personales (teléfono, DUI, correo). Los registros de la residencial, como pagos y visitas, se conservan para la administración.')}<label class="f">Escribe ELIMINAR para confirmar<input id="elimOk" autocomplete="off"></label><button class="btn bad block" onclick="GW_PROD.eliminarCuenta()">Eliminar mi cuenta</button>`);
  }
  P.eliminarCuenta = async function () {
    const v = (document.getElementById('elimOk') || {}).value; if (String(v).trim().toUpperCase() !== 'ELIMINAR') return toast('Escribe ELIMINAR para confirmar');
    try { await llamar('eliminarMiCuenta', {}); closeSheet(); await P.auth.signOut(); toast('Tu cuenta fue eliminada'); } catch (e) { toast(e.message || 'No se pudo eliminar'); }
  };

  /* =================== Reemplazos de funciones de la app =================== */
  const base = { entrar, salir, render, impersonar: window.impersonar, editarRes: window.editarRes, resStats: window.resStats, vLogin: window.vLogin, ensureCuotas };
  loadPlat = function () {
    PLAT = platVacia();
    try { const c = JSON.parse(localStorage.getItem(PKEY_PROD) || 'null'); if (c && Array.isArray(c.residenciales)) PLAT.residenciales = c.residenciales; } catch (e) { }
  };
  savePlat = function () { if (!PLAT) return; guardarCachePlat(); if (P.owner) { clearTimeout(platT); platT = setTimeout(syncPlat, 300); } };
  load = function (id) {
    if (P.listo && DB && id === P.rid) return;
    id = id || RES || (PLAT && PLAT.ultima) || ((PLAT && PLAT.residenciales[0]) || {}).id;
    if (!id) { DB = null; RES = null; return; }
    RES = id; if (PLAT) PLAT.ultima = id; DB = esqueleto(id);
  };
  save = function () { if (!DB || !RES) return; programar(); };
  ensureCuotas = function () {
    if (!(P.owner || P.rol === 'admin') || !DB) return;
    const fin = periodoActual();
    DB.casas.forEach(c => { let p = c.desde || DB.inicioCobro, g = 0; while (p <= fin && g < 240) { if (!DB.cuotas.some(q => q.casaId === c.id && q.periodo === p)) DB.cuotas.push({ id: 'q_' + c.id + '_' + p, casaId: c.id, periodo: p, monto: c.cuota || DB.config.cuota, estado: 'pendiente' }); p = addMonths(p, 1); g++; } });
  };
  leerDB = function (id) {
    if (id === P.rid && P.listo) return DB;
    if (P.cache[id]) return P.cache[id].d;
    if (P.owner && !P['_cargando' + id]) { P['_cargando' + id] = true; cargarLigero(id).then(() => { P['_cargando' + id] = false; programarRefresco(); }).catch(e => { P['_cargando' + id] = false; console.warn(e); }); }
    return null;
  };
  escribirDB = function (id, d) { subirDB(id, d).then(ok => { if (ok !== false) programarRefresco(); }); };
  resStats = function (r) {
    if ((r.id === P.rid && P.listo) || (P.cache[r.id])) return base.resStats(r);
    const s = (P.resDocs[r.id] || {}).stats;
    return s ? { casas: s.casas || 0, usuarios: s.usuarios || 0, mora: s.mora || 0, conDueno: s.conDueno || 0 } : { casas: (r.init && +r.init.casas) || 0, usuarios: 0, mora: 0, conDueno: 0 };
  };
  editarRes = async function (id) { if (!leerDB(id)) { toast('Cargando datos de la residencial…'); await cargarLigero(id); } return base.editarRes(id); };
  impersonar = async function (id, uidx) {
    const sa = S.imp || S.user;
    await abrirRes(id, 'admin', P.uid, '');
    const ad = (uidx && usuario(uidx)) || DB.usuarios.find(u => u.rol === 'admin' && u.activo) || DB.usuarios.find(u => u.rol === 'admin');
    if (!ad) { cerrarRes(); S.user = sa; render(); return toast('Esta residencial aún no tiene usuario de administración'); }
    S.imp = sa; S.user = ad; S.tab = 'inicio'; S.sub = null; render(); window.scrollTo(0, 0);
  };
  eliminarRes = async function (id) {
    const r = PLAT.residenciales.find(x => x.id === id); if (!r) return;
    sheet('Eliminar residencial', `${alertBox('bad', 'Se borra todo y no se puede recuperar', `Se eliminan todos los datos y usuarios de <b>${esc(r.nombre)}</b>.`)}<label class="f">Escribe el nombre de la residencial para confirmar<input id="elimRes" autocomplete="off"></label><button class="btn bad block" onclick="GW_PROD.eliminarResOk('${id}')">Eliminar definitivamente</button>`);
  };
  P.eliminarResOk = async function (id) {
    const r = PLAT.residenciales.find(x => x.id === id); const v = (document.getElementById('elimRes') || {}).value;
    if (String(v).trim().toLowerCase() !== String(r.nombre).trim().toLowerCase()) return toast('El nombre no coincide');
    try { toast('Eliminando…'); await llamar('eliminarResidencial', { rid: id }); PLAT.residenciales = PLAT.residenciales.filter(x => x.id !== id); delete P.cache[id]; savePlat(); closeSheet(); S.tab = 'residenciales'; S.sub = null; render(); toast('Residencial eliminada'); }
    catch (e) { toast(e.message || 'No se pudo eliminar'); }
  };
  cachearResidenciales = function () { };
  nubeSetRes = function (rid, d) {   // crearResidencial y otras pantallas del dueño
    try { localStorage.removeItem(dbKey(rid)); } catch (e) { }
    subirDB(rid, d, false).then(ok => {
      const r = (PLAT.residenciales || []).find(x => x.id === rid);
      if (r && r.init && r.init.adminPass) { delete r.init.adminPass; savePlat(); }
      if (ok !== false) toast('Residencial guardada en la nube'); programarRefresco();
    }).catch(e => toast('No se guardó en la nube: ' + (e.message || e)));
  };
  nubeBorrarRes = function () { }; nubePlat = function () { }; nubeRes = function () { };
  iniciarNube = function () { };
  if (typeof nubeBorrarTodo === 'function') nubeBorrarTodo = function () { toast('No disponible en producción'); };
  resetDemo = function () { toast('No disponible en producción: los datos reales no se pueden reemplazar con datos de ejemplo'); };
  if (typeof resetDemo2 === 'function') resetDemo2 = resetDemo;
  if (typeof limpiarDatos === 'function') limpiarDatos = function () { toast('No disponible en producción'); };
  entrarId = function () { toast('No disponible en producción'); };
  verificarSesionDueno = function () { };

  /* ---------- Ingreso ---------- */
  function msgAuth(err) {
    const c = String((err && err.code) || '');
    return /wrong-password|invalid-credential|invalid-login|user-not-found|invalid-email/.test(c) ? 'Usuario o clave incorrectos'
      : /user-disabled/.test(c) ? 'Tu usuario está desactivado. Comunícate con la administración'
        : /too-many-requests/.test(c) ? 'Demasiados intentos. Espera unos minutos e intenta de nuevo'
          : /network/.test(c) ? 'Sin conexión a internet' : 'No se pudo entrar: ' + ((err && err.message) || c);
  }
  login = async function (e) {
    e.preventDefault(); const f = new FormData(e.target); const un = String(f.get('user')).trim().toLowerCase(); const pw = String(f.get('pass') || '');
    if (S.modoPlat || !PLAT.residenciales.length) return loginDueno(un, pw);
    if (!RES) return toast('Elige tu residencial');
    if (!P.on) return toast('Conectando… intenta de nuevo en un momento');
    try { toast('Verificando…'); await ocupado(P.auth.signInWithEmailAndPassword(emailDe(un, RES), claveAuth(pw))); }
    catch (err) { toast(msgAuth(err)); }
  };
  if (typeof loginRolOk === 'function') loginRolOk = function (e, rol) { closeSheet(); return login(e); };
  loginDueno = async function (email, pass) {
    email = String(email || '').trim().toLowerCase();
    if (email !== OWNER_EMAIL) return toast('Solo el dueño de la app puede entrar como Administrador de la APP');
    try { toast('Verificando…'); await ocupado(P.auth.signInWithEmailAndPassword(email, pass)); } catch (err) { toast(msgAuth(err).replace('Usuario', 'Correo')); }
  };
  cerrarDueno = function () { };
  salir = function () {
    closeSheet();
    if (S.imp) { const sa = S.imp; cerrarRes(); P.rid = null; RES = null; DB = null; S.imp = null; S.user = sa; S.tab = 'residenciales'; S.sub = null; render(); return; }
    const eraDueno = S.user && S.user.rol === 'superadmin';
    S.user = null; S.tab = 'inicio'; S.modoPlat = eraDueno; cerrarRes(); P.rid = null;
    const r = PLAT.ultima; if (r) load(r);
    render(); if (P.auth) P.auth.signOut().catch(() => { });
  };
  cambiarPass = async function (e) {
    e.preventDefault(); const f = new FormData(e.target); const a = String(f.get('a') || ''), n = String(f.get('n') || '');
    if (n.length < 6) return toast('La nueva clave debe tener al menos 6 caracteres');
    try { const u = P.auth.currentUser; await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, P.owner ? a : claveAuth(a))); await u.updatePassword(P.owner ? n : claveAuth(n)); e.target.reset(); toast('Contraseña actualizada'); }
    catch (err) { toast(/wrong|invalid-credential/.test(String(err.code)) ? 'La contraseña actual no es correcta' : 'No se pudo cambiar: ' + (err.message || err.code)); }
  };

  /* ---------- Registro de propietarios y solicitudes ---------- */
  irRegistro = async function () {
    if (!RES) return toast('Primero elige tu residencial');
    try { toast('Cargando casas…'); const r = await llamar('registroInfo', { rid: RES }); DB = esqueleto(RES); DB.casas = (r.casas || []).map(c => ({ id: c.id, numero: c.numero, pasaje: c.pasaje, torre: c.torre, piso: c.piso, duenoId: c.ocupada ? 'ocupada' : null, codigo: '' })); }
    catch (e) { return toast(e.message || 'No se pudo cargar'); }
    S.tab = 'registro'; S.reto = null; SELFIE = null; render(); window.scrollTo(0, 0);
  };
  enviarRegistro = async function (e) {
    e.preventDefault(); const f = new FormData(e.target); const c = casa(f.get('casa'));
    if (!c) return toast('Elige tu casa');
    if (!duiValido(String(f.get('dui')).trim())) return toast('El DUI debe tener 9 dígitos: 00000000-0');
    if (String(f.get('pass') || '').length < 6) return toast('La clave debe tener al menos 6 caracteres');
    if (!SELFIE) return toast('Falta la foto en tiempo real');
    let doc, duif, foto; try { doc = await leerArchivo(f.get('doc')); duif = await leerArchivo(f.get('duif')); foto = await leerArchivo(f.get('foto')); } catch (x) { return toast('Archivo no válido. Usa foto o PDF'); }
    const un = String(f.get('user')).trim().toLowerCase();
    try {
      toast('Enviando…');
      await llamar('registro', { rid: RES, casaId: c.id, codigo: String(f.get('codigo') || '').trim(), nombre: f.get('nombre'), familia: String(f.get('familia') || '').trim(), dui: f.get('dui'), tel: f.get('tel'), email: f.get('email'), user: un, pass: f.get('pass'), documento: doc, duiFoto: duif, foto, selfie: SELFIE });
    } catch (err) { return toast(err.message || 'No se pudo enviar'); }
    SELFIE = null; S.tab = 'inicio'; DB = esqueleto(RES); render();
    sheet('Solicitud enviada', `<p>Tu solicitud para <b>${casaNom(c.id)}</b> quedó en revisión. La administración validará tus documentos y tu foto, y te avisará. Después podrás ingresar con tu usuario <b>${esc(un)}</b>.</p><button class="btn block" onclick="closeSheet()">Entendido</button>`);
  };
  aprobarSol = async function (id, ok) {
    const s = DB.solicitudes.find(x => x.id === id); if (!s) return; const c = casa(s.casaId);
    if (c && c.duenoId && !ok) return confirmar('La casa ya tiene propietario', `${esc(duenoNom(c.id))} y sus inquilinos quedarán desactivados.`, 'Aprobar y reemplazar', () => aprobarSol(id, true), { icono: 'userplus', tono: 'warn' });
    const reemplazar = !!(c && c.duenoId);
    try { toast('Aprobando…'); await llamar('aprobarRegistro', { rid: P.rid, solId: id, reemplazar }); toast('Propietario aprobado. Ya puede ingresar con su usuario'); }
    catch (e) { toast(e.message || 'No se pudo aprobar'); }
  };
  enviarSolRes = async function (e) {
    e.preventDefault(); const f = new FormData(e.target);
    const s = { id: uid(), nombre: f.get('nombre'), municipio: f.get('municipio'), casas: +f.get('casas'), contacto: { nombre: f.get('cn'), tel: f.get('ct'), email: f.get('ce') }, mensaje: f.get('m'), fecha: nowISO(), estado: 'pendiente' };
    try { await ocupado(FS().doc('solicitudesRes/' + s.id).set({ d: estable(s), _t: firebase.firestore.FieldValue.serverTimestamp() })); }
    catch (err) { return toast('No se pudo enviar: ' + (err.message || err.code)); }
    S.tab = 'inicio'; render(); sheet('Solicitud enviada', '<p>Gracias. Te contactaremos para crear la cuenta de tu residencial.</p><button class="btn block" onclick="closeSheet()">Listo</button>');
  };

  /* ---------- Menú: notificaciones, instalar, eliminar cuenta ---------- */
  function itemsProd() {
    const perm = ('Notification' in window) ? Notification.permission : 'na';
    let h = '';
    if (perm !== 'granted') h += menuItem('bell', 'Activar notificaciones', 'GW_PROD.activarPush()');
    if (!esStandalone()) h += menuItem('download', 'Instalar la app en este teléfono', 'GW_PROD.instalar()');
    if (!P.owner) h += menuItem('trash', 'Eliminar mi cuenta', 'GW_PROD.pedirEliminarCuenta()');
    return h;
  }
  Object.keys(VIEWS).forEach(r => {
    const V = VIEWS[r]; if (!V || !V.mas || r === 'superadmin') return; const b = V.mas;
    V.mas = function () { const h = b.apply(this, arguments); const i = h.indexOf('<h3>Sesión</h3>'); const it = itemsProd(); return i >= 0 ? h.slice(0, i) + '<h3>Este teléfono</h3>' + it + h.slice(i) : h + it; };
  });
  vLogin = function () {
    let h = base.vLogin.apply(this, arguments);
    h = h.replace(/<button class="btn ghost block"[^>]*onclick="entrarId[^"]*"[^>]*>[\s\S]*?<\/button>/g, '');
    try { h = h.split(nubeTxt()).join(P.on ? '🔒 Conexión segura · datos protegidos' : 'Conectando…').replace(/onclick="verNube\(\)"/g, ''); } catch (e) { }
    if (!esStandalone()) h += `<div class="card" style="margin-top:12px;text-align:left"><b>${esIOS() ? 'Instala GateWise en tu iPhone' : 'Instala GateWise en tu teléfono'}</b><p class="sm muted" style="margin:6px 0 10px">${esIOS() ? 'En Safari toca Compartir › Agregar a pantalla de inicio. Así se abre como app y puedes recibir notificaciones.' : 'Ábrela como una app desde tu pantalla de inicio.'}</p><button class="btn sec block" onclick="GW_PROD.instalar()">Cómo instalar</button></div>`;
    return h;
  };
  Object.assign(P, { activarPush, instalar, pedirEliminarCuenta, sincronizar, reconstruir, cargarLigero, subirDB, abrirRes, cerrarRes, emailDe, claveAuth, estable, leerDoc, plan });
  if (typeof ICON !== 'undefined' && !ICON.download) ICON.download = '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>';
  Object.assign(I18N, { 'Activar notificaciones': 'Turn on notifications', 'Instalar la app en este teléfono': 'Install the app on this phone', 'Eliminar mi cuenta': 'Delete my account', 'Este teléfono': 'This phone', 'Cargando su residencial…': 'Loading your community…', 'Un momento, por favor.': 'One moment, please.', 'Instala GateWise en tu iPhone': 'Install GateWise on your iPhone', 'Instala GateWise en tu teléfono': 'Install GateWise on your phone', 'Cómo instalar': 'How to install', '🔒 Conexión segura · datos protegidos': '🔒 Secure connection · data protected' });

  /* ---------- Menú del dueño: sin opciones de demostración ---------- */
  if (VIEWS.superadmin && VIEWS.superadmin.mas) {
    const bSA = VIEWS.superadmin.mas;
    VIEWS.superadmin.mas = function () {
      let h = bSA.apply(this, arguments);
      ['verNube()', 'verRecuperar()', 'borrarRegistros()', 'resetDemo()'].forEach(fn => { h = h.replace(new RegExp('<[^<]*?onclick="' + fn.replace(/[()]/g, '\\$&') + '"[\\s\\S]*?</(button|div|a)>'), ''); });
      h = h.replace(/<p class="note nubeEstado"[\s\S]*?<\/p>/, '');
      const i = h.indexOf('<h3>Sesión</h3>'); const it = itemsProd();
      return i >= 0 ? h.slice(0, i) + '<h3>Este teléfono</h3>' + it + h.slice(i) : h + it;
    };
  }
  resetDueno = async function () { try { await P.auth.sendPasswordResetEmail(OWNER_EMAIL); closeSheet(); toast('Te enviamos el correo a ' + OWNER_EMAIL); } catch (e) { toast('No se pudo enviar: ' + (e.message || e)); } };

  /* ---------- Claves de al menos 6 caracteres (Firebase) ---------- */
  new MutationObserver(() => {
    document.querySelectorAll('input[name=pass][minlength="4"],input[name=n][minlength="4"],input[name=adminPass]').forEach(i => { i.minLength = 6; if (/^\d{4}$/.test(i.value)) i.value = ''; });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* =================== Arranque =================== */
  async function arrancar() {
    loadPlat(); if (PLAT.residenciales.length) load(PLAT.residenciales[0].id);
    S.user = null; render();
    if (!CFG || !CFG.apiKey || /PEGAR/.test(CFG.apiKey)) { toast('Falta la configuración de Firebase de producción en config.js'); return; }
    try {
      if (!window.firebase || !firebase.firestore) {
        await cargarJS(SDK + 'firebase-app-compat.js'); await cargarJS(SDK + 'firebase-auth-compat.js');
        await cargarJS(SDK + 'firebase-firestore-compat.js'); await cargarJS(SDK + 'firebase-functions-compat.js');
      }
      P.app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CFG);
      P.auth = firebase.auth(); P.fs = firebase.firestore();
      try { await P.fs.enablePersistence({ synchronizeTabs: true }); } catch (e) { /* otra pestaña o navegador sin soporte */ }
      P.fn = P.app.functions(REGION);
      P.on = true;
      if (typeof NUBE !== 'undefined') { NUBE.on = true; NUBE.estado = 'conectado'; }
      P.fs.doc('plataforma/publico').onSnapshot(s => {
        if (P.owner) return;
        try { const o = s.exists ? JSON.parse(s.data().d || '{}') : { residenciales: [] }; PLAT.residenciales = o.residenciales || []; guardarCachePlat(); } catch (e) { }
        if (!S.user) { if (!RES && PLAT.residenciales.length) load(PLAT.residenciales[0].id); render(); }
      }, e => console.warn('publico', e.code));
      P.auth.onAuthStateChanged(async user => {
        if (!user) { P.uid = null; P.owner = false; if (S.user) { cerrarRes(); S.user = null; S.imp = null; render(); } return; }
        P.uid = user.uid;
        if (String(user.email || '').toLowerCase() === OWNER_EMAIL) { await iniciarDueno(); return; }
        P.owner = false;
        const tok = await user.getIdTokenResult(true); P.claims = tok.claims || {};
        const rid = P.claims.rid;
        if (!rid) { await P.auth.signOut(); return toast('Tu usuario no tiene una residencial asignada'); }
        await abrirRes(rid, P.claims.rol, user.uid, P.claims.casa || '');
        const u = usuario(user.uid);
        if (!u || u.activo === false) { await P.auth.signOut(); cerrarRes(); S.user = null; render(); return toast('Tu usuario no está activo'); }
        const er = puedeEntrar(u); if (er) { await P.auth.signOut(); cerrarRes(); S.user = null; render(); return toast(er); }
        base.entrar(u);
      });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sincronizar(); });
    } catch (e) { console.error(e); toast('No se pudo conectar: ' + (e.message || e)); }
  }
  window.GW_PROD_ARRANCAR = arrancar;
})();
