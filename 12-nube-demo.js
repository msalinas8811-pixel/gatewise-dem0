/* =========================================================
   NUBE: sincronización entre dispositivos (Firebase Realtime Database)
   Cada sección de los datos (casas, pagos, pases, tienda…) se guarda como texto
   en gw/r/{residencial}/{sección}; la plataforma en gw/plat/{sección}.
   ========================================================= */
const FB_SDK='https://www.gstatic.com/firebasejs/10.12.5/';
const NUBE={on:false,estado:'local',err:'',db:null,resRef:null,resId:null,resReady:false,platReady:false,sent:{plat:{},res:{}}};
function cfgNube(){let c=window.GATEWISE_FIREBASE||null;if(!c){try{c=JSON.parse(localStorage.getItem(KEY+'_fb')||'null')}catch(e){}}return c&&c.databaseURL&&c.apiKey?c:null}
function parseCfg(txt){let t=String(txt||'').trim();const m=t.match(/\{[\s\S]*\}/);if(!m)return null;t=m[0];try{const o=JSON.parse(t);return o.apiKey?o:null}catch(e){}const o={};t.replace(/["']?(\w+)["']?\s*:\s*["'`]([^"'`]*)["'`]/g,(_,k,v)=>{o[k]=v});return o.apiKey?o:null}
function cargarJS(u){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=()=>rej(new Error('no se pudo descargar Firebase (revisa el internet)'));document.head.appendChild(s)})}
const serial=(o,skip)=>{const out={};Object.keys(o||{}).forEach(k=>{if(skip&&skip.includes(k))return;out[k]=JSON.stringify(o[k]===undefined?null:o[k])});return out};
const PLAT_SKIP=['ultima'];
function errNube(e){NUBE.err=e&&e.message||String(e);console.warn('Nube:',NUBE.err);if(/permission/i.test(NUBE.err))toast('La nube rechazó el cambio: revisa las reglas de la base de datos')}
async function iniciarNube(){const cfg=cfgNube();if(!cfg)return;NUBE.estado='conectando';pintarNube();
  try{if(!window.firebase){await cargarJS(FB_SDK+'firebase-app-compat.js');await cargarJS(FB_SDK+'firebase-auth-compat.js');await cargarJS(FB_SDK+'firebase-database-compat.js')}
    if(!firebase.apps.length)firebase.initializeApp(cfg);{const au=await new Promise(r=>{const un=firebase.auth().onAuthStateChanged(x=>{un();r(x)})});if(!au)await firebase.auth().signInAnonymously()}setTimeout(verificarSesionDueno,0);NUBE.db=firebase.database();NUBE.on=true;
    const pr=NUBE.db.ref('gw/plat');const snap=await pr.once('value');
    if(!snap.exists()){await subirTodo()}
    pr.on('value',s=>recibirPlat(s.val()));
    if(RES)escucharRes(RES);
    if(S.user&&S.user.rol==='superadmin')cachearResidenciales();
    NUBE.db.ref('.info/connected').on('value',s=>{NUBE.estado=s.val()?'conectado':'sin conexión';pintarNube()});if(!NUBE.vis){NUBE.vis=1;const reco=()=>{if(!NUBE.on)return;try{NUBE.db.goOffline();NUBE.db.goOnline()}catch(e){}};document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reco()});window.addEventListener('online',reco);window.addEventListener('pageshow',e=>{if(e.persisted)reco()})}
  }catch(e){NUBE.on=false;NUBE.estado='error';errNube(e);pintarNube();toast('No se pudo conectar a la nube: '+NUBE.err)}}
async function subirTodo(){const up={};const pl=serial(PLAT,esDuenoAuth()?PLAT_SKIP:PLAT_SKIP.concat('superadmins'));Object.keys(pl).forEach(k=>up['gw/plat/'+k]=pl[k]);NUBE.sent.plat=Object.assign({},pl);
  (PLAT.residenciales||[]).forEach(r=>{const d=r.id===RES?DB:leerDB(r.id);if(d)up['gw/r/'+r.id]=serial(d)});
  if(RES&&up['gw/r/'+RES]){NUBE.sent.res=Object.assign({},up['gw/r/'+RES]);NUBE.resId=RES}NUBE.platReady=true;await NUBE.db.ref().update(up)}
