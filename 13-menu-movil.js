/* =========================================================
   UI 2: ÍCONOS, MENÚ MÓVIL Y BARRA LATERAL DE ESCRITORIO
   ========================================================= */
Object.assign(ICON,{
home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
houses:'<path d="M2 20.5V11l5-4 5 4v9.5"/><path d="M12 12.5 17 8.5l5 4v8"/><path d="M1 20.5h22"/><path d="M6 20.5V17h2v3.5M16 20.5V17h2v3.5"/>',
building:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8.5 7h1.5M14 7h1.5M8.5 11h1.5M14 11h1.5M8.5 15h1.5M14 15h1.5M10 21v-3h4v3"/>',
dash:'<rect x="3" y="3" width="7.5" height="9" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="5" rx="1.8"/><rect x="13.5" y="11" width="7.5" height="10" rx="1.8"/><rect x="3" y="15" width="7.5" height="6" rx="1.8"/>',
card:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h3"/>',
wallet:'<path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v3"/><path d="M3 6v12a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M21 12h-4a2 2 0 0 0 0 4h4z"/>',
cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
mega:'<path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
menu:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
bars:'<path d="M4 6h16M4 12h16M4 18h16"/>',
store:'<path d="M4 10v10h16V10"/><path d="M2.5 9.5 4.5 4h15l2 5.5"/><path d="M2.5 9.5a3.2 3.2 0 0 0 6.35 0 3.2 3.2 0 0 0 6.3 0 3.2 3.2 0 0 0 6.35 0"/><path d="M9.5 20v-5h5v5"/>',
box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5"/>',
bag:'<path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/>',
ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
shield:'<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
back:'<path d="M15 18l-6-6 6-6"/>',chev:'<path d="M9 6l6 6-6 6"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',check:'<path d="M20 6 9 17l-5-5"/>',
log:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/>',
clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2.5h6v3H9zM9 11h6M9 15h6M9 19h3"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.9-4 4-6 8-6s7.1 2 8 6"/>',
users:'<circle cx="9" cy="8" r="3.6"/><path d="M2 20.5c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/><path d="M15.5 4.6a3.6 3.6 0 0 1 0 6.8M18 15.2c2 .8 3.4 2.6 4 5.3"/>',
userplus:'<circle cx="9" cy="8" r="4"/><path d="M2 21c.8-4 3.6-6 7-6s6.2 2 7 6"/><path d="M19 8v6M16 11h6"/>',
alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>',
okc:'<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.6"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
doorin:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
chart:'<path d="M3 21h18"/><rect x="5" y="11" width="3.2" height="7" rx="1"/><rect x="10.4" y="5" width="3.2" height="13" rx="1"/><rect x="15.8" y="13" width="3.2" height="5" rx="1"/>',
trend:'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
chat:'<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
chatalert:'<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v4M12 14h.01"/>',
book:'<rect x="5" y="3" width="15" height="18" rx="2"/><circle cx="12.5" cy="10" r="2.5"/><path d="M8.5 17c.6-1.8 2-2.7 4-2.7s3.4.9 4 2.7M3 7.5h3.5M3 12h3.5M3 16.5h3.5"/>',
siren:'<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 18h14v3H5zM12 3v1.5M4.4 6.4l1.1 1.1M19.6 6.4l-1.1 1.1M2 12h1.5M20.5 12H22"/>',
share:'<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 13.4 7.2 4.2M15.6 6.4 8.4 10.6"/>',
cloud:'<path d="M17.5 19H7.5a5 5 0 1 1 1-9.9A6 6 0 0 1 19.6 11.2 4 4 0 0 1 17.5 19z"/>',
palette:'<path d="M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 2.6-2.1 3.8-3.8 3.8h-1.9a1.9 1.9 0 0 0-1.4 3.2c.5.6.3 2.5-2.4 2.5z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10" cy="7" r="1.1"/><circle cx="15" cy="7" r="1.1"/>',
tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
bike:'<circle cx="5.5" cy="17.5" r="2.8"/><circle cx="18.5" cy="17.5" r="2.8"/><path d="M8.3 17.5h6.9l2.6-6.5H13M14.5 5.5h2.3l2.2 8.6M3 12.5h6.5l2.5 5"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
pin:'<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14M10 11v6M14 11v6"/>',
lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'
});
/* Íconos de la barra de navegación por rol */
{const NI={inicio:{admin:'home',residente:'home',inquilino:'home',vigilante:'shield',cobrador:'pin',superadmin:'dash',vendedor:'dash'},accesos:'ticket',pagos:'wallet',avisos:'mega',bitacora:'clip',caja:'cash',cierres:'clip',casas:'houses',residenciales:'building',solicitudesRes:'userplus',productos:'box',pedidos:'bag',tienda:'store',sinpase:'doorin',mas:'menu'};
  Object.entries(NAV).forEach(([r,l])=>l.forEach(n=>{const v=NI[n.id];if(v)n.i=typeof v==='string'?v:(v[r]||n.i)}))}
