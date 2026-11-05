/* =========================================================
   ADMINISTRADOR DE LA APP: SOLO EL CORREO DEL DUEÑO
   El acceso se valida con Firebase Authentication (correo y clave).
   El correo autorizado está en config.js (GATEWISE_OWNER_EMAIL).
   ========================================================= */
const OWNER=()=>String(window.GATEWISE_OWNER_EMAIL||'').trim().toLowerCase();
const authEmail=()=>{try{const u=window.firebase&&firebase.apps.length&&firebase.auth().currentUser;return u&&u.email?String(u.email).toLowerCase():''}catch(e){return''}};
const esDuenoAuth=()=>!!OWNER()&&authEmail()===OWNER();
function esperarFirebase(ms=15000){return new Promise((res,rej)=>{const t0=Date.now();(function chk(){if(window.firebase&&firebase.apps&&firebase.apps.length)return res();if(Date.now()-t0>ms)return rej(new Error('No se pudo cargar Firebase. Revisa tu internet.'));setTimeout(chk,200)})()})}
async function loginDueno(email,pass){email=String(email||'').trim().toLowerCase();
  if(!OWNER())return toast('Falta el correo del Administrador de la APP en config.js');
  if(email!==OWNER())return toast('Solo el dueño de la app puede entrar como Administrador de la APP');
  if(!cfgNube())return toast('Para entrar como Administrador de la APP la app debe estar conectada a la nube');
  toast('Verificando…');
  try{await esperarFirebase();const cred=await firebase.auth().signInWithEmailAndPassword(email,pass);
    if(String(cred.user.email||'').toLowerCase()!==OWNER()){await firebase.auth().signOut();await firebase.auth().signInAnonymously();return toast('Solo el dueño de la app puede entrar como Administrador de la APP')}}
  catch(err){const c=String(err&&err.code||'');return toast(/wrong-password|invalid-credential|invalid-login|invalid-email/.test(c)?'Correo o clave incorrectos':/user-not-found/.test(c)?'Ese correo no está registrado en Firebase Authentication':/too-many-requests/.test(c)?'Demasiados intentos. Espera unos minutos e intenta de nuevo':/operation-not-allowed/.test(c)?'Activa "Correo electrónico/contraseña" en Firebase › Authentication':/network/.test(c)?'Sin conexión a internet':'No se pudo entrar: '+(err&&err.message||c))}
  let sa=PLAT.superadmins.find(x=>x.id==='owner');
  if(!sa)sa={id:'owner',rol:'superadmin',nombre:'Miguel Salinas',activo:true};
  Object.assign(sa,{user:email,email,activo:true});delete sa.pass;PLAT.superadmins=[sa];
  savePlat();S.modoPlat=false;entrar(sa)}
function cerrarDueno(){try{if(window.firebase&&firebase.apps.length&&authEmail())firebase.auth().signOut().then(()=>firebase.auth().signInAnonymously()).catch(()=>{})}catch(e){}}
/* Revisa que una sesión guardada de Administrador de la APP siga validada por Firebase */
function verificarSesionDueno(){if(!S.user)return;const plat=S.user.rol==='superadmin'||(S.imp&&S.imp.rol==='superadmin');if(plat&&!esDuenoAuth()){S.user=null;S.imp=null;S.modoPlat=true;setSes('');closeSheet();render();toast('Vuelve a entrar con tu correo de Administrador de la APP')}}
function cuentaDueno(){sheet('Mi cuenta',`<div class="card kv"><span>Nombre</span><b>${esc(S.user.nombre)}</b><span>Correo</span><b>${esc(OWNER())}</b><span>Acceso</span><b>Único Administrador de la APP</b></div><p class="note">Solo este correo puede entrar a la administración de la app. La contraseña se maneja con Firebase: te enviamos un correo para cambiarla.</p><button class="btn block" onclick="resetDueno()">Enviarme correo para cambiar la contraseña</button>`)}
async function resetDueno(){try{await esperarFirebase();await firebase.auth().sendPasswordResetEmail(OWNER());closeSheet();toast('Te enviamos el correo a '+OWNER())}catch(e){toast('No se pudo enviar: '+(e&&e.message||e))}}
Object.assign(I18N,{"Correo del Administrador de la APP":"APP Administrator email","Solo el dueño de la app puede entrar como Administrador de la APP":"Only the app owner can sign in as APP Administrator","Correo o clave incorrectos":"Wrong email or password","Verificando…":"Verifying…","Enviarme correo para cambiar la contraseña":"Email me a password reset link","Único Administrador de la APP":"Sole APP Administrator","Vuelve a entrar con tu correo de Administrador de la APP":"Sign in again with your APP Administrator email"});
