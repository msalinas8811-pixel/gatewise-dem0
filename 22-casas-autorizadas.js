/* =========================================================
   CASAS 7 · CASAS AUTORIZADAS + CARGA MASIVA DE PERFILES
   - Cada residencial tiene un número de casas autorizadas (lo define el
     Administrador de la APP). La administración nunca puede pasarse de él,
     ni agregando a mano ni subiendo el archivo.
   - El archivo puede reemplazar las casas vacías que se generaron al crear
     la residencial por la lista real.
   - Columnas extra: Teléfono 2 / WhatsApp, Placas, Habitantes, Notas.
   - Los usuarios y claves quedan pendientes (el propietario se registra
     con el código de su casa o la administración le crea el usuario).
   ========================================================= */
let IMPF=null;
const resActual=()=>PLAT&&PLAT.residenciales?PLAT.residenciales.find(x=>x.id===RES):null;
function casasAutDe(r,d){if(!r)return null;if(+r.casasAut>0)return +r.casasAut;const n=(r.init&&+r.init.casas)||0;const act=d&&d.casas?d.casas.length:0;return Math.max(n,act)||null}
const casasAut=()=>casasAutDe(resActual(),DB);
const casasLibres=()=>{const l=casasAut();return l==null?Infinity:Math.max(0,l-DB.casas.length)};
const esVacia=c=>!c.duenoId&&!(c.prop&&c.prop.nombre)&&!c.familia&&!c.placas&&!DB.usuarios.some(u=>u.casaId===c.id)&&!DB.pagos.some(p=>p.casaId===c.id)&&!DB.pases.some(p=>p.casaId===c.id)&&!cuotasCasa(c.id).some(q=>q.estado==='pagado'&&!q.inicial);
const normPlaca=p=>String(p||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
/* ---------- Plantilla con columnas extra ---------- */
(()=>{const extra=[['Teléfono 2 / WhatsApp','Placas de vehículos','Habitantes','Notas'],['7000-1111','P123-456, M78-901','4','Tiene perro'],['','P555-222','3',''],['','','2','Casa alquilada']];PLANT.forEach((r,i)=>r.push(...(extra[i]||['','','',''])))})();
function hdrX(h){const es=h.some(x=>/n[uú]mero|casa|pol[ií]gono|familia|apellido|propietario|debe|mes/.test(x));if(!es)return{t2:8,pl:9,hb:10,no:11};const f=re=>h.findIndex(x=>re.test(x));return{t2:f(/tel[eé]fono\s*2|whats|tel\.?\s*2|celular/),pl:f(/placa|veh[ií]culo/),hb:f(/habitantes|personas|residentes|ocupantes/),no:f(/^nota|observ|coment/)}}
function extraDe(r,X){const v=i=>i>=0?String(r[i]??'').trim():'';const e={tel2:v(X.t2),placas:v(X.pl).split(/[,;\/]+/).map(s=>s.trim().toUpperCase()).filter(Boolean).join(', '),hab:v(X.hb).replace(/\D/g,''),nota:v(X.no)};return e}
const tieneExtra=e=>!!(e&&(e.tel2||e.placas||e.hab||e.nota));
const extraTxt=e=>tieneExtra(e)?`<div class="sm muted">${[e.tel2&&'WhatsApp '+esc(e.tel2),e.placas&&'Placas '+esc(e.placas),e.hab&&esc(e.hab)+' habitante(s)',e.nota&&esc(e.nota)].filter(Boolean).join(' · ')}</div>`:'';
function aplicarExtra(c,e){if(!tieneExtra(e))return;if(e.tel2){c.prop=c.prop||{};c.prop.tel2=e.tel2}if(e.placas)c.placas=e.placas;if(e.hab)c.habitantes=+e.hab;if(e.nota)c.nota=e.nota}
/* ---------- Límite en la revisión del archivo ---------- */
function limitarImport(){const lim=casasAut();if(lim==null||!IMP)return'';const keep=new Set(IMP.filter(x=>x.ex).map(x=>x.ex));const vac=DB.casas.filter(c=>esVacia(c)&&!keep.has(c.id));const rep=!!S.impRep&&vac.length>0;
  const usadas=DB.casas.length-(rep?vac.length:0);let disp=Math.max(0,lim-usadas);let fuera=0;
  IMP.forEach(x=>{if(x.est!=='nueva')return;if(disp>0){disp--;return}x.est='error';x.msg=`Supera las ${lim} casas autorizadas`;fuera++});
  const nuevas=IMP.filter(x=>x.est==='nueva').length;
  return `<div class="card" style="margin-bottom:10px"><div class="row6"><span>Casas autorizadas</span><b>${lim}</b><span>Registradas ahora</span><b>${DB.casas.length}</b>${rep?`<span>Casas vacías que se reemplazan</span><b>− ${vac.length}</b>`:''}<span>Nuevas que entran</span><b style="color:var(--ok)">${nuevas}</b><span class="t" style="font-weight:700;color:var(--text)">Total después de importar</span><b class="t">${usadas+nuevas} de ${lim}</b></div>
  ${vac.length?`<label class="chk" style="border:0;margin-top:6px"><input type="checkbox" ${S.impRep?'checked':''} onchange="S.impRep=this.checked;procesarFilas(IMPF)"><span class="grow sm"><b>Reemplazar las ${vac.length} casa(s) vacías</b> que se crearon automáticamente por la lista del archivo</span></label>`:''}
  ${fuera?alertBox('warn',`${fuera} casa(s) no caben`,`Su residencial tiene ${lim} casas autorizadas. ${vac.length&&!S.impRep?'Marca “Reemplazar las casas vacías” o p':'P'}ide al proveedor de la app que amplíe el número de casas.`):''}</div>`}
if(typeof confirmarImport==='function'){const ci=confirmarImport;confirmarImport=function(){if(!IMP)return;const lim=casasAut();
  if(S.impRep){const keep=new Set(IMP.filter(x=>x.ex).map(x=>x.ex));const del=new Set(DB.casas.filter(c=>esVacia(c)&&!keep.has(c.id)).map(c=>c.id));if(del.size){DB.casas=DB.casas.filter(c=>!del.has(c.id));DB.cuotas=DB.cuotas.filter(q=>!del.has(q.casaId))}}
  const nuevas=IMP.filter(x=>x.est==='nueva').length;if(lim!=null&&DB.casas.length+nuevas>lim)return toast(`Solo hay espacio para ${Math.max(0,lim-DB.casas.length)} casa(s) más`);S.impRep=false;IMPF=null;return ci.apply(this,arguments)}}
/* ---------- Agregar casa a mano: respeta el límite ---------- */
if(typeof nuevaCasa==='function'){const nc=nuevaCasa;nuevaCasa=function(){if(casasLibres()<=0){const l=casasAut();return sheet('Límite de casas',`${alertBox('warn',`Ya están registradas las ${l} casas autorizadas`,'Para agregar más casas, pide al proveedor de la app que amplíe el número de casas de su residencial.')}<p class="note">También puedes editar una casa vacía para usarla con los datos correctos.</p><a class="btn sec block" target="_blank" rel="noopener" href="https://wa.me/50370699423?text=${encodeURIComponent('Hola, quiero ampliar el número de casas autorizadas de '+DB.residencial.nombre+'.')}">${ic('chat',16)} Pedir más casas por WhatsApp</a>`)}return nc.apply(this,arguments)}}
if(typeof guardarCasa==='function'){const gc=guardarCasa;guardarCasa=function(e,id){if(!id&&casasLibres()<=0){e.preventDefault();return toast('Ya se registraron todas las casas autorizadas')}return gc.apply(this,arguments)}}
/* ---------- Pantalla Casas: medidor de casas autorizadas ---------- */
(()=>{const V=VIEWS.admin;if(!V||!V.casas)return;const b=V.casas;V.casas=function(){let h=b.apply(this,arguments);try{const l=casasAut();if(l==null)return h;const n=DB.casas.length,pc=Math.min(100,Math.round(n/l*100));const sc=DB.casas.filter(c=>!c.duenoId).length;const vac=DB.casas.filter(esVacia).length;
  const card=`<div class="card" style="padding:14px 16px"><div class="row"><b class="grow">${n} de ${l} casas autorizadas</b>${n>=l?chip('Completo','info'):chip((l-n)+' disponibles','ok')}</div><div class="pbar"><b style="width:${pc}%"></b></div><div class="sm muted">${sc?`${sc} casa(s) sin usuario todavía: el propietario se registra con el código de su casa, o créale el usuario desde la ficha de la casa.`:'Todas las casas tienen usuario.'}${vac?` · ${vac} casa(s) vacías listas para completar con el archivo.`:''}</div></div>`;
  const i=h.indexOf('<input placeholder="Buscar por número');return i>=0?h.slice(0,i)+card+h.slice(i):card+h}catch(e){return h}}})();
/* ---------- Ficha de la casa: datos extra ---------- */
(()=>{const V=VIEWS.admin;if(!V||!V.casa)return;const b=V.casa;V.casa=function(){let h=b.apply(this,arguments);try{const c=casa(S.sub);if(!c)return h;const p=c.prop||{};
  const card=`<h3>Datos de la casa</h3><div class="card"><div class="kv"><span>Teléfono 2 / WhatsApp</span><b>${esc(p.tel2||'—')}</b><span>Placas</span><b>${esc(c.placas||'—')}</b><span>Habitantes</span><b>${c.habitantes||'—'}</b><span>Notas</span><b>${esc(c.nota||'—')}</b></div><button class="btn ghost smb" style="margin-top:10px" onclick="editarExtra('${c.id}')">${ic('gear',15)} Editar datos de la casa</button></div>`;
  const k='Renovar</button></div></div>';const i=h.indexOf(k);return i>=0?h.slice(0,i+k.length)+card+h.slice(i+k.length):h+card}catch(e){return h}}})();
function editarExtra(cid){const c=casa(cid),p=c.prop||{};sheet('Datos de la casa',`<form onsubmit="guardarExtra(event,'${cid}')"><label class="f">Teléfono 2 / WhatsApp<input name="tel2" inputmode="tel" value="${esc(p.tel2||'')}"></label><label class="f">Placas de vehículos<input name="placas" value="${esc(c.placas||'')}" placeholder="P123-456, M78-901"></label><label class="f">Habitantes<input name="hab" type="number" min="0" max="50" value="${c.habitantes||''}"></label><label class="f">Notas<input name="nota" value="${esc(c.nota||'')}"></label><button class="btn block">Guardar</button></form>`)}
function guardarExtra(e,cid){e.preventDefault();const F=new FormData(e.target),c=casa(cid);c.prop=c.prop||{};c.prop.tel2=String(F.get('tel2')||'').trim();c.placas=String(F.get('placas')||'').split(/[,;\/]+/).map(s=>s.trim().toUpperCase()).filter(Boolean).join(', ');c.habitantes=+F.get('hab')||'';c.nota=String(F.get('nota')||'').trim();save();closeSheet();render();toast('Datos guardados')}
if(typeof guardarProp==='function'){const gp=guardarProp;guardarProp=function(e,cid){const t2=((casa(cid)||{}).prop||{}).tel2;const r=gp.apply(this,arguments);const c=casa(cid);if(t2&&c&&c.prop&&!c.prop.tel2)c.prop.tel2=t2;return r}}
/* ---------- Vigilancia: buscar por placa ---------- */
if(typeof buscarVig==='function'){const bv=buscarVig;buscarVig=function(q){const b=bv.apply(this,arguments);try{const n=normPlaca(q);if(n.length<3||/^\d+$/.test(n))return b;const L=DB.casas.filter(c=>c.placas&&c.placas.split(',').some(p=>normPlaca(p).includes(n)));if(!L.length)return b;
  const it=`<h3>Vehículos registrados</h3>`+L.map(c=>`<div class="item"><span class="mic c-sky">${ic('doorin',19)}</span><div class="grow"><b>${esc(c.placas)}</b><div class="sm muted">${casaNom(c.id)} · ${esc(duenoNom(c.id))}</div></div>${chip('Residente','ok')}</div>`).join('');
  return (!b.includes('class="item"')&&!b.includes('alert')?'':b)+it}catch(e){return b}}}
/* ---------- Administrador de la APP: definir casas autorizadas ---------- */
(()=>{const V=VIEWS.superadmin;if(!V||!V.resDet)return;const b=V.resDet;V.resDet=function(){let h=b.apply(this,arguments);try{const r=PLAT.residenciales.find(x=>x.id===S.sub);if(!r)return h;const d=leerDB(r.id);const n=d?d.casas.length:0;const l=casasAutDe(r,d);
  const f=`<label class="f" style="margin-top:12px">Casas autorizadas<input type="number" min="${n}" step="1" inputmode="numeric" value="${l||''}" onchange="setCasasAut('${r.id}',this.value)"></label><p class="note" style="margin-top:-6px">Registradas: ${n}. La administración no puede registrar más casas que este número, ni a mano ni con el archivo.</p>`;
  const k='<label class="f" style="margin-top:12px">Precio mensual acordado';const i=h.indexOf(k);return i>=0?h.slice(0,i)+f+h.slice(i):h+f}catch(e){return h}}})();
function setCasasAut(id,v){const r=PLAT.residenciales.find(x=>x.id===id);const d=leerDB(id);const n=d?d.casas.length:0;v=Math.floor(+v||0);if(v<n){toast('No puede ser menor que las '+n+' casas ya registradas');render();return}setRes(id,'casasAut',v)}
Object.assign(I18N,{"Casas autorizadas":"Authorized houses","Registradas ahora":"Registered now","Nuevas que entran":"New ones added","Total después de importar":"Total after import","Límite de casas":"House limit","Pedir más casas por WhatsApp":"Request more houses via WhatsApp","Datos de la casa":"House details","Editar datos de la casa":"Edit house details","Teléfono 2 / WhatsApp":"Phone 2 / WhatsApp","Placas":"Plates","Placas de vehículos":"Vehicle plates","Habitantes":"Residents","Notas":"Notes","Vehículos registrados":"Registered vehicles","Completo":"Full","Residente":"Resident"});
