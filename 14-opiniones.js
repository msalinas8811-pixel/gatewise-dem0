/* =========================================================
   OPINIONES: CALIFICACIÓN 1–5 ESTRELLAS DE TIENDAS Y SERVICIOS
   ========================================================= */
ICON.star='<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>';ICOL.star='amber';
KPIC.unshift([/calific|opini/i,'star','amber']);
document.head.insertAdjacentHTML('beforeend',`<style id="resenas-css">
.stars{position:relative;display:inline-block;color:var(--line);letter-spacing:1px;line-height:1;white-space:nowrap;vertical-align:middle}
.stars .st-f{position:absolute;left:0;top:0;overflow:hidden;color:#f59e0b}
.rate{display:inline-flex;align-items:center;gap:6px;font-size:13px;border:0;background:none;padding:0;color:var(--text);text-align:left}
button.rate{cursor:pointer}button.rate:hover b{text-decoration:underline}
.pick{display:flex;justify-content:center;gap:4px;margin-top:4px}
.pk{border:0;background:none;font-size:44px;line-height:1;color:var(--line);padding:2px 4px;transition:transform .1s,color .1s}
.pk.on{color:#f59e0b}.pk:active{transform:scale(1.15)}
.rs-sum{display:flex;gap:18px;align-items:center}
.rs-big{text-align:center;min-width:96px}.rs-big>b{display:block;font-size:40px;line-height:1.05;letter-spacing:-.03em}
.dist{display:grid;grid-template-columns:26px 1fr 22px;gap:8px;align-items:center;font-size:12px;color:var(--muted);margin:3px 0}
.dist i{display:block;height:8px;border-radius:4px;background:var(--line);overflow:hidden}.dist i b{display:block;height:100%;background:#f59e0b;border-radius:4px}
.rv-resp{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--bg);border-left:3px solid var(--pri)}
.rv.oc{opacity:.6}
.calif-cta{border:2px solid #f59e0b;background:color-mix(in srgb,#f59e0b 8%,var(--card))}
</style>`);
function resDB(){if(!DB.resenas)DB.resenas=[];return DB.resenas}
const resDe=(tipo,ref,todas)=>resDB().filter(r=>r.tipo===tipo&&r.ref===ref&&(todas||!r.oculta)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
function resumenRes(tipo,ref){const l=resDe(tipo,ref);const n=l.length;return{n,avg:n?l.reduce((s,r)=>s+r.estrellas,0)/n:0,l}}
const scoreR=(t,id)=>{const r=resumenRes(t,id);return r.n?r.avg+Math.min(r.n,50)/1000:0};
const stars=(v,s=16)=>`<span class="stars" style="font-size:${s}px" role="img" aria-label="${(+v||0).toFixed(1)} / 5"><span class="st-f" style="width:${Math.max(0,Math.min(5,+v||0))/5*100}%">★★★★★</span>★★★★★</span>`;
const ETQ=['','Malo','Regular','Bueno','Muy bueno','Excelente'];
function autorNom(r){const p=String(r.nombre||'').trim().split(/\s+/);const n=p[0]+(p[1]?' '+p[1][0]+'.':'');return n+(r.casaId?' · '+casaNom(r.casaId):'')}
function nomObj(tipo,ref){if(tipo==='tienda'){const v=usuario(ref);return v?v.negocio:''}const s=dirDB().servicios.find(x=>x.id===ref);return s?s.nombre+' · '+s.oficio:''}
function rateLine(tipo,ref,clic){const{n,avg}=resumenRes(tipo,ref);const inner=n?`${stars(avg,14)}<b>${avg.toFixed(1)}</b><span class="muted">(${n})</span>`:`<span class="muted">${clic?'☆ Sin opiniones · sé el primero':'Sin opiniones aún'}</span>`;
  return clic?`<button type="button" class="rate" onclick="event.stopPropagation();verResenas('${tipo}','${ref}')">${inner}</button>`:`<span class="rate">${inner}</span>`}
const rateTxt=(tipo,ref)=>{const{n,avg}=resumenRes(tipo,ref);return n?avg.toFixed(1)+' ★':'–'};
function puedeCalif(tipo,ref){const u=S.user;if(!u||!['residente','inquilino'].includes(u.rol))return false;if(tipo==='tienda')return tiendaDB().pedidos.some(p=>p.vendedorId===ref&&p.casaId===u.casaId&&p.estado==='entregado');return true}
const miRes=(tipo,ref)=>resDB().find(r=>r.tipo===tipo&&r.ref===ref&&r.userId===S.user.id);
function ordenBar(k){return `<div class="months" style="margin:2px 0 10px;align-items:center"><span class="sm muted" style="margin-right:6px">Ordenar:</span><button class="chip ${S[k]!=='rating'?'info':''}" style="border:0" onclick="S.${k}='';render()">Recomendados</button><button class="chip ${S[k]==='rating'?'info':''}" style="border:0" onclick="S.${k}='rating';render()">⭐ Mejor calificados</button></div>`}
/* Lista de opiniones */
function verResenas(tipo,ref){const adm=S.user.rol==='admin';const own=tipo==='tienda'&&S.user.id===ref;const{n,avg,l:vis}=resumenRes(tipo,ref);const l=resDe(tipo,ref,adm);
  const dist=[5,4,3,2,1].map(k=>{const c=vis.filter(r=>r.estrellas===k).length;return `<div class="dist"><span>${k} ★</span><i><b style="width:${n?c/n*100:0}%"></b></i><span>${c}</span></div>`}).join('');
  const m=miRes(tipo,ref);const res=['residente','inquilino'].includes(S.user.rol);
  const cta=puedeCalif(tipo,ref)?`<button class="btn block" style="margin:0 0 12px" onclick="calificar('${tipo}','${ref}')">${ic('star',18)} ${m?'Editar mi opinión':'Calificar'}</button>`:(res&&tipo==='tienda'?`<p class="note" style="text-align:center">Podrás calificar esta tienda después de recibir un pedido.</p>`:'');
  sheet('Opiniones',`<p style="margin:0 0 10px;font-weight:700;font-size:16px">${esc(nomObj(tipo,ref))}</p><div class="card rs-sum"><div class="rs-big"><b>${n?avg.toFixed(1):'–'}</b>${stars(avg,18)}<div class="sm muted" style="margin-top:4px"><b>${n}</b> <span>opinión(es)</span></div></div><div class="grow">${dist}</div></div>${cta}${l.map(r=>resCard(r,adm,own)).join('')||empty('Aún no hay opiniones. ¡Sé el primero en calificar!')}`)}
function resCard(r,adm,own){const mio=r.userId===S.user.id;
  return `<div class="card rv${r.oculta?' oc':''}"><div class="row" style="align-items:flex-start"><div class="av" style="width:38px;height:38px;border-radius:50%;font-size:14px">${esc(iniciales(r.nombre))}</div><div class="grow"><b>${esc(autorNom(r))}</b><div class="row" style="gap:8px;margin-top:2px">${stars(r.estrellas,14)}<span class="sm muted" style="white-space:nowrap">${fFecha(r.fecha.slice(0,10))}</span></div>${r.tipo==='tienda'||r.oculta?`<div class="months" style="margin-top:4px">${r.tipo==='tienda'?chip('✓ Compra verificada','ok'):''}${r.oculta?chip('Oculta','mut'):''}</div>`:''}</div></div>
  ${r.texto?`<p style="margin:10px 0 0;white-space:pre-wrap">${esc(r.texto)}</p>`:''}${r.resp?`<div class="rv-resp"><b class="sm">${esc(r.resp.de)}</b> <span class="sm muted">respondió</span><p class="sm" style="margin:2px 0 0;white-space:pre-wrap">${esc(r.resp.texto)}</p></div>`:''}
  ${mio||own||adm?`<div class="btns">${mio?`<button class="btn smb ghost" onclick="calificar('${r.tipo}','${r.ref}')">Editar</button>`:''}${own||adm?`<button class="btn smb ghost" onclick="responderRes('${r.id}')">${r.resp?'Editar respuesta':'Responder'}</button>`:''}${adm?`<button class="btn smb ghost" onclick="ocultarRes('${r.id}')">${r.oculta?'Mostrar':'Ocultar'}</button>`:''}</div>`:''}</div>`}
/* Calificar */
let CALV=0;
function calificar(tipo,ref){if(!puedeCalif(tipo,ref))return toast(tipo==='tienda'?'Podrás calificar después de recibir un pedido de esta tienda':'Solo los residentes pueden calificar');const m=miRes(tipo,ref);CALV=m?m.estrellas:0;
  sheet(m?'Editar mi opinión':'Calificar',`<p style="margin:0;text-align:center;font-weight:700;font-size:16px">${esc(nomObj(tipo,ref))}</p><form onsubmit="guardarResena(event,'${tipo}','${ref}')"><div class="pick" id="pick">${pickHTML()}</div><p class="note" id="pickL" style="text-align:center;margin:2px 0 14px;font-weight:600">${CALV?ETQ[CALV]:'Toca las estrellas para calificar'}</p>
  <label class="f">Comentario<textarea name="texto" maxlength="500" placeholder="${tipo==='tienda'?'¿Qué tal el producto, la atención y la entrega?':'¿Qué trabajo te hicieron? ¿Fue puntual, ordenado y cobró lo acordado?'}">${esc(m?m.texto:'')}</textarea></label>
  <p class="note">Se publicará como <b>${esc(autorNom({nombre:S.user.nombre,casaId:S.user.casaId}))}</b>. Todos los residentes podrán verla.</p><button class="btn block big-ok">Publicar opinión</button>${m?`<button type="button" class="btn bad block" onclick="borrarRes('${m.id}')">Eliminar mi opinión</button>`:''}</form>`)}
const pickHTML=()=>[1,2,3,4,5].map(i=>`<button type="button" class="pk ${i<=CALV?'on':''}" onclick="setCal(${i})" aria-label="${i} / 5">★</button>`).join('');
function setCal(i){CALV=i;document.getElementById('pick').innerHTML=pickHTML();document.getElementById('pickL').textContent=ETQ[i]}
function guardarResena(e,tipo,ref){e.preventDefault();if(!CALV)return toast('Elige de 1 a 5 estrellas');const texto=String(new FormData(e.target).get('texto')||'').trim();
  if(CALV<=2&&texto.length<10)return toast('Cuéntanos brevemente qué pasó para ayudar a otros vecinos');
  const L=resDB();let r=miRes(tipo,ref);const nuevo=!r;
  if(!r){r={id:uid(),tipo,ref,userId:S.user.id,nombre:S.user.nombre,casaId:S.user.casaId};L.push(r)}
  Object.assign(r,{estrellas:CALV,texto,fecha:nowISO()});
  if(tipo==='tienda'&&nuevo)notificar([ref],'⭐ Nueva opinión de tu tienda',`${CALV} estrella(s) · ${casaNom(S.user.casaId)}${texto?' · '+texto.slice(0,80):''}`,{tab:'inicio'});
  save();closeSheet();render();verResenas(tipo,ref);toast('¡Gracias! Tu opinión ayuda a otros vecinos')}
function borrarRes(id){const L=resDB();const i=L.findIndex(r=>r.id===id);if(i<0)return;const r=L[i];L.splice(i,1);save();closeSheet();render();verResenas(r.tipo,r.ref);toast('Opinión eliminada')}
function responderRes(id){const r=resDB().find(x=>x.id===id);if(!r)return;
  sheet('Responder opinión',`<div class="card"><div class="row" style="gap:8px">${stars(r.estrellas,14)}<b class="sm">${esc(autorNom(r))}</b></div>${r.texto?`<p class="sm" style="margin:6px 0 0">${esc(r.texto)}</p>`:''}</div><form onsubmit="guardarResp(event,'${id}')"><label class="f">Tu respuesta (pública)<textarea name="texto" maxlength="400" required>${esc(r.resp?r.resp.texto:'')}</textarea></label><button class="btn block">Publicar respuesta</button>${r.resp?`<button type="button" class="btn ghost block" onclick="guardarResp(null,'${id}')">Quitar respuesta</button>`:''}</form>`)}
function guardarResp(e,id){if(e)e.preventDefault();const r=resDB().find(x=>x.id===id);if(!r)return;
  if(!e){delete r.resp}else{const t=String(new FormData(e.target).get('texto')||'').trim();if(!t)return;const own=r.tipo==='tienda'&&S.user.id===r.ref;
    r.resp={de:own?S.user.negocio:'Administración',texto:t,fecha:nowISO()};notificar([r.userId],'💬 Respondieron tu opinión',`${r.resp.de}: ${t.slice(0,90)}`,{tab:r.tipo==='tienda'?'tienda':'directorio'})}
  save();closeSheet();render();verResenas(r.tipo,r.ref)}
function ocultarRes(id){const r=resDB().find(x=>x.id===id);if(!r)return;r.oculta=!r.oculta;save();closeSheet();render();verResenas(r.tipo,r.ref);toast(r.oculta?'Opinión oculta para los residentes':'Opinión visible otra vez')}
/* Tarjetas en tienda y pedido */
function resumenCard(tipo,ref){const{n,avg,l}=resumenRes(tipo,ref);const m=miRes(tipo,ref);const pc=puedeCalif(tipo,ref);
  return `<div class="card"><div class="row"><div class="grow"><b>Opiniones de vecinos</b><div style="margin-top:4px">${n?`<span class="rate">${stars(avg,18)}<b style="font-size:17px">${avg.toFixed(1)}</b><span class="muted">(${n})</span></span>`:`<span class="sm muted">Aún no hay opiniones</span>`}</div></div>${pc?`<button class="btn smb" onclick="calificar('${tipo}','${ref}')">${ic('star',14)} ${m?'Editar':'Calificar'}</button>`:''}</div>
  ${l.slice(0,2).map(r=>`<div style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><div class="row" style="gap:8px">${stars(r.estrellas,13)}<b class="sm">${esc(autorNom(r))}</b></div>${r.texto?`<p class="sm" style="margin:4px 0 0">${esc(r.texto.length>140?r.texto.slice(0,140)+'…':r.texto)}</p>`:''}</div>`).join('')}
  ${!pc&&tipo==='tienda'&&['residente','inquilino'].includes(S.user.rol)?`<p class="sm muted" style="margin:10px 0 0;padding:10px 12px;border-radius:12px;background:var(--bg)">⭐ Para calificar esta tienda, primero haz un pedido. Cuando lo recibas y confirmes la entrega, aparecerá el botón <b>Calificar</b> aquí y en el pedido.</p>`:''}${n?`<button class="btn ghost block smb" style="margin-top:10px" onclick="verResenas('${tipo}','${ref}')">Ver todas las opiniones</button>`:''}</div>`}
function invitaCalif(p){const m=resDB().find(r=>r.tipo==='tienda'&&r.ref===p.vendedorId&&r.userId===S.user.id);
  return m?`<div class="card row"><span class="grow sm">Tu opinión de esta tienda: ${stars(m.estrellas,14)}</span><button class="btn smb ghost" onclick="calificar('tienda','${p.vendedorId}')">Editar</button></div>`
   :`<div class="card calif-cta"><b>¿Cómo te fue con tu pedido?</b><p class="sm muted" style="margin:4px 0 8px">Califica la tienda de 1 a 5 estrellas. Tu opinión ayuda a otros vecinos a elegir.</p><button class="btn block" onclick="calificar('tienda','${p.vendedorId}')">${ic('star',18)} Calificar tienda</button></div>`}
/* Ejemplos */
function seedResenas(db){const rs=db.usuarios.filter(u=>u.rol==='residente');const a=i=>rs[i%Math.max(1,rs.length)]||{id:'x',nombre:'Vecino',casaId:''};const sv=(db.directorio&&db.directorio.servicios)||[];const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return ymd(x)+'T10:00'};
  const R=(tipo,ref,u,e,t,dias,resp)=>({id:uid(),tipo,ref,userId:u.id,nombre:u.nombre,casaId:u.casaId,estrellas:e,texto:t,fecha:d(dias),...(resp?{resp}:{})});
  const L=[];
  if(sv[0]){L.push(R('serv',sv[0].id,a(0),5,'Llegó puntual y arregló la fuga del lavamanos en menos de una hora. Cobró lo que cotizó.',6));L.push(R('serv',sv[0].id,a(1),4,'Buen trabajo con el calentador. Tardó un día más de lo acordado, pero quedó bien.',20))}
  if(sv[1])L.push(R('serv',sv[1].id,a(2),5,'Muy responsable y de confianza. Lleva un año ayudándonos dos veces por semana.',12));
  if(sv[2])L.push(R('serv',sv[2].id,a(1),3,'Resolvió el problema del breaker, pero cobró más de lo que me dijo por teléfono.',9));
  if(db.usuarios.some(u=>u.id==='u_ven1')){L.push(R('tienda','u_ven1',a(0),5,'Las pupusas llegan calientitas y rápido. ¡Las mejores de la colonia!',3,{de:'Pupusería Doña Tere',texto:'¡Gracias por su preferencia, vecino!',fecha:d(2)}));L.push(R('tienda','u_ven1',a(2),4,'Muy ricas. El curtido podría traer un poco más.',15))}
  if(db.usuarios.some(u=>u.id==='u_ven2'))L.push(R('tienda','u_ven2',a(1),5,'El pastel tres leches estuvo delicioso y llegó a tiempo para el cumpleaños.',8));
  db.resenas=L}