function nubePlat(){if(!NUBE.on||!NUBE.platReady||!PLAT)return;const s=serial(PLAT,esDuenoAuth()?PLAT_SKIP:PLAT_SKIP.concat('superadmins')),u={};Object.keys(s).forEach(k=>{if(s[k]!==NUBE.sent.plat[k]){u[k]=s[k];NUBE.sent.plat[k]=s[k]}});if(Object.keys(u).length)NUBE.db.ref('gw/plat').update(u).catch(errNube)}
function nubeRes(){if(!NUBE.on||!DB||!RES)return;if(NUBE.resId!==RES){escucharRes(RES);return}if(!NUBE.resReady)return;const s=serial(DB),u={};Object.keys(s).forEach(k=>{if(s[k]!==NUBE.sent.res[k]){u[k]=s[k];NUBE.sent.res[k]=s[k]}});if(Object.keys(u).length){NUBE.pend=(NUBE.pend||0)+1;const ks=Object.keys(u);NUBE.lastPush=NUBE.db.ref('gw/r/'+RES).update(u).then(()=>{NUBE.pend--;return true},e=>{NUBE.pend--;ks.forEach(k=>delete NUBE.sent.res[k]);errNube(e);return false});return NUBE.lastPush}}
function nubeSetRes(id,d){if(NUBE.on)NUBE.db.ref('gw/r/'+id).set(serial(d)).catch(errNube)}
function nubeBorrarRes(id){if(NUBE.on)NUBE.db.ref('gw/r/'+id).remove().catch(errNube)}
function escucharRes(id){if(!NUBE.on)return;if(NUBE.resRef)NUBE.resRef.off();NUBE.resId=id;NUBE.resReady=false;NUBE.sent.res={};const r=NUBE.db.ref('gw/r/'+id);NUBE.resRef=r;r.on('value',s=>recibirRes(id,s.val()),errNube)}
function recibirRes(id,val){if(id!==RES)return;
  if(!val){if(!NUBE.resReady&&DB){const all=serial(DB);NUBE.sent.res=Object.assign({},all);NUBE.resReady=true;NUBE.db.ref('gw/r/'+id).set(all).catch(errNube)}return}
  const primera=!NUBE.resReady;let cambio=false;Object.keys(val).forEach(k=>{if(val[k]!==NUBE.sent.res[k]){NUBE.sent.res[k]=val[k];try{DB[k]=JSON.parse(val[k])}catch(e){}cambio=true}});NUBE.resReady=true;
  if(primera){DB.visitasCobro=DB.visitasCobro||[];DB.cierres=DB.cierres||[];if(!DB.tienda)DB.tienda={productos:[],pedidos:[],seq:0};ensureCuotas();try{localStorage.setItem(dbKey(RES),JSON.stringify(DB))}catch(e){}nubeRes()}
  else if(cambio){try{localStorage.setItem(dbKey(RES),JSON.stringify(DB))}catch(e){}}
  if(cambio||primera)refrescarVista()}
function recibirPlat(val){if(!val){return}const primera=!NUBE.platReady;let cambio=false;Object.keys(val).forEach(k=>{if(PLAT_SKIP.includes(k))return;if(val[k]!==NUBE.sent.plat[k]){NUBE.sent.plat[k]=val[k];try{PLAT[k]=JSON.parse(val[k])}catch(e){}cambio=true}});NUBE.platReady=true;
  if(!cambio&&!primera)return;try{localStorage.setItem(PKEY,JSON.stringify(PLAT))}catch(e){}
  if(!PLAT.residenciales.length){if(RES){RES=null;DB=null;if(S.user&&S.user.rol!=='superadmin')salir()}}else if(!RES||!PLAT.residenciales.some(r=>r.id===RES)){if(S.user&&S.user.rol!=='superadmin'){S.user=null;setSes('')}load(PLAT.residenciales[0].id)}
  if(primera)nubePlat();refrescarVista()}
function refrescarVista(){if(S.user){if(S.user.rol==='superadmin'){S.user=PLAT.superadmins.find(x=>x.id===S.user.id)||S.user;if(S.imp)S.imp=PLAT.superadmins.find(x=>x.id===S.imp.id)||S.imp}else{const u=DB&&usuario(S.user.id);if(!u){salir();return}S.user=u}}
  const a=document.activeElement;const escribiendo=a&&['INPUT','TEXTAREA','SELECT'].includes(a.tagName);if(S.chatOpen&&document.getElementById('chatBox'))refrescarChat();if(!escribiendo){const y=window.scrollY;render();window.scrollTo(0,y)}}