/* Tipos de acceso y categorías de avisos con ícono */
Object.assign(TIPOS.personal,{i:'tool'});Object.assign(TIPOS.entrega,{i:'bike'});Object.assign(TIPOS.correo,{i:'box'});Object.assign(TIPOS.visita,{i:'users'});
const CATI={trabajos:['tool','amber'],servicio:['bolt','orange'],seguridad:['shield','violet'],evento:['calendar','blue'],pagos:['wallet','green'],general:['mega','teal']};
const tAv=t=>`<div class="av ti ti-${t}">${ic((TIPOS[t]||{}).i||'ticket',20)}</div>`;
const catAv=k=>{const c=CATI[k]||CATI.general;return `<div class="av ti c-${c[1]}">${ic(c[0],20)}</div>`};
/* Color de cada ícono en los menús */
const ICOL={building:'teal',houses:'teal',chart:'indigo',doc:'indigo',store:'pink',book:'orange',phone:'orange',wallet:'green',card:'sky',cash:'green',clip:'slate',log:'slate',chatalert:'red',flag:'amber',userplus:'blue',user:'blue',users:'violet',shield:'violet',sliders:'slate',gear:'slate',globe:'sky',cloud:'sky',out:'red',trash:'red',reset:'amber',palette:'pink',bag:'pink',box:'indigo',ticket:'teal',key:'teal'};
const iniciales=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
const avUser=u=>u&&u.foto&&u.foto.data?`<img src="${u.foto.data}" alt="">`:esc(iniciales(u&&u.nombre));
/* Escritorio */
const MQD=window.matchMedia?matchMedia('(min-width:1024px)'):null;
const isDesk=()=>!!(MQD&&MQD.matches);
try{MQD.addEventListener('change',()=>render())}catch(e){}
function masEntradas(V){let html='';try{html=V.mas?V.mas():''}catch(e){return[]}
  const box=new DOMParser().parseFromString('<div>'+html+'</div>','text/html').body.firstChild;const out=[];if(!box)return out;
  box.querySelectorAll('h3,button.item').forEach(el=>{if(el.tagName==='H3'){out.push({h:el.textContent.trim()});return}
    const b=el.querySelector('b.grow'),svg=el.querySelector('svg'),ch=el.querySelector('.chip');
    out.push({on:el.getAttribute('onclick')||'',l:b?b.innerHTML:esc(el.textContent.trim()),svg:svg?svg.outerHTML:'',badge:ch?ch.textContent.trim():''})});return out}
