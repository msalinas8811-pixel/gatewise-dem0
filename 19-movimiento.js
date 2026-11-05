/* =========================================================
   UI 4 · MOVIMIENTO Y ACABADO (principios de Emil Kowalski)
   - Curvas propias, nada de ease-in, animaciones de UI < 300 ms
   - Respuesta al tocar (scale .97), hover solo con puntero fino
   - Hojas tipo iOS: entran con curva de cajón, salen más rápido,
     se pueden cerrar deslizando hacia abajo (por velocidad)
   - Avisos tipo Sonner, entrada de pantalla con escalonado corto
   - Respeta "reducir movimiento"
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style id="ui4">
:root{--ease-out:cubic-bezier(.23,1,.32,1);--ease-in-out:cubic-bezier(.77,0,.175,1);--ease-drawer:cubic-bezier(.32,.72,0,1);
  --shadow:0 1px 2px rgba(16,24,40,.05),0 1px 3px rgba(16,24,40,.04);--shadow-md:0 2px 4px rgba(16,24,40,.04),0 8px 20px rgba(16,24,40,.07)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--shadow:none;--shadow-md:0 8px 24px rgba(0,0,0,.35)}}
:root[data-theme="dark"]{--shadow:none;--shadow-md:0 8px 24px rgba(0,0,0,.35)}
body{background:radial-gradient(120% 60% at 50% -10%,color-mix(in srgb,var(--pri) 7%,transparent),transparent 55%) fixed,var(--bg)}
/* Respuesta al tocar: todo lo que se presiona responde al instante */
.btn,.item,.kpi,.tipos button,.icon-btn,.lang-pill,.chip,.opt,.sl3,.av-top,.pk,.mi{transition:transform 160ms var(--ease-out),background-color 150ms ease,border-color 150ms ease,box-shadow 200ms ease,color 150ms ease,opacity 150ms ease,filter 150ms ease}
.btn:active,.item:active,.kpi:active,.tipos button:active,.chip:active,.opt:active,.sl3:active,.lang-pill:active,.mi:active{transform:scale(.97)}
.icon-btn:active,.av-top:active{transform:scale(.92)}
.nav .ni{transition:background-color 220ms ease,color 180ms ease,transform 160ms var(--ease-out)}
.nav button:active .ni{transform:scale(.9)}
/* Hover solo con mouse (en el teléfono el "hover" se queda pegado al tocar) */
@media (hover:none){.item:hover,.kpi:hover,.tipos button:hover{box-shadow:var(--shadow);border-color:var(--line)}.btn:hover{filter:none}}
@media (hover:hover) and (pointer:fine){.item:hover,.kpi:hover,.tipos button:hover{box-shadow:var(--shadow-md);border-color:color-mix(in srgb,var(--pri) 30%,var(--line))}}
/* Botón principal con brillo sutil */
.btn:not(.sec):not(.ghost):not(.bad):not(.ok){background:linear-gradient(180deg,color-mix(in srgb,var(--pri) 88%,#fff),var(--pri));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 1px 2px rgba(16,24,40,.14)}
.btn.ok{background:linear-gradient(180deg,color-mix(in srgb,var(--ok) 88%,#fff),var(--ok));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 1px 2px rgba(16,24,40,.14)}
.card,.item,.kpi{box-shadow:var(--shadow)}
.top{background:linear-gradient(180deg,color-mix(in srgb,var(--bar,var(--pri)) 90%,#fff),var(--bar,var(--pri)))}
@media (min-width:768px){.top{background:color-mix(in srgb,var(--bg) 86%,transparent)}}
/* Hojas (formularios): cajón tipo iOS en teléfono, ventana centrada en PC */
.ov{opacity:0;transition:opacity 240ms ease}
.ov.open{opacity:1}
.ov.closing{opacity:0;transition:opacity 180ms ease;pointer-events:none}
.sheet{animation:none!important;transform:translateY(100%);transition:transform 420ms var(--ease-drawer);will-change:transform}
.ov.open .sheet{transform:translateY(0)}
.ov.closing .sheet{transform:translateY(100%);transition:transform 220ms var(--ease-out)}
.sh-h{touch-action:none;cursor:grab}
@media (min-width:768px){.sheet{transform:scale(.96);opacity:0;transition:transform 220ms var(--ease-out),opacity 180ms ease}.ov.open .sheet{transform:scale(1);opacity:1}.ov.closing .sheet{transform:scale(.97);opacity:0;transition:transform 150ms var(--ease-out),opacity 150ms ease}.sh-h{cursor:default}}
/* Avisos tipo Sonner */
.toast{display:flex;align-items:center;gap:10px;opacity:0;transform:translate(-50%,calc(100% + 24px)) scale(.97);transition:opacity 260ms var(--ease-out),transform 400ms var(--ease-out);pointer-events:none;background:#111827;color:#fff;border-radius:14px;padding:12px 16px;box-shadow:0 10px 30px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.06) inset;font-weight:550}
.toast.show{opacity:1;transform:translate(-50%,0) scale(1);pointer-events:auto}
.toast .t-ic{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12)}
/* Menú lateral con curva de cajón */
.sb3{transition:transform 360ms var(--ease-drawer),width 220ms var(--ease-out)}
.sb-scrim{transition:opacity 260ms ease}
/* Entrada de pantalla: corta y escalonada (solo al cambiar de sección) */
@keyframes gwIn{from{opacity:0;transform:translateY(8px)}}
@keyframes gwGrow{from{transform:scaleX(0)}}
@keyframes gwRise{from{transform:scaleY(0)}}
.pg-in>*{animation:gwIn 280ms var(--ease-out) both}
.pg-in>*:nth-child(2){animation-delay:30ms}.pg-in>*:nth-child(3){animation-delay:60ms}.pg-in>*:nth-child(4){animation-delay:90ms}.pg-in>*:nth-child(5){animation-delay:120ms}.pg-in>*:nth-child(6){animation-delay:150ms}.pg-in>*:nth-child(7){animation-delay:180ms}.pg-in>*:nth-child(n+8){animation-delay:200ms}
.pg-in .pbar>b,.pg-in .hb .tr>b,.pg-in .dist i b,.pg-in .rbar .pbar>b{transform-origin:left;animation:gwGrow 700ms var(--ease-out) 120ms both}
.pg-in .bars i{transform-origin:bottom;animation:gwRise 700ms var(--ease-out) 120ms both}
/* Estados vacíos amables */
.empty{padding:26px 14px}
.empty::before{content:"";display:block;width:40px;height:40px;margin:0 auto 10px;background:var(--muted);opacity:.45;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-6l-2 3h-4l-2-3H2'/%3E%3Cpath d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-6l-2 3h-4l-2-3H2'/%3E%3Cpath d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/%3E%3C/svg%3E") center/contain no-repeat}
/* Insignias que aparecen con un pequeño "pop" */
@keyframes gwPop{from{transform:scale(.6);opacity:0}}
.badge,.sb-bd,.nav .nb{animation:gwPop 260ms var(--ease-out) both}
/* Recordatorios */
.rec{padding:6px 6px 6px 14px}.rec .rec-h{display:flex;align-items:center;gap:8px;padding:8px 8px 6px 0}
.rr{display:flex;align-items:center;gap:12px;width:100%;border:0;background:none;padding:10px 8px 10px 0;text-align:left;color:var(--text);border-top:1px solid var(--line);border-radius:0}
.rr:first-of-type{border-top:0}.rr .grow{min-width:0}.rr b{display:block;font-size:14.5px}.rr small{display:block;color:var(--muted);font-size:13px}
@media (hover:hover) and (pointer:fine){.rr:hover{background:color-mix(in srgb,var(--pri) 5%,transparent)}}
/* Reducir movimiento: sin desplazamientos, solo fundidos cortos */
@media (prefers-reduced-motion:reduce){
  .pg-in>*,.pg-in .pbar>b,.pg-in .hb .tr>b,.pg-in .bars i,.pg-in .dist i b,.badge,.sb-bd,.nav .nb{animation:none!important}
  .sheet,.ov.open .sheet,.ov.closing .sheet{transform:none!important;transition:opacity 150ms ease!important}
  .ov:not(.open) .sheet{opacity:0}.toast{transform:translate(-50%,0)!important}
  .btn:active,.item:active,.kpi:active,.icon-btn:active{transform:none}
}
</style>`);
const menosMov=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
/* Hojas: entrada con transición (interrumpible), salida más rápida, cerrar deslizando */
function sheet(title,html){closeSheet();const d=document.createElement('div');d.className='ov';d.id='ov';
  d.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(String(title).replace(/<[^>]+>/g,''))}"><div class="sh-h"><b>${title}</b><button class="icon-btn" onclick="closeSheet()" aria-label="Cerrar">${ic('x',20)}</button></div><div class="sh-b">${html}</div></div>`;
  d.addEventListener('click',e=>{if(e.target===d)closeSheet()});document.body.appendChild(d);
  requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('open')));
  const sh=d.querySelector('.sheet'),hd=d.querySelector('.sh-h');let y0=null,t0=0,dy=0;
  hd.addEventListener('touchstart',e=>{if(matchMedia('(min-width:768px)').matches||e.touches.length>1)return;if(e.target.closest('button'))return;y0=e.touches[0].clientY;t0=Date.now();dy=0;sh.style.transition='none'},{passive:true});
  hd.addEventListener('touchmove',e=>{if(y0===null)return;let v=e.touches[0].clientY-y0;if(v<0)v=v*.15;dy=v;sh.style.transform=`translateY(${dy}px)`},{passive:true});
  const fin=()=>{if(y0===null)return;const vel=Math.abs(dy)/Math.max(1,Date.now()-t0);y0=null;sh.style.transition='';sh.style.transform='';if(dy>120||(dy>24&&vel>.11))closeSheet()};
  hd.addEventListener('touchend',fin);hd.addEventListener('touchcancel',fin)}
function closeSheet(){S.chatOpen=null;if(typeof camStream!=='undefined'&&camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}
  const o=document.getElementById('ov');if(!o)return;o.id='ov-cerrando';if(menosMov()){o.remove();return}o.classList.remove('open');o.classList.add('closing');setTimeout(()=>o.remove(),230)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('ov'))closeSheet()});
/* Avisos tipo Sonner: entran desde abajo, se pausan si la pestaña está oculta */
let toast4T,toastRest=0,toastIni=0;
function toast(t){let d=document.getElementById('toast');if(!d){d=document.createElement('div');d.id='toast';d.className='toast';d.setAttribute('role','status');d.setAttribute('aria-live','polite');document.body.appendChild(d)}
  const ok=/guardad|cread|enviad|registrad|listo|gracias|restaurad|cargad|abierta|recibid|aplicad|actualizad/i.test(t),bad=/no se pudo|error|incorrect|no válid|rechaz|falta/i.test(t);
  d.innerHTML=(ok||bad?`<span class="t-ic" style="color:${bad?'#fca5a5':'#86efac'}">${ic(bad?'alert':'check',13)}</span>`:'')+`<span></span>`;d.lastChild.textContent=t;d.style.display='';
  d.classList.remove('show');void d.offsetWidth;d.classList.add('show');clearTimeout(toast4T);toastRest=3200;toastIni=Date.now();toast4T=setTimeout(ocultarToast,toastRest)}
function ocultarToast(){const d=document.getElementById('toast');if(d)d.classList.remove('show')}
document.addEventListener('visibilitychange',()=>{const d=document.getElementById('toast');if(!d||!d.classList.contains('show'))return;if(document.hidden){clearTimeout(toast4T);toastRest=Math.max(800,toastRest-(Date.now()-toastIni))}else{toastIni=Date.now();toast4T=setTimeout(ocultarToast,toastRest)}});
/* Entrada suave solo al cambiar de sección (no en cada actualización) */
function go(t,sub){const nuevo=t!==S.tab||(sub??null)!==(S.sub??null);S.tab=t;S.sub=sub??null;closeSheet();render();window.scrollTo(0,0);if(nuevo&&!menosMov()){const m=document.querySelector('main.wrap');if(m){m.classList.add('pg-in');setTimeout(()=>m.classList.remove('pg-in'),1100)}}}
/* Recordatorios del residente: todo lo pendiente en una tarjeta clara */
function recordatoriosRes(u){const cid=u.casaId;const rows=[];const fila=(i,c,t,s,ch,on)=>rows.push(`<button class="rr" onclick="${on}"><span class="mic c-${c}">${ic(i,19)}</span><span class="grow"><b>${t}</b><small>${s}</small></span>${ch?chip(ch[0],ch[1]):''}${ic('chev',16)}</button>`);
  if(u.rol==='residente'){const m=moraCasa(cid),p=pendCasa(cid);
    if(m.length)fila('alert','red','Pagos atrasados',`${m.length} mes(es) · ${money(sum(m,montoCuota))}`,['Pagar','bad'],"S.sel=null;go('pagos')");
    else if(p.length){const vf=vence(periodoActual());const dias=Math.ceil((new Date(vf+'T23:59')-new Date())/864e5);fila('clock','amber','Cuota de '+perL(periodoActual()),`Vence el ${fFecha(vf)}${dias>=0?` · ${dias===0?'hoy':dias===1?'mañana':'en '+dias+' días'}`:''}`,['Pendiente','warn'],"go('pagos')")}
    else if(cuotasCasa(cid).some(q=>q.estado==='revision'))fila('info','blue','Pago en revisión','La administración está validando tu comprobante',null,"go('pagos')");
    else fila('okc','green','Pagos al día','Gracias por mantener tus pagos al día',['Al día','ok'],"go('pagos')");
    const venc=DB.usuarios.filter(x=>x.rol==='inquilino'&&x.padreId===u.id&&x.activo&&x.hasta&&x.hasta>=ymd()&&x.hasta<=addDays(ymd(),7));
    if(venc.length)fila('users','violet','Inquilinos por vencer',venc.map(x=>esc(x.nombre.split(' ')[0])+' · '+fFecha(x.hasta)).join(', '),null,"go('inquilinos')")}
  const ped=(DB.tienda?DB.tienda.pedidos:[]).filter(p=>p.casaId===cid&&['aceptado','listo','en_camino'].includes(p.estado)&&!p.confC);
  if(ped.length)fila('bag','pink','Pedidos en camino',`${ped.length} pedido(s) · confirma cuando los recibas`,null,"S.tseg='pedidos';go('tienda')");
  const nl=DB.notifs.filter(n=>n.userId===u.id&&!n.leida).length;if(nl)fila('bell','sky','Notificaciones sin leer',`${nl} nueva(s)`,null,'verNotifs()');
  return `<div class="card rec"><div class="rec-h"><span class="mic c-teal" style="width:30px;height:30px;border-radius:9px">${ic('calendar',16)}</span><b class="grow">Recordatorios</b><span class="sm muted">${fFecha(ymd())}</span></div>${rows.join('')}</div>`}
Object.assign(I18N,{"Recordatorios":"Reminders","Pagos atrasados":"Overdue payments","Pagar":"Pay","Pendiente":"Pending","Pago en revisión":"Payment under review","Pagos al día":"Payments up to date","Al día":"Up to date","Gracias por mantener tus pagos al día":"Thanks for keeping your payments up to date","Inquilinos por vencer":"Tenants expiring","Pedidos en camino":"Orders on the way","Votaciones pendientes":"Pending votes","Votar":"Vote","Notificaciones sin leer":"Unread notifications","La administración está validando tu comprobante":"Management is reviewing your receipt"});
