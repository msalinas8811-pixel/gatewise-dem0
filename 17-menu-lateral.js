/* =========================================================
   UI 3: MENÚ LATERAL PROFESIONAL (PC, TABLET Y TELÉFONO)
   ≥1100px menú completo (se puede contraer) · 768–1099px riel de íconos
   <768px cajón que se abre desde la izquierda + barra inferior
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style id="ui3">
:root{--sbw:276px;--sbr:78px;--sb-bg:color-mix(in srgb,var(--bar,#0f766e) 15%,#0a101c);--sb-bg2:color-mix(in srgb,var(--bar,#0f766e) 7%,#060a12);--sb-tx:#e5ebf2;--sb-mut:#8d99ab;--sb-line:rgba(255,255,255,.07);--sb-hov:rgba(255,255,255,.055);--sb-act:color-mix(in srgb,var(--bar,#0f766e) 30%,rgba(255,255,255,.06));--sb-acc:color-mix(in srgb,var(--bar,#0f766e) 50%,#ffffff)}
.sb3{position:fixed;top:0;bottom:0;left:0;z-index:60;width:288px;display:flex;flex-direction:column;background:linear-gradient(180deg,var(--sb-bg),var(--sb-bg2));color:var(--sb-tx);box-shadow:1px 0 0 var(--sb-line);transform:translateX(-105%);transition:transform .26s cubic-bezier(.3,.7,.2,1),width .2s;padding-top:env(safe-area-inset-top,0px)}
html.sb-open .sb3{transform:none;box-shadow:0 0 60px rgba(0,0,0,.45)}
.sb-scrim{position:fixed;inset:0;z-index:55;background:rgba(5,10,18,.5);opacity:0;pointer-events:none;transition:opacity .2s;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
html.sb-open .sb-scrim{opacity:1;pointer-events:auto}
.sb-top{display:flex;align-items:center;gap:12px;padding:18px 16px 14px 18px}
.sb-mk{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:none;background:linear-gradient(145deg,color-mix(in srgb,var(--bar,#0f766e) 85%,#fff),var(--bar,#0f766e));color:#fff;box-shadow:0 6px 18px color-mix(in srgb,var(--bar,#0f766e) 40%,transparent)}
.sb-top .sb-nm{flex:1;min-width:0}.sb-top b{display:block;font-size:15px;letter-spacing:-.01em;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-top small{display:block;font-size:12px;color:var(--sb-mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-ib{width:34px;height:34px;border-radius:9px;border:0;background:none;color:var(--sb-mut);display:grid;place-items:center;flex:none;transition:background .15s,color .15s}.sb-ib:hover{background:var(--sb-hov);color:var(--sb-tx)}
.sb-q{margin:2px 14px 8px;position:relative}.sb-q svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--sb-mut);pointer-events:none}
.sb-q input{margin:0;width:100%;height:38px;padding:0 12px 0 36px;border-radius:10px;border:1px solid var(--sb-line);background:rgba(255,255,255,.04);color:var(--sb-tx);font-size:14px}
.sb-q input::placeholder{color:var(--sb-mut)}.sb-q input:focus{border-color:var(--sb-acc);box-shadow:0 0 0 3px color-mix(in srgb,var(--sb-acc) 22%,transparent)}
.sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:4px 10px 12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.15) transparent}
.sb-g{margin-top:14px}.sb-g:first-child{margin-top:4px}
.sb-h{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--sb-mut);padding:6px 12px 6px;opacity:.85}
.sl3{position:relative;display:flex;align-items:center;gap:12px;width:100%;min-height:40px;border:0;background:none;color:var(--sb-tx);padding:8px 12px;margin:1px 0;border-radius:10px;font-size:14px;font-weight:500;text-align:left;opacity:.82;transition:background .15s,opacity .15s,color .15s}
.sl3 svg{flex:none;color:var(--sb-mut);transition:color .15s}.sl3 .sb-lbl{flex:1;min-width:0;line-height:1.3}
.sl3:hover{background:var(--sb-hov);opacity:1}.sl3:hover svg{color:var(--sb-tx)}
.sl3.on{background:var(--sb-act);opacity:1;font-weight:650;color:#fff}.sl3.on svg{color:var(--sb-acc)}
.sl3.on::before{content:"";position:absolute;left:-10px;top:9px;bottom:9px;width:3px;border-radius:0 3px 3px 0;background:var(--sb-acc)}
.sl3 .sb-bd{font-style:normal;flex:none;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center}
.sb-ft{border-top:1px solid var(--sb-line);padding:12px 12px calc(12px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:10px}
.sb-av{width:38px;height:38px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;font-size:14px;overflow:hidden;background:color-mix(in srgb,var(--bar,#0f766e) 45%,#1e293b);color:#fff;box-shadow:0 0 0 2px var(--sb-line)}
.sb-av img{width:100%;height:100%;object-fit:cover}
.sb-ft .sb-nm{flex:1;min-width:0}.sb-ft b{display:block;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sb-ft small{display:block;font-size:12px;color:var(--sb-mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-btn{display:grid}.sb-only-d{display:none}
.top .av-top{width:36px;height:36px;border-radius:50%;border:0;padding:0;display:none;place-items:center;overflow:hidden;font-weight:700;font-size:13px;background:var(--pri2);color:var(--pri);margin-left:4px}
.top .av-top img{width:100%;height:100%;object-fit:cover}
@media (min-width:768px){
  .sb3{transform:none;width:var(--sbr);box-shadow:1px 0 0 var(--sb-line)}.sb-scrim{display:none}
  .shell{padding-left:var(--sbr)}.nav{display:none}.sb-btn{display:none}
  .sb3 .sb-lbl,.sb3 .sb-h,.sb3 .sb-top .sb-nm,.sb3 .sb-q,.sb3 .sb-ft .sb-nm,.sb3 .sb-ft .sb-ib,.sb3 .sb-top .sb-ib{display:none}
  .sb3 .sb-top{justify-content:center;padding:18px 0 12px}.sb3 .sb-nav{padding:4px 12px}
  .sb3 .sl3{justify-content:center;padding:10px 0}.sb3 .sl3.on::before{left:-12px}
  .sb3 .sl3 .sb-bd{position:absolute;top:5px;right:8px;min-width:8px;height:8px;padding:0;font-size:0;box-shadow:0 0 0 2px var(--sb-bg)}
  .sb3 .sb-g{margin-top:6px;padding-top:6px;border-top:1px solid var(--sb-line)}.sb3 .sb-g:first-child{border-top:0}
  .sb3 .sb-ft{justify-content:center;flex-direction:column}.sb3 .sb-ft .sb-out{display:grid}
  .top{min-height:66px;padding:12px 28px 12px 32px;background:color-mix(in srgb,var(--bg) 86%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:var(--text);box-shadow:none;border-bottom:1px solid var(--line)}
  .top .tt,.top .tlogo{display:none}.top .av-top{display:grid}
  .tt-desk{display:flex;align-items:center;gap:8px;flex:1;min-width:0;font-size:15px;white-space:nowrap;overflow:hidden}.tt-desk .crumb{color:var(--muted);overflow:hidden;text-overflow:ellipsis}.tt-desk svg{color:var(--muted);flex:none}.tt-desk b{font-size:16px;font-weight:700}
  .lang-pill{border-color:var(--line);color:var(--muted)}.top .icon-btn{color:var(--muted)}
  .wrap{max-width:1080px;padding:28px 36px 64px}
  .kpis{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
  .ov{align-items:center;padding:24px}.sheet{border-radius:22px;max-width:620px;max-height:88vh;animation:pop .18s ease-out}.sheet::before{display:none}
  .toast{bottom:28px;left:calc(50% + var(--sbr) / 2)}
}
@media (min-width:1100px){
  html:not([data-sb="mini"]) .sb3{width:var(--sbw)}
  html:not([data-sb="mini"]) .shell{padding-left:var(--sbw)}
  html:not([data-sb="mini"]) .toast{left:calc(50% + var(--sbw) / 2)}
  html:not([data-sb="mini"]) .sb3 .sb-lbl,html:not([data-sb="mini"]) .sb3 .sb-top .sb-nm,html:not([data-sb="mini"]) .sb3 .sb-ft .sb-nm{display:block}
  html:not([data-sb="mini"]) .sb3 .sb-h,html:not([data-sb="mini"]) .sb3 .sb-q{display:block}
  html:not([data-sb="mini"]) .sb3 .sb-top .sb-ib,html:not([data-sb="mini"]) .sb3 .sb-ft .sb-ib{display:grid}
  html:not([data-sb="mini"]) .sb3 .sb-top{justify-content:flex-start;padding:18px 14px 14px 18px}
  html:not([data-sb="mini"]) .sb3 .sb-nav{padding:4px 10px 12px}
  html:not([data-sb="mini"]) .sb3 .sl3{justify-content:flex-start;padding:8px 12px}
  html:not([data-sb="mini"]) .sb3 .sl3.on::before{left:-10px}
  html:not([data-sb="mini"]) .sb3 .sl3 .sb-bd{position:static;min-width:20px;height:20px;padding:0 6px;font-size:11px;box-shadow:none}
  html:not([data-sb="mini"]) .sb3 .sb-g{margin-top:14px;padding-top:0;border-top:0}
  html:not([data-sb="mini"]) .sb3 .sb-ft{flex-direction:row;justify-content:flex-start}
  html[data-sb="mini"] .sb3 .sb-ft .sb-only-d{display:grid}
  .wrap{max-width:1140px;padding:32px 44px 72px}
}
.sb-x{display:none!important}@media (max-width:767px){.sb3 .sb-top .sb-col{display:none}.sb3 .sb-x{display:grid!important}}
</style>`);
try{const v=localStorage.getItem('gw_sb');if(v==='mini')document.documentElement.dataset.sb='mini'}catch(e){}
['(min-width:768px)','(min-width:1100px)'].forEach(q=>{try{matchMedia(q).addEventListener('change',()=>{sbCerrar();if(S.user)render()})}catch(e){}});
function sbAbrir(){document.documentElement.classList.add('sb-open');setTimeout(()=>{const i=document.querySelector('.sb3 .sb-q input');if(i&&matchMedia('(min-width:768px)').matches)i.focus()},50)}
function sbCerrar(){document.documentElement.classList.remove('sb-open')}
function sbToggle(){const h=document.documentElement;const mini=h.dataset.sb!=='mini';if(mini)h.dataset.sb='mini';else delete h.dataset.sb;try{localStorage.setItem('gw_sb',mini?'mini':'full')}catch(e){}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.sb3 .sl3'))sbCerrar()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')sbCerrar()});
function sbFiltro(q){q=normTxt?normTxt(q):String(q).toLowerCase();document.querySelectorAll('.sb3 .sb-g').forEach(g=>{let n=0;g.querySelectorAll('.sl3').forEach(b=>{const ok=!q||(normTxt?normTxt(b.textContent):b.textContent.toLowerCase()).includes(q);b.style.display=ok?'':'none';if(ok)n++});g.style.display=n?'':'none'})}
const SB_GRP={inicio:'Principal',casas:'Principal',pagos:'Principal',avisos:'Principal',accesos:'Seguridad',tienda:'Comunidad',votaciones:'Comunidad',directorio:'Comunidad',reclamos:'Comunidad',residencial:'Administración',reportes:'Administración',cobros:'Finanzas',config:'Finanzas',caja:'Finanzas',cierres:'Finanzas',vigilantes:'Seguridad',solicitudes:'Seguridad',sinpase:'Seguridad',bitacora:'Seguridad',inquilinos:'Mi casa',perfil:'Mi cuenta',residenciales:'Principal',solicitudesRes:'Principal',productos:'Principal',pedidos:'Principal'};
const SB_ORD=['Principal','Comunidad','Administración','Finanzas','Seguridad','Mi casa','Mi cuenta','Sistema'];
Object.assign(I18N,{"Principal":"Main","Comunidad":"Community","Administración":"Administration","Finanzas":"Finance","Seguridad":"Security","Mi casa":"My home","Mi cuenta":"My account","Sistema":"System","Buscar en el menú":"Search the menu","Contraer menú":"Collapse menu","Expandir menú":"Expand menu","Abrir menú":"Open menu"});
function sideHTML3(u,navs,mas,isSub){const m=marcaActual();
  const nombre=u.rol==='superadmin'?'GateWise':DB.residencial.nombre;const sub=u.rol==='superadmin'?'Plataforma':ROL[u.rol];
  const brand=m&&m.logo?logoImg(m.logo,40,'12px'):`<div class="sb-mk">${ic('gatewise',22)}</div>`;
  const grupos={};const add=(g,html)=>{(grupos[g]=grupos[g]||[]).push(html)};
  const actTab=isSub?(BACK[S.tab]&&!navs.some(n=>n.id===S.tab)?S.tab:S.tab):S.tab;
  navs.filter(n=>n.id!=='mas').forEach(n=>{const on=n.id===S.tab||(isSub&&n.id===BACK[S.tab]);add('Principal',`<button class="sl3${on?' on':''}" onclick="go('${n.id}')" title="${esc(n.l)}"${on?' aria-current="page"':''}>${ic(n.i,20)}<span class="sb-lbl">${n.l}</span></button>`)});
  mas.forEach(e=>{if(e.h||/salir\(\)|setLang\(|borrarRegistros|resetDemo/.test(e.on))return;const t=tabDe(e.on);const g=t?(SB_GRP[t]||'Más opciones'):(/verTarifas/.test(e.on)?'Administración':/cuenta|perfil|negocio/i.test(e.on)?'Mi cuenta':'Sistema');const on=!!t&&(t===S.tab||(isSub&&t===BACK[S.tab]&&!navs.some(n=>n.id===t)));const lbl=e.l.replace(/<[^>]+>/g,'');
    add(g,`<button class="sl3${on?' on':''}" onclick="${esc(e.on)}" title="${esc(lbl)}">${e.svg.replace(/width="\d+" height="\d+"/,'width="20" height="20"')}<span class="sb-lbl">${e.l}</span>${e.badge?`<em class="sb-bd">${esc(e.badge)}</em>`:''}</button>`)});
  add('Sistema',`<button class="sl3${S.tab==='mas'?' on':''}" onclick="go('mas')" title="Todas las opciones">${ic('menu',20)}<span class="sb-lbl">Todas las opciones</span></button>`);const orden=SB_ORD.concat(Object.keys(grupos).filter(g=>!SB_ORD.includes(g)));
  const nav=orden.filter(g=>grupos[g]).map(g=>`<div class="sb-g"><div class="sb-h">${esc(g)}</div>${grupos[g].join('')}</div>`).join('');
  return `<div class="sb-scrim" onclick="sbCerrar()"></div><aside class="sb3" aria-label="Menú principal"><div class="sb-top">${brand}<div class="sb-nm"><b>${esc(nombre)}</b><small>${esc(sub)}${u.casaId?' · '+casaNom(u.casaId):''}</small></div><button class="sb-ib sb-col" onclick="sbToggle()" title="Contraer menú" aria-label="Contraer menú">${ic('back',18)}</button><button class="sb-ib sb-x" onclick="sbCerrar()" aria-label="Cerrar">${ic('x',18)}</button></div>
  <div class="sb-q">${ic('search',16)}<input type="search" placeholder="Buscar en el menú" aria-label="Buscar en el menú" oninput="sbFiltro(this.value)"></div>
  <nav class="sb-nav">${nav}</nav>
  <div class="sb-ft"><div class="sb-av">${avUser(u)}</div><div class="sb-nm"><b>${esc(u.nombre)}</b><small>${esc(u.rol==='superadmin'?(u.email||'Administrador de la APP'):ROL[u.rol])}</small></div><button class="sb-ib sb-only-d" onclick="sbToggle()" title="Expandir menú" aria-label="Expandir menú">${ic('chev',18)}</button><button class="sb-ib sb-out" onclick="salir()" title="Cerrar sesión" aria-label="Cerrar sesión">${ic('out',19)}</button></div></aside>`}

/* Deslizar desde el borde izquierdo abre el menú; deslizar a la izquierda lo cierra */
(()=>{let x0=null,y0=0,modo='';document.addEventListener('touchstart',e=>{if(matchMedia('(min-width:768px)').matches||!S.user)return;const t=e.touches[0];const abierto=document.documentElement.classList.contains('sb-open');if(!abierto&&t.clientX<24){x0=t.clientX;y0=t.clientY;modo='abrir'}else if(abierto){x0=t.clientX;y0=t.clientY;modo='cerrar'}else x0=null},{passive:true});
document.addEventListener('touchend',e=>{if(x0===null)return;const t=e.changedTouches[0];const dx=t.clientX-x0,dy=Math.abs(t.clientY-y0);if(dy<60){if(modo==='abrir'&&dx>50)sbAbrir();if(modo==='cerrar'&&dx<-60)sbCerrar()}x0=null},{passive:true})})();
Object.assign(I18N,{"Menú":"Menu"});
function shellHTML(u,navs,V,isSub,nl,body){const mas=masEntradas(V);const masN=mas.some(e=>e.badge);const m=marcaActual();
  const nombre=esc(u.rol==='superadmin'?'GateWise · Plataforma':DB.residencial.nombre);
  const titulo=(navs.find(n=>n.id===S.tab)||{}).l||(mas.find(e=>e.on&&tabDe(e.on)===S.tab)||{}).l||(isSub&&BACK[S.tab]?(navs.find(n=>n.id===BACK[S.tab])||{}).l:'')||nombre;
  if(S.tab==='mas'){body=body.replace('<h2>Más</h2>','<h2>Más</h2>'+perfilCard(u))+versionHTML()}
  const brand=isSub?'':(m&&m.logo?`<span class="tlogo">${logoImg(m.logo,36,'11px')}</span>`:`<span class="tlogo brand-mk">${ic('gatewise',20)}</span>`);
  const cuenta=u.rol==='superadmin'?'miCuentaSA()':(VIEWS[u.rol]&&VIEWS[u.rol].perfil?"go('perfil')":'');
  const head=`<header class="top">${isSub?`<button class="icon-btn" onclick="go('${BACK[S.tab]||'mas'}')" aria-label="Volver">${ic('back')}</button>`:`<button class="icon-btn sb-btn" onclick="sbAbrir()" aria-label="Abrir menú">${ic('bars')}</button>`}${brand}<div class="tt"><small>${ROL[u.rol]}${u.casaId?' · '+casaNom(u.casaId):''}</small><b>${nombre}</b></div><div class="tt-desk"><span class="crumb">${nombre}</span>${titulo!==nombre?ic('chev',14)+'<b>'+titulo+'</b>':''}</div><button class="lang-pill" onclick="setLang(LANG==='en'?'es':'en')" aria-label="Idioma / Language" title="Idioma / Language">${ic('globe',15)}<span>${LANG==='en'?'EN':'ES'}</span></button><button class="icon-btn" onclick="verNotifs()" aria-label="Notificaciones">${ic('bell')}${nl?`<span class="badge">${nl>99?'99+':nl}</span>`:''}</button>${cuenta?`<button class="av-top" onclick="${cuenta}" title="${esc(u.nombre)}" aria-label="Mi cuenta">${avUser(u)}</button>`:''}</header>`;
  const nav=`<nav class="nav" aria-label="Menú">${navs.map(n=>{const on=n.id===S.tab||(isSub&&n.id===(BACK[S.tab]||'mas'));return n.id==='mas'?`<button class="${on?'on':''}" onclick="sbAbrir()" aria-label="Abrir menú"><span class="ni">${ic('bars')}${masN?'<i class="nb"></i>':''}</span><span class="nl">Menú</span></button>`:`<button class="${on?'on':''}" onclick="go('${n.id}')"${on?' aria-current="page"':''}><span class="ni">${ic(n.i)}</span><span class="nl">${n.l}</span></button>`}).join('')}</nav>`;
  return `${sideHTML3(u,navs,mas,isSub)}<div class="shell">${head}${S.imp?impBanner():''}<main class="wrap">${body}</main></div>${nav}`}