const tabDe=on=>{const m=String(on).match(/go\('(\w+)'/);return m?m[1]:''};
function sideHTML(u,navs,mas,isSub){const m=marcaActual();
  const nombre=u.rol==='superadmin'?'GateWise':DB.residencial.nombre;const sub=u.rol==='superadmin'?'Plataforma':'GateWise';
  const brand=m&&m.logo?logoImg(m.logo,42,'13px'):`<div class="side-logo">${ic('gatewise',24)}</div>`;
  const pri=navs.filter(n=>n.id!=='mas').map(n=>`<button class="sl ${n.id===S.tab||(isSub&&n.id===BACK[S.tab])?'on':''}" onclick="go('${n.id}')">${ic(n.i,20)}<span>${n.l}</span></button>`).join('');
  const grupos=[{h:'Más opciones',it:[]}];
  mas.forEach(e=>{if(e.h){grupos.push({h:e.h,it:[]});return}if(/salir\(\)|setLang\(/.test(e.on))return;grupos[grupos.length-1].it.push(e)});
  const sec=grupos.filter(g=>g.it.length).map(g=>`<div class="sh">${esc(g.h)}</div>`+g.it.map(e=>`<button class="sl ${tabDe(e.on)&&tabDe(e.on)===S.tab?'on':''}" onclick="${esc(e.on)}">${e.svg.replace(/width="\d+" height="\d+"/,'width="20" height="20"')}<span>${e.l}</span>${e.badge?`<em class="sb">${esc(e.badge)}</em>`:''}</button>`).join('')).join('');
  return `<aside class="side"><div class="side-brand">${brand}<div style="min-width:0"><b>${esc(nombre)}</b><small>${sub}</small></div></div><nav class="side-nav" aria-label="Menú">${pri}${sec}</nav><div class="side-foot"><div class="av">${avUser(u)}</div><div class="grow"><b>${esc(u.nombre)}</b><small>${ROL[u.rol]}${u.casaId?' · '+casaNom(u.casaId):''}</small></div><button class="icon-btn" onclick="salir()" title="Cerrar sesión" aria-label="Cerrar sesión">${ic('out',20)}</button></div></aside>`}
const perfilCard=u=>`<div class="card pcard"><div class="av">${avUser(u)}</div><div class="grow" style="min-width:0"><b style="font-size:17px">${esc(u.nombre)}</b><div class="sm muted">${ROL[u.rol]}${u.casaId?' · '+casaNom(u.casaId):''}</div><div class="sm muted">${esc(u.rol==='superadmin'?'GateWise':DB.residencial.nombre)}</div></div></div>`;
function shellHTML(u,navs,V,isSub,nl,body){const desk=isDesk();const mas=masEntradas(V);const masN=mas.some(e=>e.badge);const m=marcaActual();
  const nombre=esc(u.rol==='superadmin'?'GateWise · Plataforma':DB.residencial.nombre);
  const titulo=(navs.find(n=>n.id===S.tab)||{}).l||(mas.find(e=>e.on&&tabDe(e.on)===S.tab)||{}).l||(isSub&&BACK[S.tab]?(navs.find(n=>n.id===BACK[S.tab])||{}).l:'')||nombre;
  if(S.tab==='mas'){body=body.replace('<h2>Más</h2>','<h2>Más</h2>'+perfilCard(u))+versionHTML()}
  const brand=isSub?'':(m&&m.logo?`<span class="tlogo">${logoImg(m.logo,36,'11px')}</span>`:`<span class="tlogo brand-mk">${ic('gatewise',20)}</span>`);
  const head=`<header class="top">${isSub?`<button class="icon-btn" onclick="go('${BACK[S.tab]||'mas'}')" aria-label="Volver">${ic('back')}</button>`:''}${brand}<div class="tt"><small>${ROL[u.rol]}${u.casaId?' · '+casaNom(u.casaId):''}</small><b>${nombre}</b></div><div class="tt-desk"><span class="crumb">${nombre}</span>${titulo!==nombre?ic('chev',14)+'<b>'+titulo+'</b>':''}</div><button class="lang-pill" onclick="setLang(LANG==='en'?'es':'en')" aria-label="Idioma / Language" title="Idioma / Language">${ic('globe',15)}<span>${LANG==='en'?'EN':'ES'}</span></button><button class="icon-btn" onclick="verNotifs()" aria-label="Notificaciones">${ic('bell')}${nl?`<span class="badge">${nl>99?'99+':nl}</span>`:''}</button></header>`;
  const nav=`<nav class="nav" aria-label="Menú">${navs.map(n=>{const on=n.id===S.tab||(isSub&&n.id===(BACK[S.tab]||'mas'));return `<button class="${on?'on':''}" onclick="go('${n.id}')"${on?' aria-current="page"':''}><span class="ni">${ic(n.i)}${n.id==='mas'&&masN?'<i class="nb"></i>':''}</span><span class="nl">${n.l}</span></button>`}).join('')}</nav>`;
  return `<div class="shell">${desk?sideHTML(u,navs,mas,isSub):''}${head}${S.imp?impBanner():''}<main class="wrap">${body}</main></div>${nav}`}
/* Pantalla de entrada con panel de marca en escritorio */
function authShell(html){const f=(i,t,d)=>`<div class="hero-f"><div class="hf-ic">${ic(i,20)}</div><div><b>${t}</b><span>${d}</span></div></div>`;
  return `<div class="auth"><section class="auth-hero"><div class="hero-top"><div class="hero-mk">${ic('gatewise',26)}</div>GateWise</div><div><h1>Tu comunidad, segura y al día.</h1><p>Control de acceso, pagos, avisos y tienda para residenciales y condominios, en una sola app.</p>${f('shield','Control de acceso','Pases con PIN, portería y aviso al residente cuando su visita ingresa.')}${f('wallet','Pagos y mora','Cuotas, comprobantes, cobro a domicilio y reportes en PDF.')}${f('mega','Comunidad','Avisos, reclamos, directorio y tienda entre vecinos.')}</div><small>© ${new Date().getFullYear()} GateWise</small></section><div class="auth-main">${html}</div></div>`}
Object.assign(I18N,{"Más opciones":"More options","Plataforma":"Platform","Menú":"Menu","Tu comunidad, segura y al día.":"Your community, safe and up to date.","Control de acceso, pagos, avisos y tienda para residenciales y condominios, en una sola app.":"Access control, payments, notices and a marketplace for residential communities and condos, in one app.","Control de acceso":"Access control","Pases con PIN, portería y aviso al residente cuando su visita ingresa.":"PIN passes, gatehouse check-in and a heads-up to the resident when their visitor arrives.","Pagos y mora":"Payments and arrears","Cuotas, comprobantes, cobro a domicilio y reportes en PDF.":"Dues, receipts, home collection and PDF reports.","Comunidad":"Community","Avisos, reclamos, directorio y tienda entre vecinos.":"Notices, complaints, a directory and a neighbor marketplace.","Español / English":"Español / English"});
