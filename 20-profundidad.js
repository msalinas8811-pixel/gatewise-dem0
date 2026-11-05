/* =========================================================
   UI 5 · DISEÑO CON PROFUNDIDAD (Emil Kowalski)
   Fondo aurora, íconos con color, portada en el inicio, barra
   flotante con indicador que se desliza, menú lateral y pestañas
   con indicador animado, formularios y botones más trabajados,
   contadores en los indicadores y login animado.
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style id="ui5">
:root{--acc2:#6366f1;--acc3:#0ea5e9;--shadow-lg:0 24px 60px -20px rgba(16,24,40,.35),0 2px 8px rgba(16,24,40,.06);--hero:var(--bar,var(--pri))}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--acc2:#818cf8;--acc3:#38bdf8;--hero:color-mix(in srgb,var(--bar,var(--pri)) 48%,#05161b)}}
:root[data-theme="dark"]{--acc2:#818cf8;--acc3:#38bdf8;--hero:color-mix(in srgb,var(--bar,var(--pri)) 48%,#05161b)}
/* ---------- Fondo aurora con malla de puntos ---------- */
body{background:var(--bg)}
body::before,body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none}
body::before{background:radial-gradient(44rem 30rem at 108% -8%,color-mix(in srgb,var(--pri) 17%,transparent),transparent 70%),radial-gradient(38rem 28rem at -12% 22%,color-mix(in srgb,var(--acc2) 11%,transparent),transparent 70%),radial-gradient(42rem 30rem at 62% 112%,color-mix(in srgb,var(--acc3) 10%,transparent),transparent 70%)}
body::after{background:radial-gradient(color-mix(in srgb,var(--text) 10%,transparent) 1px,transparent 1.5px) 0 0/22px 22px;-webkit-mask-image:linear-gradient(180deg,#000,transparent 50%);mask-image:linear-gradient(180deg,#000,transparent 50%);opacity:.7}
/* ---------- Superficies ---------- */
.card,.item,.kpi,.tipos button{background:color-mix(in srgb,var(--card) 94%,transparent);border-color:color-mix(in srgb,var(--line) 85%,transparent)}
.card{border-radius:18px}.item{border-radius:16px}.kpi{border-radius:18px}
.kpi b{font-variant-numeric:tabular-nums}
/* ---------- Íconos con color: degradado, brillo y sombra de su color ---------- */
.mic,.kpi .ki,.ti-big,.av.ti,.item>.av:not(:has(img)){background:linear-gradient(145deg,color-mix(in srgb,var(--c,var(--pri)) 72%,#fff),var(--c,var(--pri)) 52%,color-mix(in srgb,var(--c,var(--pri)) 78%,#000));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 6px 14px -6px color-mix(in srgb,var(--c,var(--pri)) 70%,transparent)}
.item>.av:not(:has(img)){border-radius:14px}
.al-ic{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:11px;background:color-mix(in srgb,currentColor 15%,transparent)}
.alert{background-image:linear-gradient(135deg,rgba(255,255,255,.35),transparent 60%)}
.chip{box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 18%,transparent)}
.badge{background:linear-gradient(180deg,#f87171,#dc2626)!important;box-shadow:0 0 0 2px var(--bar,var(--pri)),0 3px 8px rgba(220,38,38,.45)}
/* ---------- Títulos ---------- */
.wrap>h2{font-size:24px;letter-spacing:-.025em}
.wrap h3{display:flex;align-items:center;gap:8px}
.wrap h3::before{content:"";flex:none;width:14px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--pri),var(--acc2))}
/* ---------- Portada del inicio ---------- */
.hero5{position:relative;overflow:hidden;isolation:isolate;border-radius:24px;padding:18px 18px 16px;margin:2px 0 14px;color:#fff;
  background:radial-gradient(120% 90% at 100% 0%,rgba(255,255,255,.24),transparent 55%),radial-gradient(90% 90% at 0% 100%,color-mix(in srgb,var(--acc2) 50%,transparent),transparent 62%),linear-gradient(140deg,color-mix(in srgb,var(--hero) 88%,#fff),var(--hero) 45%,color-mix(in srgb,var(--hero) 62%,#000));
  box-shadow:0 22px 44px -22px color-mix(in srgb,var(--hero) 85%,transparent),inset 0 1px 0 rgba(255,255,255,.25)}
.hero5::before{content:"";position:absolute;z-index:-1;right:-70px;top:-70px;width:260px;height:260px;opacity:.22;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='white' stroke-width='1.2'%3E%3Ccircle cx='100' cy='100' r='30'/%3E%3Ccircle cx='100' cy='100' r='52'/%3E%3Ccircle cx='100' cy='100' r='74'/%3E%3Ccircle cx='100' cy='100' r='96'/%3E%3C/svg%3E") center/contain no-repeat}
.hero5::after{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(rgba(255,255,255,.16) 1px,transparent 1.4px) 0 0/16px 16px;-webkit-mask-image:linear-gradient(200deg,#000,transparent 55%);mask-image:linear-gradient(200deg,#000,transparent 55%)}
.h5-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.h5-top small{font-size:12.5px;font-weight:600;opacity:.82}
.h5-st{display:inline-flex;align-items:center;gap:5px;padding:4px 10px 4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:rgba(255,255,255,.16);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);white-space:nowrap}
.h5-st.bad{background:rgba(239,68,68,.9);box-shadow:0 4px 12px -2px rgba(239,68,68,.5)}.h5-st.warn{background:rgba(245,158,11,.92);color:#2b1700}
.hero5 h2{color:#fff;margin:8px 0 2px;font-size:25px;line-height:1.15;letter-spacing:-.025em}
.h5-sub{margin:0;opacity:.86;font-size:14px}
.h5-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.h5-stats div{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.h5-stats b{display:block;font-size:19px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.h5-stats span{font-size:11.5px;opacity:.85;font-weight:600}
.h5-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.h5-acts button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 6px 10px;border:0;border-radius:15px;color:#fff;font:inherit;font-size:12.5px;font-weight:650;background:rgba(255,255,255,.15);box-shadow:inset 0 0 0 1px rgba(255,255,255,.24);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:transform 160ms var(--ease-out),background-color 150ms ease}
.h5-acts button:active{transform:scale(.95)}
.h5-acts .sos{background:linear-gradient(180deg,rgba(248,113,113,.95),rgba(220,38,38,.95));box-shadow:0 6px 16px -6px rgba(220,38,38,.7),inset 0 1px 0 rgba(255,255,255,.3)}
@media (hover:hover) and (pointer:fine){.h5-acts button:hover{background:rgba(255,255,255,.24)}.h5-acts .sos:hover{background:linear-gradient(180deg,#f87171,#dc2626)}}
@media (min-width:768px){.hero5{display:grid;grid-template-columns:1fr auto;align-items:end;gap:24px;padding:28px 30px 26px;border-radius:26px}.hero5 h2{font-size:32px}.h5-acts{grid-template-columns:repeat(3,112px);margin:0}.h5-acts button{padding:14px 8px 12px}.h5-stats{max-width:480px}.hero5::before{width:340px;height:340px;right:-80px;top:-110px}}
/* ---------- Encabezado del teléfono ---------- */
@media (max-width:767px){
  .top{border-radius:0 0 22px 22px;background:radial-gradient(60% 150% at 100% 0%,rgba(255,255,255,.2),transparent 60%),radial-gradient(55% 130% at 0% 100%,color-mix(in srgb,var(--acc2) 38%,transparent),transparent 70%),linear-gradient(135deg,color-mix(in srgb,var(--hero) 86%,#fff),var(--hero) 50%,color-mix(in srgb,var(--hero) 72%,#000));box-shadow:0 10px 24px -14px color-mix(in srgb,var(--hero) 80%,transparent)}
  .wrap{padding-top:18px}
  /* Barra inferior flotante con indicador que se desliza */
  .nav{left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));padding:7px 4px;border-radius:24px;border:1px solid color-mix(in srgb,var(--line) 70%,transparent);border-top:1px solid color-mix(in srgb,var(--line) 70%,transparent);background:color-mix(in srgb,var(--card) 82%,transparent);box-shadow:0 14px 34px -10px rgba(16,24,40,.28),0 2px 6px rgba(16,24,40,.06)}
  .wrap{padding-bottom:calc(118px + env(safe-area-inset-bottom))}
  .toast{bottom:calc(104px + env(safe-area-inset-bottom))}
}
.nav button{position:relative;z-index:1}
.nav button.on .ni{background:transparent}
.nav-ind{position:absolute;z-index:0;left:0;top:0;width:60px;height:32px;border-radius:16px;pointer-events:none;background:linear-gradient(180deg,color-mix(in srgb,var(--pri2) 70%,#fff),var(--pri2));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pri) 16%,transparent),0 4px 12px -4px color-mix(in srgb,var(--pri) 45%,transparent);transition:transform 380ms var(--ease-out)}
@keyframes gwNi{0%{transform:scale(.82)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
.nav .ni.just svg{animation:gwNi 420ms var(--ease-out)}
/* ---------- Menú lateral con indicador ---------- */
.sb3::before{content:"";position:absolute;inset:0 0 auto 0;height:220px;pointer-events:none;background:radial-gradient(80% 100% at 0% 0%,color-mix(in srgb,var(--hero) 45%,transparent),transparent 70%);opacity:.7}
.sb3>*{position:relative}
.sb-ind{position:absolute;z-index:0;left:0;top:0;pointer-events:none;border-radius:11px;background:linear-gradient(90deg,color-mix(in srgb,var(--sb-acc,#2dd4bf) 22%,transparent),color-mix(in srgb,var(--sb-acc,#2dd4bf) 8%,transparent));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sb-acc,#2dd4bf) 22%,transparent);transition:transform 340ms var(--ease-out)}
.sb-ind::before{content:"";position:absolute;left:-10px;top:9px;bottom:9px;width:3px;border-radius:0 3px 3px 0;background:var(--sb-acc,#2dd4bf);box-shadow:0 0 12px var(--sb-acc,#2dd4bf)}
html[data-sb=mini] .sb-ind::before{left:-12px}
.sb3 .sl3{z-index:1}
.sb3.has-ind .sl3.on{background:transparent}
.sb3.has-ind .sl3.on::before{display:none}
/* ---------- Pestañas con indicador que se desliza ---------- */
.seg{position:relative;isolation:isolate;background:color-mix(in srgb,var(--line) 75%,transparent);box-shadow:inset 0 1px 2px rgba(16,24,40,.06)}
.seg button{position:relative;z-index:1;transition:color 160ms ease,transform 160ms var(--ease-out)}
.seg button:active{transform:scale(.96)}
.seg.has-ind button.on{background:transparent;box-shadow:none}
.seg-ind{position:absolute;z-index:0;left:0;top:3px;bottom:3px;border-radius:9px;background:var(--card);box-shadow:0 1px 3px rgba(16,24,40,.12),0 0 0 1px color-mix(in srgb,var(--line) 60%,transparent);transition:transform 300ms var(--ease-out),width 300ms var(--ease-out)}
/* ---------- Formularios ---------- */
.f{color:color-mix(in srgb,var(--text) 72%,var(--muted));font-size:12.5px;font-weight:650;transition:color 150ms ease}
.f:focus-within{color:var(--pri)}
:is(.wrap,.sheet,.login) :is(input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]),select,textarea){border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;background:color-mix(in srgb,var(--card) 55%,var(--bg));transition:border-color 150ms ease,box-shadow 200ms var(--ease-out),background-color 150ms ease}
:is(.wrap,.sheet,.login) :is(input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]),select,textarea):focus{outline:none;border-color:var(--pri);background:var(--card);box-shadow:0 0 0 4px color-mix(in srgb,var(--pri) 16%,transparent)}
@media (hover:hover) and (pointer:fine){:is(.wrap,.sheet,.login) :is(input:not([type=checkbox]):not([type=radio]),select,textarea):hover:not(:focus){border-color:color-mix(in srgb,var(--pri) 35%,var(--line))}}
:is(.wrap,.sheet,.login) select{-webkit-appearance:none;appearance:none;padding-right:40px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;background-size:16px}
input::placeholder,textarea::placeholder{color:color-mix(in srgb,var(--muted) 75%,transparent)}
/* Hoja de formulario */
.sheet{box-shadow:var(--shadow-lg)}
.sh-h{background:linear-gradient(180deg,color-mix(in srgb,var(--pri) 7%,transparent),transparent)}
.sh-h b{font-size:17px;letter-spacing:-.015em}
.sh-h .icon-btn{background:color-mix(in srgb,var(--line) 60%,transparent);border-radius:50%;width:34px;height:34px;min-height:0}
/* ---------- Botones ---------- */
.btn{position:relative;overflow:hidden;isolation:isolate}
.btn:not(.sec):not(.ghost):not(.bad):not(.ok){box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 8px 18px -10px color-mix(in srgb,var(--pri) 85%,transparent)}
.btn.sec{background:linear-gradient(180deg,color-mix(in srgb,var(--pri2) 65%,#fff),var(--pri2));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pri) 14%,transparent)}
.btn.ghost{background:var(--card);box-shadow:0 1px 2px rgba(16,24,40,.05)}
.btn.bad{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--bad) 18%,transparent)}
.btn:not(.sec):not(.ghost):not(.bad)::after{content:"";position:absolute;z-index:-1;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.3) 50%,transparent 65%);transform:translateX(-120%)}
@media (hover:hover) and (pointer:fine){
  .btn{transition:transform 200ms var(--ease-out),box-shadow 200ms ease,background-color 150ms ease,filter 150ms ease}
  .btn:hover{transform:translateY(-1px)}
  .btn:not(.sec):not(.ghost):not(.bad):not(.ok):hover{box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 12px 24px -10px color-mix(in srgb,var(--pri) 90%,transparent)}
  .btn:not(.sec):not(.ghost):not(.bad)::after{transition:transform 700ms var(--ease-out)}
  .btn:not(.sec):not(.ghost):not(.bad):hover::after{transform:translateX(120%)}
  .item:hover,.tipos button:hover,.kpi:hover{transform:translateY(-2px)}
}
.btn:active,.item:active,.tipos button:active,.kpi:active{transform:scale(.97)}
/* ---------- Ingreso (login) animado ---------- */
.auth-main{position:relative;overflow:hidden;isolation:isolate}
.auth-main::before,.auth-main::after{content:"";position:absolute;z-index:-1;border-radius:50%;filter:blur(40px);pointer-events:none;opacity:.55}
.auth-main::before{width:420px;height:420px;top:-140px;right:-120px;background:color-mix(in srgb,var(--pri) 45%,transparent);animation:gwFlota 14s ease-in-out infinite alternate}
.auth-main::after{width:380px;height:380px;bottom:-140px;left:-120px;background:color-mix(in srgb,var(--acc2) 35%,transparent);animation:gwFlota 18s ease-in-out -6s infinite alternate-reverse}
@keyframes gwFlota{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,30px) scale(1.08)}100%{transform:translate(30px,-20px) scale(.95)}}
.login .card{background:color-mix(in srgb,var(--card) 80%,transparent);-webkit-backdrop-filter:blur(18px) saturate(1.4);backdrop-filter:blur(18px) saturate(1.4);border-radius:22px;box-shadow:var(--shadow-lg)}
.login .logo{animation:gwLogo 600ms var(--ease-out) both}
@keyframes gwLogo{from{opacity:0;transform:translateY(10px) scale(.9)}}
.login>*{animation:gwIn 420ms var(--ease-out) both}
.login>*:nth-child(2){animation-delay:50ms}.login>*:nth-child(3){animation-delay:100ms}.login>*:nth-child(4){animation-delay:150ms}.login>*:nth-child(n+5){animation-delay:200ms}
.auth-hero{position:relative;overflow:hidden;isolation:isolate}
.auth-hero::before{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px) 0 0/44px 44px,linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px) 0 0/44px 44px;-webkit-mask-image:radial-gradient(80% 70% at 70% 30%,#000,transparent 75%);mask-image:radial-gradient(80% 70% at 70% 30%,#000,transparent 75%)}
.auth-hero::after{content:"";position:absolute;z-index:-1;width:520px;height:520px;right:-160px;bottom:-200px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--acc2) 55%,transparent),transparent);filter:blur(10px);animation:gwFlota 16s ease-in-out infinite alternate}
.hf-ic{background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
/* ---------- Reducir movimiento ---------- */
@media (prefers-reduced-motion:reduce){
  .auth-main::before,.auth-main::after,.auth-hero::after,.login>*,.login .logo,.nav .ni.just svg{animation:none!important}
  .nav-ind,.sb-ind,.seg-ind{transition:none!important}
  .btn::after{display:none}
  .btn:hover,.item:hover,.tipos button:hover,.kpi:hover{transform:none}
}
</style>`);
/* ---------- Portadas del inicio ---------- */
function saludo5(){const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'}
function fechaLarga5(){try{const t=new Date().toLocaleDateString(LANG==='en'?'en-US':'es-SV',{weekday:'long',day:'numeric',month:'long'});return t.charAt(0).toUpperCase()+t.slice(1)}catch(e){return fFecha(ymd())}}
function heroRes5(u){const cid=u.casaId,V=VIEWS[u.rol]||{};let st='';
  if(u.rol==='residente'){st=moraCasa(cid).length?`<span class="h5-st bad">${ic('alert',13)}<span>En mora</span></span>`:pendCasa(cid).length?`<span class="h5-st warn">${ic('clock',13)}<span>Cuota pendiente</span></span>`:`<span class="h5-st">${ic('check',13)}<span>Al día</span></span>`}
  const acts=[];
  acts.push(`<button onclick="const t=document.querySelector('.tipos');if(t){t.scrollIntoView({behavior:menosMov()?'auto':'smooth',block:'center'})}else go('accesos')">${ic('ticket',21)}<span>Nuevo pase</span></button>`);
  if(V.pagos)acts.push(`<button onclick="S.sel=null;go('pagos')">${ic('wallet',21)}<span>Pagar cuota</span></button>`);else if(V.tienda)acts.push(`<button onclick="go('tienda')">${ic('store',21)}<span>Tienda</span></button>`);
  acts.push(`<button class="sos" onclick="S.dseg='emergencia';go('directorio')">${ic('siren',21)}<span>Emergencias</span></button>`);
  return `<section class="hero5"><div><div class="h5-top"><small>${fechaLarga5()}</small>${st}</div><h2><span>${saludo5()}</span>, ${esc(u.nombre.split(' ')[0])}</h2><p class="h5-sub">${u.casaId?esc(casaNom(u.casaId))+' · ':''}${esc(DB.residencial.nombre)}</p></div><div class="h5-acts">${acts.join('')}</div></section>`}
function heroAdm5(){const R_=DB.residencial,pr=miembro('Presidente'),mes=periodoActual();const cs=DB.cuotas.filter(c=>c.periodo===mes);const pct=cs.length?Math.round(cs.filter(c=>c.estado==='pagado').length/cs.length*100):0;const V=VIEWS[S.user.rol]||{};
  const acts=[`<button onclick="go('residencial')">${ic('houses',21)}<span>Residencial</span></button>`];
  if(V.reportes)acts.push(`<button onclick="go('reportes')">${ic('doc',21)}<span>Reportes</span></button>`);
  if(V.avisos)acts.push(`<button onclick="go('avisos')">${ic('mega',21)}<span>Avisos</span></button>`);else if(V.pagos)acts.push(`<button onclick="go('pagos')">${ic('wallet',21)}<span>Pagos</span></button>`);
  return `<section class="hero5"><div><div class="h5-top"><small>${fechaLarga5()}</small><span class="h5-st">${ic('shield',13)}<span>Administración</span></span></div><h2><span>${saludo5()}</span>, ${esc(S.user.nombre.split(' ')[0])}</h2><p class="h5-sub">${esc(R_.nombre)} · <span>Presidente</span>: ${esc(pr?pr.nombre:'sin asignar')}</p>
    <div class="h5-stats"><div><b>${DB.casas.length}</b><span>Casas</span></div><div><b>${portones().length}</b><span>Portones</span></div><div><b>${pct}%</b><span>Al día este mes</span></div></div></div><div class="h5-acts">${acts.join('')}</div></section>`}
/* ---------- Indicadores que se deslizan (FLIP entre renders) ---------- */
const IND5={};
function mover5(el,key,x,y,w,h){const p=IND5[key];el.style.width=w+'px';if(h!=null)el.style.height=h+'px';
  if(p&&!menosMov()&&(p.x!==x||p.y!==y)){el.style.transition='none';el.style.transform=`translate(${p.x}px,${p.y}px)`;if(p.w)el.style.width=p.w+'px';void el.offsetWidth;el.style.transition='';el.style.width=w+'px'}
  requestAnimationFrame(()=>{el.style.transform=`translate(${x}px,${y}px)`});IND5[key]={x,y,w}}
function indicadores5(){
  const nav=document.querySelector('.nav');if(nav&&getComputedStyle(nav).display!=='none'){const on=nav.querySelector('button.on .ni');if(on){const ind=document.createElement('i');ind.className='nav-ind';nav.prepend(ind);const r=nav.getBoundingClientRect(),q=on.getBoundingClientRect();const prev=IND5.nav;mover5(ind,'nav',q.left-r.left,q.top-r.top,q.width,q.height);if(prev&&Math.abs(prev.x-(q.left-r.left))>2&&!menosMov())on.classList.add('just')}}
  sbInd5();
  document.querySelectorAll('main.wrap .seg, .sheet .seg').forEach((sg,i)=>{const on=sg.querySelector('button.on');if(!on)return;const ind=document.createElement('i');ind.className='seg-ind';sg.prepend(ind);sg.classList.add('has-ind');const r=sg.getBoundingClientRect(),q=on.getBoundingClientRect();mover5(ind,'seg|'+S.tab+'|'+i,q.left-r.left+sg.scrollLeft,0,q.width,null)})}
function sbInd5(){const sb=document.querySelector('.sb3');if(!sb)return;const on=sb.querySelector('.sl3.on');const box=on&&on.parentElement;let ind=sb.querySelector('.sb-ind');if(!on||on.offsetParent===null){if(ind)ind.style.opacity=0;return}
  const host=on.closest('.sb-nav')||box;if(getComputedStyle(host).position==='static')host.style.position='relative';
  if(!ind||ind.parentElement!==host){if(ind)ind.remove();ind=document.createElement('i');ind.className='sb-ind';host.prepend(ind)}ind.style.opacity=1;sb.classList.add('has-ind');
  const r=host.getBoundingClientRect(),q=on.getBoundingClientRect();ind.style.left=(q.left-r.left)+'px';mover5(ind,'sb',0,q.top-r.top+host.scrollTop,q.width,q.height)}
/* ---------- Contadores en los indicadores (solo al entrar a una sección) ---------- */
function contar5(root){if(menosMov()||!root)return;root.querySelectorAll('.kpi b, .h5-stats b').forEach(b=>{if(b.children.length)return;const t=b.textContent.trim();const m=t.match(/^(\$?)([\d,]+(?:\.\d+)?)(.*)$/);if(!m)return;const fin=parseFloat(m[2].replace(/,/g,''));if(!(fin>0))return;const dec=(m[2].split('.')[1]||'').length;const coma=m[2].includes(',')||fin>=1000&&m[1]==='$';
  const fmt=v=>m[1]+(coma?v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}):v.toFixed(dec))+m[3];const t0=performance.now(),D=750;
  const paso=now=>{if(!b.isConnected)return;const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);b.textContent=k<1?fmt(fin*e):t;if(k<1)requestAnimationFrame(paso)};b.textContent=fmt(0);requestAnimationFrame(paso)})}
function pgIn5(){if(menosMov())return;const m=document.querySelector('main.wrap');if(!m)return;m.classList.add('pg-in');setTimeout(()=>m.classList.remove('pg-in'),1100);contar5(m)}
/* ---------- Ganchos: render, go, entrar, filtro del menú ---------- */
const render5base=render;render=function(){render5base.apply(this,arguments);try{if(S.user)indicadores5()}catch(e){}};
function go(t,sub){const nuevo=t!==S.tab||(sub??null)!==(S.sub??null);S.tab=t;S.sub=sub??null;closeSheet();render();window.scrollTo(0,0);if(nuevo)pgIn5()}
const entrar5base=entrar;entrar=function(u){entrar5base.apply(this,arguments);if(S.user)pgIn5()};
if(typeof sbFiltro==='function'){const f5=sbFiltro;sbFiltro=function(){const r=f5.apply(this,arguments);try{sbInd5()}catch(e){}return r}}
if(typeof sbToggle==='function'){const t5=sbToggle;sbToggle=function(){const r=t5.apply(this,arguments);setTimeout(()=>{try{delete IND5.sb;sbInd5()}catch(e){}},240);return r}}
addEventListener('resize',()=>{clearTimeout(window.__rz5);window.__rz5=setTimeout(()=>{try{for(const k in IND5)delete IND5[k];if(S.user)indicadores5()}catch(e){}},150)});
Object.assign(I18N,{"Buenos días":"Good morning","Buenas tardes":"Good afternoon","Buenas noches":"Good evening","Nuevo pase":"New pass","Pagar cuota":"Pay fee","Emergencias":"Emergencies","En mora":"Overdue","Cuota pendiente":"Fee pending","Al día":"Up to date","Portones":"Gates","Al día este mes":"Paid this month","Residencial":"Community","Reportes":"Reports","Avisos":"Notices","Administración":"Management","Presidente":"President","Casas":"Houses","Tienda":"Store","Pagos":"Payments"});
