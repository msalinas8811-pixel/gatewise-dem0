/* =========================================================
   UI 6 · SISTEMA DE BOTONES Y CONFIRMACIONES
   - Una sola fuente de estilos para los botones (css/botones.css):
     al arrancar se retiran las reglas de botón de las capas anteriores.
   - Íconos automáticos según la acción (Aprobar ✓, Eliminar 🗑, Nuevo +…)
     y flecha de avance en las acciones principales.
   - Onda al tocar, vibración corta en Android y foco visible con teclado.
   - "Cargando" en el botón mientras el servidor responde, y bloqueo de
     doble envío (dos toques seguidos no crean dos registros).
   - confirmar() y pedirTexto(): ventanas propias en lugar de las del navegador.
   ========================================================= */
(function () {
  /* ---------- 1. Íconos que faltaban ---------- */
  Object.assign(ICON, {
    arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  });
  if (!ICON.download) ICON.download = '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>';

  /* ---------- 2. Una sola fuente de estilos para .btn ---------- */
  const esDeBoton = sel => /^\.btns?\b/.test(sel.trim());
  function limpiarReglas(lista) {
    for (let i = lista.length - 1; i >= 0; i--) {
      const r = lista[i];
      if (r.cssRules && !r.selectorText) { limpiarReglas(r.cssRules); continue; }
      if (!r.selectorText || !/\.btns?\b/.test(r.selectorText)) continue;
      const partes = r.selectorText.split(',');
      const quedan = partes.filter(p => !esDeBoton(p));
      if (quedan.length === partes.length) continue;
      try { if (!quedan.length) (r.parentRule || r.parentStyleSheet).deleteRule(i); else r.selectorText = quedan.join(','); } catch (e) { }
    }
  }
  function unificarEstilos() {
    for (const sh of document.styleSheets) {
      const n = sh.ownerNode;
      if (n && n.href && /botones\.css/.test(n.href)) continue;
      if (n && n.id === 'botones-css') continue;
      try { limpiarReglas(sh.cssRules); } catch (e) { /* hoja externa (fuentes) */ }
    }
    const link = document.querySelector('link[href*="botones.css"],style#botones-css');
    if (link && link !== document.head.lastElementChild) document.head.appendChild(link);
  }
  unificarEstilos();

  /* ---------- 3. Íconos automáticos según la acción ---------- */
  const REGLAS = [
    [/^(cerrar sesión|salir|sign out|log out)/i, 'out'],
    [/^(aprobar|aceptar|confirmar|listo|entendido|marcar (como )?pagad|marcar ingreso|approve|accept|confirm|done|got it)/i, 'check'],
    [/^(guardar|save)/i, 'check'],
    [/^(rechazar|reject|decline)/i, 'x'],
    [/^(cancelar|cerrar|cancel|close)\b/i, 'x'],
    [/^(eliminar|borrar|quitar|delete|remove)/i, 'trash', 'b-danger'],
    [/^(ver|abrir|view|open|see)\b/i, 'eye'],
    [/^(descargar|download)/i, 'download'],
    [/^(compartir|share)/i, 'share'],
    [/^(editar|cambiar|modificar|edit|change)/i, 'edit'],
    [/^(\+|nuevo|nueva|agregar|añadir|crear|registrar|invitar|new|add|create|invite)/i, 'plus'],
    [/^(enviar|publicar|send|publish|post)/i, 'send'],
    [/^(subir|importar|adjuntar|upload|import|attach)/i, 'upload'],
    [/^(ir a pagar|pagar|pay)/i, 'card'],
    [/^(llamar|call)\b/i, 'phone'],
    [/^(copiar|copy)/i, 'copy'],
    [/^(buscar|search)/i, 'search'],
    [/^(reporte|reportar|report)/i, 'doc'],
    [/^(soy propietario|crear mi cuenta|i'?m an owner|create my account)/i, 'userplus'],
    [/^(quiero la app|solicitar|i want the app|request)/i, 'building'],
    [/^(whatsapp)/i, 'chat'],
    [/^(renovar|regenerar|generar|actualizar|renew|regenerate|update)/i, 'refresh'],
  ];
  const AVANZA = /^(ingresar|entrar|continuar|siguiente|comenzar|empezar|sign in|log in|continue|next|start)/i;
  const tieneIcono = b => !!b.querySelector('svg,img,.mic,.b-ar');
  const esRelleno = b => !/\b(sec|ghost|bad)\b/.test(b.className);

  function envolverTexto(b) {
    b.childNodes.forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'b-tx'; s.textContent = n.textContent; n.replaceWith(s); }
    });
  }
  function procesar(b) {
    b.dataset.b6 = '1';
    const txt = (b.textContent || '').replace(/\s+/g, ' ').trim();
    // emoji al inicio (🗑️ Borrar…): se cambia por el ícono equivalente
    const sinEmoji = txt.replace(/^[\u{1F300}-\u{1FAFF}☀-➿️\s]+/u, '');
    if (txt && txt.length <= 42 && !tieneIcono(b)) {
      const regla = REGLAS.find(([re]) => re.test(sinEmoji));
      if (regla) {
        if (sinEmoji !== txt || /^\+\s*/.test(txt)) {
          // quitar el emoji o el "+" del texto, ya que se muestra como ícono
          const limpio = sinEmoji.replace(/^\+\s*/, '');
          if (b.children.length === 0) b.textContent = limpio;
        }
        b.insertAdjacentHTML('afterbegin', ic(regla[1], 18));
        if (regla[2] && /\bghost\b/.test(b.className)) b.classList.add(regla[2]);
      } else if (esRelleno(b) && /\bblock\b/.test(b.className) && (AVANZA.test(txt) || (b.form && b.type === 'submit'))) {
        envolverTexto(b);
        b.insertAdjacentHTML('beforeend', `<span class="b-ar" aria-hidden="true">${ic('arr', 16)}</span>`);
      }
    }
    if (/\bghost\b/.test(b.className) && /color:\s*var\(--bad\)/.test(b.getAttribute('style') || '')) { b.classList.add('b-danger'); b.style.color = ''; }
    envolverTexto(b);
  }
  let pendiente = false;
  function procesarTodo() {
    pendiente = false;
    document.querySelectorAll('.btn:not([data-b6])').forEach(b => { try { procesar(b); } catch (e) { b.dataset.b6 = '1'; } });
  }
  new MutationObserver(() => { if (!pendiente) { pendiente = true; requestAnimationFrame(procesarTodo); } })
    .observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- 4. Onda al tocar y vibración corta ---------- */
  const menosMov6 = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('.btn');
    if (!b || b.disabled || b.classList.contains('is-busy') || e.button > 0) return;
    if (!menosMov6()) {
      const r = b.getBoundingClientRect(); const s = document.createElement('span');
      s.className = 'b-rip'; s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
      s.style.setProperty('--b-rs', Math.ceil(Math.hypot(r.width, r.height) * 2 / 12));
      b.appendChild(s); setTimeout(() => s.remove(), 600);
    }
    if (e.pointerType === 'touch' && esRelleno(b) && navigator.vibrate) { try { navigator.vibrate(8); } catch (x) { } }
  }, { passive: true });

  /* ---------- 5. Cargando + bloqueo de doble envío ---------- */
  let n = 0; const ocupados = new Set();
  const B = window.GW_BUSY = {
    inc() { n++; },
    dec() { n = Math.max(0, n - 1); if (!n) liberarTodo(); },
    get activos() { return n; },
  };
  function ponerOcupado(b) {
    if (!b || !b.isConnected || b.classList.contains('is-busy')) return;
    envolverTexto(b);
    if (!b.querySelector('.b-spin')) b.insertAdjacentHTML('beforeend', '<span class="b-spin" aria-hidden="true"><i></i></span>');
    b.classList.add('is-busy'); b.setAttribute('aria-busy', 'true'); b._b6t = Date.now(); ocupados.add(b);
    b._b6max = setTimeout(() => liberar(b), 20000);
  }
  function liberar(b) {
    const falta = Math.max(0, 380 - (Date.now() - (b._b6t || 0)));   // que no parpadee
    setTimeout(() => { b.classList.remove('is-busy'); b.removeAttribute('aria-busy'); clearTimeout(b._b6max); ocupados.delete(b); }, falta);
  }
  function liberarTodo() { [...ocupados].forEach(liberar); }
  function vigilar(b) {
    // si a los 120 ms el botón sigue en pantalla y hay algo pendiente en el servidor, mostrar "cargando"
    setTimeout(() => { if (n > 0 && b && b.isConnected) ponerOcupado(b); }, 120);
  }
  const ultimoEnvio = new WeakMap();
  document.addEventListener('submit', e => {
    const f = e.target; const sb = e.submitter || f.querySelector('button:not([type=button]),.btn[type=submit]');
    const ahora = Date.now(); const prev = ultimoEnvio.get(f) || 0;
    const repetido = ahora - prev < 150 || (ahora - prev < 1500 && n > 0);   // doble toque, o el anterior aún espera al servidor
    if ((sb && sb.classList.contains('is-busy')) || repetido) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    ultimoEnvio.set(f, ahora);
    if (sb && sb.classList.contains('btn')) vigilar(sb);
  }, true);
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.btn');
    if (!b) return;
    if (b.classList.contains('is-busy')) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    const envia = b.form && (b.type === 'submit');   // los envíos de formulario se vigilan en 'submit'
    if (!envia) vigilar(b);
  }, true);

  /* ---------- 6. Confirmaciones propias (en lugar de confirm/prompt del navegador) ---------- */
  let cbConf = null;
  // opts: {icono, tono:'bad'|'warn'|'pri'|'ok', no:'texto del botón de volver'}
  window.confirmar = function (titulo, texto, boton, cb, opts) {
    opts = opts || {}; cbConf = cb;
    const tono = opts.tono || 'bad';
    const col = { bad: 'var(--bad)', warn: 'var(--warn)', pri: 'var(--pri)', ok: 'var(--ok)' }[tono] || 'var(--bad)';
    const cls = tono === 'bad' ? 'btn bad' : tono === 'ok' ? 'btn ok' : 'btn';
    const icono = opts.icono || (tono === 'bad' ? 'trash' : 'alert');
    sheet(titulo, `<div class="b-conf" style="--b-c:${col}"><div class="b-conf-ic">${ic(icono, 26)}</div><p>${texto}</p>
      <div class="btns"><button class="${cls}" data-b6="1" onclick="GW_CONF.si()">${ic(tono === 'bad' ? 'trash' : 'check', 18)}<span class="b-tx">${esc(boton)}</span></button><button class="btn ghost" data-b6="1" onclick="closeSheet()"><span class="b-tx">${esc(opts.no || 'Cancelar')}</span></button></div></div>`);
  };
  window.pedirTexto = function (titulo, label, def, cb, opts) {
    opts = opts || {}; cbConf = cb;
    sheet(titulo, `<form onsubmit="event.preventDefault();GW_CONF.texto()"><label class="f">${label}<textarea id="b6tx" required>${esc(def || '')}</textarea></label>
      <div class="btns"><button class="btn bad" data-b6="1">${ic('x', 18)}<span class="b-tx">${esc(opts.boton || 'Confirmar')}</span></button><button type="button" class="btn ghost" data-b6="1" onclick="closeSheet()"><span class="b-tx">Volver</span></button></div></form>`);
    setTimeout(() => { const t = document.getElementById('b6tx'); if (t) { t.focus(); t.select(); } }, 60);
  };
  window.GW_CONF = {
    si() { const f = cbConf; cbConf = null; closeSheet(); if (f) f(); },
    texto() { const t = document.getElementById('b6tx'); const v = t ? t.value.trim() : ''; if (!v) return toast('Escribe el motivo'); const f = cbConf; cbConf = null; closeSheet(); if (f) f(v); },
  };

  Object.assign(I18N, {
    '¿Generar un código nuevo?': 'Generate a new code?', 'El código anterior dejará de funcionar.': 'The previous code will stop working.', 'Generar código': 'Generate code',
    'Rechazar pago': 'Reject payment', 'Motivo (lo verá el residente)': 'Reason (the resident will see it)', 'Rechazar solicitud': 'Reject request', 'Motivo (lo verá la persona)': 'Reason (the person will see it)',
    '¿Eliminar este aviso?': 'Delete this notice?', 'Dejará de verse para todos los residentes.': 'It will no longer be visible to residents.', 'Eliminar aviso': 'Delete notice', 'Aviso eliminado': 'Notice deleted',
    'La casa ya tiene propietario': 'The house already has an owner', 'Aprobar y reemplazar': 'Approve and replace',
    '¿Cancelar este pase?': 'Cancel this pass?', 'El PIN dejará de funcionar en portería.': 'The PIN will stop working at the gate.', 'Cancelar pase': 'Cancel pass', 'Mantener pase': 'Keep pass',
    'Volver': 'Back', 'Escribe el motivo': 'Write the reason',
  });
})();