function cachearResidenciales(){if(!NUBE.on)return;NUBE.db.ref('gw/r').once('value').then(s=>{const v=s.val()||{};Object.keys(v).forEach(id=>{if(id===RES)return;const d={};Object.keys(v[id]||{}).forEach(k=>{try{d[k]=JSON.parse(v[id][k])}catch(e){}});try{localStorage.setItem(dbKey(id),JSON.stringify(d))}catch(e){}});if(S.user&&S.user.rol==='superadmin')refrescarVista()}).catch(errNube)}
async function nubeBorrarTodo(){if(!NUBE.on)return;NUBE.sent={plat:{},res:{}};NUBE.resReady=false;NUBE.platReady=false;const up={};const pv=(await NUBE.db.ref('gw/plat').once('value')).val()||{};Object.keys(pv).forEach(k=>{if(k!=='superadmins')up['gw/plat/'+k]=null});up['gw/r']=null;await NUBE.db.ref().update(up)}
function pintarNube(){document.querySelectorAll('.nubeEstado').forEach(el=>el.innerHTML=nubeTxt())}
const nubeTxt=()=>!cfgNube()?'📱 Datos solo en este dispositivo':NUBE.estado==='conectado'?'☁️ Conectado a la nube · datos compartidos entre dispositivos':NUBE.estado==='conectando'?'☁️ Conectando a la nube…':NUBE.estado==='sin conexión'?'☁️ Sin internet · se sincroniza al volver la conexión':'⚠️ Nube con error: '+esc(NUBE.err);
function enlaceNube(){const c=cfgNube();if(!c)return'';const b=btoa(unescape(encodeURIComponent(JSON.stringify(c)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return location.origin+location.pathname+'#cfg='+b}
function verNube(){const c=cfgNube();const link=enlaceNube();
  sheet('Conexión a la nube',`<div class="alert ${NUBE.estado==='conectado'?'ok':c?'warn':'info'}"><b class="nubeEstado">${nubeTxt()}</b>${c?`<p>Proyecto Firebase: ${esc(c.projectId||'')}</p>`:'<p>Conecta la app a tu proyecto Firebase para que todos los teléfonos compartan los mismos datos.</p>'}</div>
  ${c&&link?`<h3>Conectar otros teléfonos</h3><p class="note" style="margin-top:0">Envía este enlace a quienes van a probar la demo. Al abrirlo una vez, su teléfono queda conectado.</p><textarea id="nubeLink" readonly style="min-height:70px;font-size:13px">${esc(link)}</textarea><div class="btns" style="margin-top:6px"><button class="btn" onclick="copiarNube()">Copiar enlace</button><a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Prueba GateWise: '+link)}">Enviar por WhatsApp</a></div>`:''}
  ${window.GATEWISE_FIREBASE?'<p class="note">Este sitio ya trae la configuración en el archivo config.js; todos los dispositivos se conectan solos.</p>':`<h3>${c?'Cambiar':'Pegar'} configuración</h3><p class="note" style="margin-top:0">En Firebase: Configuración del proyecto › Tus apps › Web › copia el bloque <b>firebaseConfig</b> y pégalo aquí.</p><textarea id="nubeCfg" placeholder="const firebaseConfig = { apiKey: ..., databaseURL: ... }"></textarea><button class="btn block" onclick="guardarCfgNube()">Conectar este dispositivo</button>${c?`<button class="btn ghost block" onclick="desconectarNube()">Desconectar este dispositivo</button>`:''}`}`)}
async function copiarNube(){const t=document.getElementById('nubeLink');try{await navigator.clipboard.writeText(t.value);toast('Enlace copiado')}catch(e){t.select();toast('Selecciona y copia el enlace')}}
function guardarCfgNube(){const c=parseCfg(document.getElementById('nubeCfg').value);if(!c)return toast('No reconozco la configuración. Copia todo el bloque firebaseConfig');if(!c.databaseURL)return toast('Falta databaseURL: primero crea la Realtime Database en Firebase y vuelve a copiar la configuración');try{localStorage.setItem(KEY+'_fb',JSON.stringify(c))}catch(e){}toast('Conectando…');setTimeout(()=>location.reload(),400)}
function desconectarNube(){try{localStorage.removeItem(KEY+'_fb')}catch(e){}location.reload()}
(function cfgDesdeEnlace(){const h=location.hash||'';if(!h.startsWith('#cfg='))return;try{const b=h.slice(5).replace(/-/g,'+').replace(/_/g,'/');const c=JSON.parse(decodeURIComponent(escape(atob(b+'==='.slice((b.length+3)%4)))));if(c&&c.apiKey&&c.databaseURL){localStorage.setItem(KEY+'_fb',JSON.stringify(c))}}catch(e){}try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}})();

Object.assign(I18N,{'Conexión a la nube':'Cloud connection','Conexión a la nube (demos en varios teléfonos)':'Cloud connection (demos on several phones)','Conectar otros teléfonos':'Connect other phones','Copiar enlace':'Copy link','Enviar por WhatsApp':'Send via WhatsApp','Conectar este dispositivo':'Connect this device','Desconectar este dispositivo':'Disconnect this device','Pegar configuración':'Paste configuration','Cambiar configuración':'Change configuration','📱 Datos solo en este dispositivo':'📱 Data on this device only','☁️ Conectado a la nube · datos compartidos entre dispositivos':'☁️ Connected to the cloud · data shared across devices','☁️ Conectando a la nube…':'☁️ Connecting to the cloud…','Enlace copiado':'Link copied'});
