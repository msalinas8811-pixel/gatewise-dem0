/* Simulador de Firebase (compat) para probar prod.js en el navegador.
   - Firestore en memoria (persistido en localStorage para recargas)
   - Reglas: espejo en JS de firestore.rules
   - Authentication con claims
   - Cloud Functions ejecutando functions/core.js (window.GW_CORE)  */
(function () {
  const LS = 'mockfb_store', LA = 'mockfb_auth';
  let store = {}, users = {};
  try { store = JSON.parse(localStorage.getItem(LS) || '{}'); users = JSON.parse(localStorage.getItem(LA) || '{}'); } catch (e) { }
  const persist = () => { localStorage.setItem(LS, JSON.stringify(store)); localStorage.setItem(LA, JSON.stringify(users)); };
  window.MOCK = { store: () => store, users: () => users, denied: [], writes: [], calls: [], reset() { store = {}; users = {}; persist(); } };
  const TS = { __fv: 'ts' };
  const isTs = v => v && v.__fv === 'ts';
  const now = () => new Date().toISOString();
  function resolve(o, prev) {
    const r = {};
    Object.keys(o).forEach(k => {
      const v = o[k];
      if (isTs(v)) r[k] = now();
      else if (v && v.__fv === 'au') r[k] = [...new Set([...((prev && prev[k]) || []), ...v.v])];
      else r[k] = v;
    });
    return r;
  }
  const segs = p => p.split('/').filter(Boolean);
  function err(code, m) { const e = new Error(m || code); e.code = code; return e; }

  /* ---------------- Usuario actual / claims ---------------- */
  let current = null; const authL = [];
  const OWNER = 'msalinas8811@gmail.com';
  function tokenDe(uid) { if (!uid || !users[uid]) return null; const u = users[uid]; return Object.assign({ email: u.email }, u.claims || {}); }

  /* ---------------- Reglas (espejo de firestore.rules) ---------------- */
  function permitido(op, path, before, after, auth) {
    const s = segs(path); const T = auth ? tokenDe(auth.uid) : null; const uid = auth && auth.uid;
    const isOwner = !!T && T.email === OWNER;
    if (s[0] === 'plataforma') return s[1] === 'publico' && op === 'read' ? true : isOwner;
    if (s[0] === 'solicitudesRes') { if (op === 'create') return Object.keys(after).every(k => ['d', '_t'].includes(k)) && typeof after.d === 'string'; return isOwner; }
    if (s[0] === 'tokens') return op !== 'read' && !!uid && uid === s[1];
    if (s[0] !== 'r') return false;
    const rid = s[1];
    const inRes = !!T && T.rid === rid; const rol = inRes ? T.rol : '';
    const member = isOwner || inRes, isAdmin = isOwner || rol === 'admin';
    const isVig = rol === 'vigilante', isCob = rol === 'cobrador', isRes = rol === 'residente', isVec = ['residente', 'inquilino'].includes(rol), isVend = rol === 'vendedor';
    const casa = (T && T.casa) || ''; const hasCasa = !!casa;
    if (s.length === 2) return op === 'read' ? member : isOwner;
    const col = s[2], id = s[3];
    const nd = after || {}, od = before || {};
    const sobre = () => typeof nd.d === 'string' && nd._u === uid;
    const sinCambio = c => c.every(k => JSON.stringify(nd[k]) === JSON.stringify(od[k]));
    const ownNew = inRes && hasCasa && nd.casaId === casa, ownOld = inRes && hasCasa && od.casaId === casa;
    const W = op !== 'read', C = op === 'create', U = op === 'update', D = op === 'delete';
    const padre = () => { const m = store['r/' + rid + '/miembros/' + id]; return m && m.padreId === uid; };
    const comun = () => op === 'read' ? member : isAdmin;
    switch (col) {
      case 'meta': return op === 'read' ? member : (isAdmin || (['recordados', 'tiendaSeq'].includes(id) && inRes && sobre()) || (id === 'reciboSeq' && isCob && sobre()));
      case 'miembros': if (op === 'read') return member; if (C || D) return false;
        return sobre() && ((isAdmin && sinCambio(['rol', 'casaId'])) || (inRes && uid === id && sinCambio(['rol', 'casaId', 'activo', 'padreId'])) || (isRes && od.padreId === uid && sinCambio(['rol', 'casaId', 'padreId'])));
      case 'perfiles': if (op === 'read') return isAdmin || (inRes && (uid === id || isVig || isCob)) || (isRes && padre());
        return sobre() && (isAdmin || (inRes && uid === id) || (isRes && padre()));
      case 'casas': return comun();
      case 'casasPriv': return op === 'read' ? (isAdmin || isVig || isCob || (inRes && id === casa)) : isAdmin;
      case 'cuotas': if (op === 'read') return isAdmin || isCob || ownOld; if (C || D) return isAdmin;
        return isAdmin || (isCob && sobre()) || (isRes && ownOld && sobre() && sinCambio(['casaId', 'periodo', 'monto']) && ['pendiente', 'revision'].includes(od.estado) && nd.estado === 'revision');
      case 'pagos': if (op === 'read') return isAdmin || isCob || ownOld; if (C) return isAdmin || (isCob && sobre()) || (isRes && ownNew && sobre() && nd.estado === 'revision'); if (U) return isAdmin || (isCob && sobre()); return isAdmin;
      case 'visitasCobro': if (op === 'read') return isAdmin || isCob || ownOld; if (C) return isAdmin || (isRes && ownNew && sobre()); if (U) return isAdmin || (isCob && sobre()) || (isRes && ownOld && sobre() && sinCambio(['casaId', 'cobradorId'])); return isAdmin;
      case 'cierres': if (op === 'read') return isAdmin || isCob; if (C) return isAdmin || (isCob && sobre() && nd.cobradorId === uid); if (U) return isAdmin || (isCob && sobre() && od.cobradorId === uid && sinCambio(['cobradorId', 'estado'])); return isAdmin;
      case 'pases': if (op === 'read') return isAdmin || isVig || ownOld; if (C) return isAdmin || (isVec && ownNew && sobre()); if (U) return isAdmin || (isVig && sobre() && sinCambio(['casaId'])) || (isVec && ownOld && sobre() && sinCambio(['casaId'])); return isAdmin || (isVec && ownOld);
      case 'autorizaciones': if (op === 'read') return isAdmin || isVig || ownOld; if (C) return isAdmin || (isVig && sobre()); if (U) return isAdmin || (isVig && sobre()) || (isVec && ownOld && sobre() && sinCambio(['casaId'])); return isAdmin;
      case 'acadIngresos': return op === 'read' ? (isAdmin || isVig) : (isAdmin || (isVig && sobre()));
      case 'avisos': case 'votaciones': case 'eventos': case 'areas': case 'academias': return comun();
      case 'reclamos': if (op === 'read') return isAdmin || ownOld; if (C) return isAdmin || (isVec && ownNew && sobre()); if (U) return isAdmin || (isVec && ownOld && sobre() && sinCambio(['casaId'])); return isAdmin;
      case 'notifs': if (op === 'read') return isAdmin || (inRes && od.userId === uid); if (C) return member && (isOwner || sobre()) && typeof nd.userId === 'string'; if (U) return isAdmin || (inRes && od.userId === uid && sobre() && sinCambio(['userId'])); return isAdmin || (inRes && od.userId === uid);
      case 'solicitudes': return C ? false : isAdmin;
      case 'alumnos': return op === 'read' ? (isAdmin || (isVig && od.tipo === 'ext') || ownOld) : isAdmin;
      case 'acadPagos': return op === 'read' ? (isAdmin || ownOld) : isAdmin;
      case 'resenas': if (op === 'read') return member; if (C) return isAdmin || (isVec && sobre() && nd.userId === uid); if (U) return isAdmin || (inRes && od.userId === uid && sobre() && sinCambio(['userId', 'tipo', 'ref'])) || (isVend && od.tipo === 'tienda' && od.ref === uid && sobre() && sinCambio(['userId', 'tipo', 'ref'])); return isAdmin || (inRes && od.userId === uid);
      case 'tiendaProductos': if (op === 'read') return member; if (C) return isAdmin || (isVend && sobre() && nd.vendedorId === uid); return isAdmin || (isVend && od.vendedorId === uid && (D || (sobre() && nd.vendedorId === uid)));
      case 'tiendaPedidos': if (op === 'read') return isAdmin || ownOld || (isVend && od.vendedorId === uid); if (C) return isAdmin || (isVec && ownNew && sobre() && nd.compradorId === uid); if (U) return isAdmin || (sobre() && sinCambio(['casaId', 'vendedorId', 'compradorId']) && (ownOld || (isVend && od.vendedorId === uid))); return isAdmin;
      case 'kvVoto': return op === 'read' ? member : (isAdmin || (isRes && hasCasa && sobre() && new RegExp('^vto_.+_' + casa + '$').test(id) && nd.casaId === casa));
      case 'kvBoleta': if (op === 'read') return member; if (C) return isAdmin || (isRes && sobre() && /^vtb_.+/.test(id)); return isAdmin;
      case 'kvRsvp': return op === 'read' ? member : (isAdmin || (isVec && hasCasa && sobre() && new RegExp('^evr_.+_' + casa + '$').test(id) && nd.casaId === casa));
      case 'kvEquipo': if (op === 'read') return member; if (C) return isAdmin || (isVec && sobre() && nd.capId === uid); if (U) return isAdmin || (isVec && sobre() && od.capId === uid && sinCambio(['capId', 'estado'])); return isAdmin;
      case 'kvReserva': if (op === 'read') return member;
        if (C) { if (isAdmin) return true; if (!(isVec && ownNew && sobre())) return false; if (nd.estado === 'pendiente') return true; const a = store['r/' + rid + '/areas/' + nd.areaId]; return nd.estado === 'aprobada' && !!a && a.aprobacion === false; }
        if (U) return isAdmin || (isVec && ownOld && sobre() && sinCambio(['casaId', 'areaId']) && (nd.estado === 'cancelada' || sinCambio(['estado']))); return isAdmin;
      case 'kvSolAcad': if (op === 'read') return isAdmin || ownOld; if (C) return isAdmin || (isVec && ownNew && sobre() && nd.estado === 'pendiente'); return isAdmin;
      case 'auditoria': return op === 'read' && isAdmin;
    }
    return false;
  }

  /* ---------------- Firestore ---------------- */
  const listeners = new Set();
  function notificar() { setTimeout(() => listeners.forEach(l => { try { l.run(); } catch (e) { console.error(e); } }), 0); }
  function escribir(path, data, merge, auth, skipRules) {
    const before = store[path]; let after = data == null ? null : resolve(data, before);
    if (after && merge && before) after = Object.assign({}, before, after);
    const op = after == null ? 'delete' : before ? 'update' : 'create';
    if (op === 'delete' && !before) return;
    if (!skipRules && !permitido(op, path, before, after, auth)) { MOCK.denied.push({ op, path, uid: auth && auth.uid }); throw err('permission-denied', 'Missing or insufficient permissions. ' + op + ' ' + path); }
    if (!skipRules) MOCK.writes.push({ op, path, uid: auth && auth.uid });
    if (after == null) delete store[path]; else store[path] = after;
    persist(); notificar();
  }
  const snapDoc = (path) => { const d = store[path]; return { id: segs(path).pop(), exists: !!d, data: () => d ? JSON.parse(JSON.stringify(d)) : undefined, ref: { path } }; };
  function hijos(col, filtros) {
    const n = segs(col).length + 1; const pre = col + '/';
    return Object.keys(store).filter(p => p.startsWith(pre) && segs(p).length === n && (filtros || []).every(([f, , v]) => store[p][f] === v));
  }
  function DocRef(path) {
    this.path = path; this.id = segs(path).pop();
  }
  DocRef.prototype.get = async function () { if (!permitido('read', this.path, store[this.path] || {}, null, current)) throw err('permission-denied'); return snapDoc(this.path); };
  DocRef.prototype.set = async function (d, o) { escribir(this.path, d, o && o.merge, current); };
  DocRef.prototype.update = async function (d) { if (!store[this.path]) throw err('not-found'); escribir(this.path, d, true, current); };
  DocRef.prototype.delete = async function () { escribir(this.path, null, false, current); };
  DocRef.prototype.onSnapshot = function (next, error) {
    const path = this.path; let last; const auth = current;
    const l = { run: () => { const cur = JSON.stringify(store[path] || null); if (cur === last) return; last = cur; if (!permitido('read', path, store[path] || {}, null, auth)) { listeners.delete(l); MOCK.denied.push({ op: 'listen', path }); error && error(err('permission-denied')); return; } next(snapDoc(path)); } };
    listeners.add(l); setTimeout(l.run, 0); return () => listeners.delete(l);
  };
  function Query(col, filtros) { this.col = col; this.filtros = filtros || []; }
  Query.prototype.where = function (f, op, v) { return new Query(this.col, this.filtros.concat([[f, op, v]])); };
  Query.prototype.doc = function (id) { return new DocRef(this.col + '/' + id); };
  Query.prototype._docs = function (auth) {
    const ps = hijos(this.col, this.filtros);
    // Firestore rechaza la consulta completa si las reglas no la garantizan: aquí, si algún documento no se puede leer
    for (const p of ps) if (!permitido('read', p, store[p], null, auth)) return null;
    if (!ps.length && !permitido('read', this.col + '/__probe__', Object.fromEntries(this.filtros.map(([f, , v]) => [f, v])), null, auth)) return null;
    return ps;
  };
  Query.prototype.get = async function () { const ps = this._docs(current); if (!ps) throw err('permission-denied', 'query ' + this.col); return { docs: ps.map(snapDoc), size: ps.length, empty: !ps.length }; };
  Query.prototype.onSnapshot = function (next, error) {
    const q = this; const auth = current; let prev = new Map();
    const l = { run: () => {
      const ps = q._docs(auth);
      if (!ps) { listeners.delete(l); MOCK.denied.push({ op: 'listen', path: q.col, f: q.filtros }); error && error(err('permission-denied')); return; }
      const cur = new Map(ps.map(p => [p, JSON.stringify(store[p])]));
      const ch = [];
      for (const [p, j] of cur) if (prev.get(p) !== j) ch.push({ type: prev.has(p) ? 'modified' : 'added', doc: snapDoc(p) });
      for (const [p] of prev) if (!cur.has(p)) ch.push({ type: 'removed', doc: { id: segs(p).pop(), data: () => ({}) } });
      const first = !l.ran; l.ran = true; prev = cur;
      if (!ch.length && !first) return;
      next({ docs: ps.map(snapDoc), docChanges: () => ch, size: ps.length });
    } };
    listeners.add(l); setTimeout(l.run, 0); return () => listeners.delete(l);
  };
  const fsApi = {
    doc: p => new DocRef(p), collection: p => new Query(p),
    enablePersistence: async () => { },
    batch() { const ops = []; return { set(r, d, o) { ops.push([r.path, d, o && o.merge]); }, delete(r) { ops.push([r.path, null]); }, update(r, d) { ops.push([r.path, d, true]); }, async commit() { for (const [p, d] of ops) { const b = store[p]; const a = d == null ? null : resolve(d, b); const op = a == null ? 'delete' : b ? 'update' : 'create'; if (op === 'delete' && !b) continue; if (!permitido(op, p, b, a, current)) { MOCK.denied.push({ op, path: p, batch: true }); throw err('permission-denied', 'batch ' + p); } } for (const [p, d, m] of ops) escribir(p, d, m, current, true); MOCK.writes.push({ op: 'batch', n: ops.length }); } }; },
  };

  /* ---------------- Authentication ---------------- */
  function userObj(uid) {
    const u = users[uid];
    return { uid, email: u.email, getIdTokenResult: async () => ({ claims: Object.assign({}, u.claims || {}, { email: u.email }) }), getIdToken: async () => 'tok',
      reauthenticateWithCredential: async c => { if (c.password !== users[uid].password) throw err('auth/wrong-password'); },
      updatePassword: async p => { users[uid].password = p; persist(); } };
  }
  function setCurrent(uid) { current = uid ? userObj(uid) : null; authApi.currentUser = current; authL.forEach(f => setTimeout(() => f(current), 0)); }
  const authApi = {
    currentUser: null,
    async signInWithEmailAndPassword(email, pass) {
      const u = Object.values(users).find(x => x.email === String(email).toLowerCase());
      if (!u || u.password !== pass) throw err('auth/invalid-credential');
      if (u.disabled) throw err('auth/user-disabled');
      setCurrent(u.uid); return { user: current };
    },
    async signOut() { setCurrent(null); },
    onAuthStateChanged(f) { authL.push(f); setTimeout(() => f(current), 0); return () => { }; },
    async sendPasswordResetEmail(e) { MOCK.reset = e; },
  };

  /* ---------------- Cloud Functions con core.js ---------------- */
  const ADMIN = {
    ts: () => now(), now: () => new Date(),
    db: {
      get: async p => store[p] ? JSON.parse(JSON.stringify(store[p])) : null,
      set: async (p, o) => escribir(p, o, false, null, true),
      update: async (p, o) => escribir(p, o, true, null, true),
      del: async p => escribir(p, null, false, null, true),
      query: async (col, f) => hijos(col, f).map(p => ({ id: segs(p).pop(), data: JSON.parse(JSON.stringify(store[p])) })),
      deleteTree: async p => { Object.keys(store).forEach(k => { if (k === p || k.startsWith(p + '/')) delete store[k]; }); persist(); notificar(); },
    },
    auth: {
      create: async o => { if (users[o.uid]) throw err('auth/uid-already-exists'); if (Object.values(users).some(u => u.email === o.email)) throw err('auth/email-already-exists'); if (String(o.password).length < 6) throw err('auth/invalid-password'); users[o.uid] = { uid: o.uid, email: o.email, password: o.password, disabled: !!o.disabled, claims: {} }; persist(); return { uid: o.uid }; },
      update: async (uid, o) => { if (!users[uid]) throw err('auth/user-not-found'); Object.assign(users[uid], o); persist(); },
      remove: async uid => { delete users[uid]; persist(); },
      claims: async (uid, c) => { users[uid].claims = c; persist(); },
      byEmail: async e => Object.values(users).find(u => u.email === e) || null,
      revoke: async () => { },
    },
    push: async () => [],
  };
  let core = null;
  const fnApi = {
    httpsCallable: name => async data => {
      core = core || window.GW_CORE.crearCore(ADMIN);
      const ctx = current ? { uid: current.uid, token: tokenDe(current.uid) } : {};
      MOCK.calls.push({ name, uid: ctx.uid, accion: data && data.accion });
      try { const r = await core[name](JSON.parse(JSON.stringify(data || {})), ctx); return { data: r }; }
      catch (e) { const x = err('functions/' + (e.code || 'internal'), e.message); throw x; }
    },
  };
  window.MOCK.admin = ADMIN; window.MOCK.permitido = permitido; window.MOCK.core = () => (core = core || window.GW_CORE.crearCore(ADMIN));
  window.MOCK.crearDueno = (pass) => { users.owner_uid = { uid: 'owner_uid', email: OWNER, password: pass, claims: {} }; persist(); };

  const app = { functions: () => fnApi, name: '[DEFAULT]' };
  window.firebase = {
    apps: [], initializeApp() { this.apps.push(app); return app; }, app: () => app,
    auth: Object.assign(() => authApi, { EmailAuthProvider: { credential: (email, password) => ({ email, password }) } }),
    firestore: Object.assign(() => fsApi, { FieldValue: { serverTimestamp: () => TS, arrayUnion: (...v) => ({ __fv: 'au', v }) } }),
  };
})();