Object.assign(I18N,{"Opiniones":"Reviews","Calificar":"Rate","Editar mi opinión":"Edit my review","Malo":"Poor","Regular":"Fair","Bueno":"Good","Muy bueno":"Very good","Excelente":"Excellent","Toca las estrellas para calificar":"Tap the stars to rate","Comentario":"Comment","Publicar opinión":"Post review","Eliminar mi opinión":"Delete my review","Se publicará como":"It will be posted as",". Todos los residentes podrán verla.":". All residents will be able to see it.","opinión(es)":"review(s)","Aún no hay opiniones. ¡Sé el primero en calificar!":"No reviews yet. Be the first to rate!","Podrás calificar esta tienda después de recibir un pedido.":"You can rate this shop after you receive an order.","✓ Compra verificada":"✓ Verified purchase","Oculta":"Hidden","respondió":"replied","Responder":"Reply","Editar respuesta":"Edit reply","Ocultar":"Hide","Mostrar":"Show","Responder opinión":"Reply to review","Tu respuesta (pública)":"Your reply (public)","Publicar respuesta":"Post reply","Quitar respuesta":"Remove reply","Opiniones de vecinos":"Neighbor reviews","Aún no hay opiniones":"No reviews yet","Sin opiniones aún":"No reviews yet","☆ Sin opiniones · sé el primero":"☆ No reviews · be the first","Ver todas las opiniones":"See all reviews","⭐ Para calificar esta tienda, primero haz un pedido. Cuando lo recibas y confirmes la entrega, aparecerá el botón":"⭐ To rate this shop, place an order first. Once you receive it and confirm delivery, the button","aquí y en el pedido.":"will appear here and in the order.","¿Cómo te fue con tu pedido?":"How was your order?","Califica la tienda de 1 a 5 estrellas. Tu opinión ayuda a otros vecinos a elegir.":"Rate the shop from 1 to 5 stars. Your review helps other neighbors choose.","Calificar tienda":"Rate shop","Tu opinión de esta tienda:":"Your review of this shop:","Ordenar:":"Sort:","Recomendados":"Recommended","⭐ Mejor calificados":"⭐ Top rated","Mejor calificados":"Top rated","Calificación":"Rating","Opiniones de mis clientes":"Customer reviews","Elige de 1 a 5 estrellas":"Choose 1 to 5 stars","Cuéntanos brevemente qué pasó para ayudar a otros vecinos":"Briefly tell us what happened to help other neighbors","¡Gracias! Tu opinión ayuda a otros vecinos":"Thanks! Your review helps other neighbors","Opinión eliminada":"Review deleted","Opinión oculta para los residentes":"Review hidden from residents","Opinión visible otra vez":"Review visible again","Podrás calificar después de recibir un pedido de esta tienda":"You can rate after receiving an order from this shop","Solo los residentes pueden calificar":"Only residents can rate","¿Qué tal el producto, la atención y la entrega?":"How were the product, service and delivery?","¿Qué trabajo te hicieron? ¿Fue puntual, ordenado y cobró lo acordado?":"What work did they do? Were they on time, tidy, and did they charge what was agreed?"});
