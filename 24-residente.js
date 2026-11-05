/* =========================================================
   UI 7 · PANTALLAS DEL RESIDENTE E INQUILINO
   Inicio nuevo, pensado también para personas mayores:
   - estado de cuenta claro arriba ("¡Estás al día!" o "Debes $35.00")
     con un botón grande para pagar
   - "¿Qué necesitas hoy?": botones grandes con ícono, título y explicación
   - llamar a portería con un toque; emergencia en rojo, a todo lo ancho
   - tamaño de letra ajustable (Normal / Grande / Muy grande)
   Estilos en css/residente.css
   ========================================================= */
(function () {
  ICON.aa = '<path d="M3 19 8.5 5h1L15 19M5.2 14h7.6"/><path d="M16 19l2.6-7h.8L22 19M16.9 16.8h4.2"/>';
  const esVecino = u => !!u && (u.rol === 'residente' || u.rol === 'inquilino');

  /* ---------- Tamaño de letra (se guarda en este teléfono) ---------- */
  const LKEY = 'gw_letra';
  let letra = 0; try { letra = Math.max(0, Math.min(2, +localStorage.getItem(LKEY) || 0)); } catch (e) { }
  function aplicarLetra() { const h = document.documentElement; h.classList.remove('letra-1', 'letra-2'); if (letra) h.classList.add('letra-' + letra); }
  aplicarLetra();
  window.verLetra = function () {
    const op = [['Normal', 15], ['Grande', 19], ['Muy grande', 23]];
    sheet('Tamaño de letra', `<p class="note" style="margin-top:0">Elige cómo se ve más cómodo. Se guarda en este teléfono.</p>
      <div class="r7-letras">${op.map(([t, px], i) => `<button class="${letra === i ? 'on' : ''}" onclick="ponerLetra(${i})"><b style="font-size:${px + 6}px">Aa</b><span>${t}</span></button>`).join('')}</div>`);
  };
  window.ponerLetra = function (i) { letra = i; try { localStorage.setItem(LKEY, String(i)); } catch (e) { } aplicarLetra(); closeSheet(); render(); toast(['Letra normal', 'Letra grande', 'Letra muy grande'][i]); };

  /* ---------- Estado de cuenta de la casa ---------- */
  function estado7(cid) {
    const m = moraCasa(cid), p = pendCasa(cid);
    const todas = cuotasCasa(cid).filter(q => q.estado === 'pendiente');
    if (m.length) return { c: 'bad', i: 'alert', t: m.length === 1 ? 'Tienes 1 mes atrasado' : `Tienes ${m.length} meses atrasados`, s: m.map(c => perL(c.periodo)).join(', ') + ' · incluye recargo', monto: sum(todas, montoCuota), ml: todas.length > m.length ? `Total (${todas.length} meses)` : 'Total', pagar: true };
    if (p.length) {
      const vf = vence(periodoActual()); const d = Math.ceil((new Date(vf + 'T23:59') - new Date()) / 864e5);
      return { c: 'warn', i: 'clock', t: 'Cuota de ' + perL(periodoActual()), s: 'Vence el ' + fFecha(vf) + (d >= 0 ? (d === 0 ? ' · hoy' : d === 1 ? ' · mañana' : ` · en ${d} días`) : ''), monto: sum(todas, montoCuota), ml: 'Por pagar', pagar: true };
    }
    if (cuotasCasa(cid).some(q => q.estado === 'revision')) return { c: 'info', i: 'info', t: 'Pago en revisión', s: 'La administración está validando tu comprobante' };
    const c = casa(cid); const nx = addMonths(periodoActual(), 1);
    return { c: 'ok', i: 'check', t: '¡Estás al día!', s: 'Próxima cuota: ' + fFecha(vence(nx)), monto: (c && c.cuota) || DB.config.cuota, ml: 'Cuota' };
  }
  const estHTML = e => `<div class="r7-est ${e.c}"><span class="r7-ei">${ic(e.i, 26)}</span><b class="r7-tt">${e.t}</b>${e.monto != null ? `<span class="r7-monto"><small>${e.ml || ''}</small>${money(e.monto)}</span>` : ''}<span class="r7-sub">${e.s}</span></div>`;

  /* ---------- Portada ---------- */
  function hero7(u) {
    let est = '';
    if (u.rol === 'residente' && u.casaId) {
      const e = estado7(u.casaId);
      est = estHTML(e) + (e.pagar ? `<button class="r7-pagar" onclick="S.sel=null;go('pagos')">${ic('card', 22)}<span>Pagar mi cuota</span></button>` : '');
    } else if (u.rol === 'inquilino' && u.hasta) {
      est = estHTML({ c: 'ok', i: 'key', t: 'Tu acceso está activo', s: 'Hasta el ' + fFecha(u.hasta) });
    }
    return `<section class="r7-hero"><div class="r7-top"><small>${fechaLarga5()}</small><button class="r7-aa" onclick="verLetra()" aria-label="Cambiar tamaño de letra"><b>Aa</b>Letra</button></div>
      <h2>${saludo5()}, ${esc(u.nombre.split(' ')[0])}</h2><p class="r7-casa">${u.casaId ? esc(casaNom(u.casaId)) + ' · ' : ''}${esc(DB.residencial.nombre)}</p>${est}</section>`;
  }

  /* ---------- Botones grandes ---------- */
  const tile = (o) => {
    const inner = `<span class="r7-ti">${ic(o.i, 27)}</span><span><b>${o.t}</b><small>${o.s}</small></span>${o.badge ? `<span class="r7-bd">${o.badge}</span>` : ''}`;
    return o.href ? `<a class="r7-t c-${o.c}" href="${o.href}">${inner}</a>` : `<button class="r7-t c-${o.c}" onclick="${o.on}">${inner}</button>`;
  };
  function tiles7(u) {
    const V = VIEWS[u.rol] || {}; const T = [];
    T.push({ i: 'ticket', c: 'teal', t: 'Dar acceso a una visita', s: 'Crea un pase y compártelo', on: 'elegirPase7()' });
    if (V.pagos) { const e = estado7(u.casaId); T.push({ i: 'wallet', c: 'indigo', t: 'Pagar mi cuota', s: e.pagar ? money(e.monto) + ' pendiente' : 'Ver mis pagos y recibos', on: "S.sel=null;go('pagos')", badge: e.pagar ? '!' : '' }); }
    const tel = ((DB.residencial.vigilancia || {}).telefono || '').trim();
    T.push(tel ? { i: 'phone', c: 'green', t: 'Llamar a portería', s: esc(tel), href: 'tel:' + tel.replace(/[^\d+]/g, '') } : { i: 'phone', c: 'green', t: 'Números de la residencial', s: 'Portería y administración', on: "go('directorio')" });
    const sem = addDays(ymd(), -7); const nAv = DB.avisos.filter(a => String(a.fecha).slice(0, 10) >= sem).length;
    T.push({ i: 'mega', c: 'amber', t: 'Avisos', s: nAv ? (nAv === 1 ? '1 nuevo esta semana' : nAv + ' nuevos esta semana') : 'Noticias de la residencial', on: "go('avisos')", badge: nAv || '' });
    if (V.reservas) T.push({ i: 'calendar', c: 'violet', t: 'Reservar un área', s: 'Salón, cancha y más', on: "go('reservas')" });
    if (V.reclamos) T.push({ i: 'chatalert', c: 'orange', t: 'Reportar un problema', s: 'Fugas, luces, ruido…', on: "go('reclamos')" });
    if (T.length % 2 && V.eventos) T.push({ i: 'party', c: 'pink', t: 'Eventos', s: 'Fiestas y torneos', on: "go('eventos')" });
    if (T.length % 2 && V.tienda) T.push({ i: 'store', c: 'sky', t: 'Tienda', s: 'Compra a vecinos', on: "go('tienda')" });
    return `<div class="r7-grid">${T.map(tile).join('')}<button class="r7-t r7-sos" onclick="S.dseg='emergencia';go('directorio')"><span class="r7-ti">${ic('siren', 27)}</span><span><b>Emergencias</b><small>911, policía, bomberos y números de la residencial</small></span><span class="r7-sos-ch">${ic('chev', 22)}</span></button></div>`;
  }

  /* ---------- Elegir el tipo de pase ---------- */
  const DESC = { personal: 'Empleada, jardinero, técnico', entrega: 'Repartidor de comida', correo: 'Mensajero o encomienda', visita: 'Familia o amigos' };
  window.elegirPase7 = function () {
    sheet('¿A quién vas a dar acceso?', `<div class="r7-tipos">${Object.entries(TIPOS).map(([k, t]) => `<button class="r7-tipo" onclick="nuevoPase('${k}')"><span class="ti-big ti-${k}">${ic(t.i, 26)}</span><span><b>${t.l}</b><small>${DESC[k] || ''}</small></span>${ic('chev', 20)}</button>`).join('')}</div>`);
  };

  /* ---------- Inicio ---------- */
  let ultimaPestana = '';
  function vInicio7() {
    const u = S.user, cid = u.casaId;
    const aut = DB.autorizaciones.filter(a => a.casaId === cid && a.estado === 'esperando');
    const hoyP = DB.pases.filter(p => p.casaId === cid && (vigenteHoy(p) || dentro(p)));
    let h = hero7(u);
    if (aut.length) h += `<h3>Te esperan en portería</h3>` + aut.map(autCard).join('');
    h += `<div class="r7-q">¿Qué necesitas hoy?</div>` + tiles7(u);
    let rec = recordatoriosRes(u);
    if (u.rol === 'residente') rec = rec.replace(/<button class="rr" onclick="(?:S\.sel=null;)?go\('pagos'\)">[\s\S]*?<\/button>/, '');
    if (!/class="rr"/.test(rec)) rec = '';
    h += rec + votHomeRes();
    h += `<h3>Visitas de hoy</h3>` + (hoyP.map(paseItem).join('') || `<div class="r7-vacio"><span class="mic c-teal">${ic('ticket', 22)}</span><p><b>No tienes visitas para hoy</b>Cuando esperes a alguien, toca «Dar acceso a una visita».</p></div>`);
    const av = DB.avisos.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 2);
    if (av.length) h += `<h3>Últimos avisos</h3>` + av.map(a => avisoCard(a, false)).join('');
    const animar = ultimaPestana !== 'inicio'; ultimaPestana = 'inicio';
    return `<div class="r7${animar && !menosMov() ? ' r7-in' : ''}">${h}</div>`;
  }
  ['residente', 'inquilino'].forEach(r => { if (VIEWS[r]) VIEWS[r].inicio = vInicio7; });

  /* ---------- Mis pagos: estado grande arriba con los botones de pago ---------- */
  if (VIEWS.residente && VIEWS.residente.pagos) {
    const basePagos = VIEWS.residente.pagos;
    VIEWS.residente.pagos = function () {
      let h = basePagos.apply(this, arguments);
      try {
        const cid = S.user.casaId; const cs = cuotasCasa(cid); const pend = cs.filter(c => c.estado === 'pendiente'); const m = moraCasa(cid);
        const viejo = m.length ? alertBox('bad', `En mora: ${m.length} mes(es) · ${money(sum(m, montoCuota))}`, `${m.map(c => perL(c.periodo)).join(', ')}. Incluye recargo de ${money(DB.config.recargo)} por mes vencido.`)
          : pend.length ? alertBox('warn', 'Cuota pendiente', `Vence el ${fFecha(vence(periodoActual()))}.`) : alertBox('ok', 'Estás al día ✓', '');
        const e = estado7(cid);
        const card = `<div class="r7-pago ${e.c}">${estHTML(e)}${pend.length ? `<button class="r7-pagar" onclick="pagarLink()">${ic('card', 22)}<span>Pagar en línea</span></button><button class="r7-sec" onclick="pagarTransf()">${ic('upload', 20)}<span>Ya transferí · enviar comprobante</span></button>` : ''}</div>`;
        if (h.includes(viejo)) h = h.replace(viejo, card);
      } catch (x) { }
      return h;
    };
  }

  /* ---------- Menú: tamaño de letra para todos ---------- */
  Object.keys(VIEWS).forEach(r => {
    const V = VIEWS[r]; if (!V || !V.mas) return; const b = V.mas;
    V.mas = function () {
      const h = b.apply(this, arguments); const it = menuItem('aa', 'Tamaño de letra', 'verLetra()', '');
      const i = h.indexOf('<h3>Sesión</h3>'); return i >= 0 ? h.slice(0, i + 15) + it + h.slice(i + 15) : h + it;
    };
  });
  if (typeof ICOL !== 'undefined') ICOL.aa = 'indigo';

  /* ---------- Cada vez que se dibuja la pantalla ---------- */
  const r7base = render;
  render = function () {
    if (S.tab !== 'inicio') ultimaPestana = S.tab;
    r7base.apply(this, arguments);
    try {
      document.body.classList.toggle('rol-vecino', esVecino(S.user));
      // descripción corta en los tipos de pase (pantalla Accesos)
      document.querySelectorAll('.tipos button').forEach(bt => {
        if (bt.querySelector('.r7-d')) return; const m = (bt.getAttribute('onclick') || '').match(/nuevoPase\('(\w+)'\)/);
        if (m && DESC[m[1]]) bt.insertAdjacentHTML('beforeend', `<small class="r7-d">${DESC[m[1]]}</small>`);
      });
    } catch (e) { }
  };

  Object.assign(I18N, {
    'Tamaño de letra': 'Text size', 'Elige cómo se ve más cómodo. Se guarda en este teléfono.': 'Choose what is most comfortable. It is saved on this phone.', 'Normal': 'Normal', 'Grande': 'Large', 'Muy grande': 'Extra large',
    'Letra normal': 'Normal text', 'Letra grande': 'Large text', 'Letra muy grande': 'Extra large text', 'Letra': 'Text',
    '¡Estás al día!': "You're up to date!", 'Pago en revisión': 'Payment under review', 'La administración está validando tu comprobante': 'The administration is checking your receipt',
    'Tienes 1 mes atrasado': 'You have 1 overdue month', 'Pagar mi cuota': 'Pay my fee', 'Ver mis pagos y recibos': 'See my payments and receipts',
    '¿Qué necesitas hoy?': 'What do you need today?', 'Dar acceso a una visita': 'Let a visitor in', 'Crea un pase y compártelo': 'Create a pass and share it',
    'Llamar a portería': 'Call the gate', 'Números de la residencial': 'Community numbers', 'Portería y administración': 'Gate and administration',
    'Noticias de la residencial': 'Community news', '1 nuevo esta semana': '1 new this week', 'Reservar un área': 'Book an area', 'Salón, cancha y más': 'Hall, court and more',
    'Reportar un problema': 'Report a problem', 'Fugas, luces, ruido…': 'Leaks, lights, noise…', 'Fiestas y torneos': 'Parties and tournaments', 'Compra a vecinos': 'Buy from neighbors',
    '911, policía, bomberos y números de la residencial': '911, police, firefighters and community numbers',
    '¿A quién vas a dar acceso?': 'Who are you letting in?', 'Empleada, jardinero, técnico': 'Housekeeper, gardener, technician', 'Repartidor de comida': 'Food delivery',
    'Mensajero o encomienda': 'Courier or parcel', 'Familia o amigos': 'Family or friends', 'Te esperan en portería': 'Someone is waiting at the gate', 'Visitas de hoy': "Today's visitors",
    'No tienes visitas para hoy': 'No visitors today', 'Cuando esperes a alguien, toca «Dar acceso a una visita».': 'When you expect someone, tap “Let a visitor in”.',
    'Pagar en línea': 'Pay online', 'Ya transferí · enviar comprobante': 'I already transferred · send receipt', 'Tu acceso está activo': 'Your access is active',
  });
})();
