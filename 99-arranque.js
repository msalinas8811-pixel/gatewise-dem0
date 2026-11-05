/* ---------------- Arranque ---------------- */
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.name||!/(^|\.)dui$/.test(t.name)||esCondo()||paisRes()!=='SV')return;const d=t.value.replace(/\D/g,'').slice(0,9);t.value=d.length>8?d.slice(0,8)+'-'+d.slice(8):d});
if(window.GATEWISE_MODO!=='produccion'){
loadPlat();if(PLAT)load();
(()=>{if(!PLAT)return;const ses=getSes()||'';const[r,id]=ses.split('|');if(!id)return;if(r==='plat'){if(!cfgNube())return;const u=PLAT.superadmins.find(x=>x.id===id&&x.id==='owner');if(u)S.user=u;return}if(PLAT.residenciales.some(x=>x.id===r)){load(r);const u=usuario(id);if(u&&!puedeEntrar(u))S.user=u}})();
render();
iniciarNube();
window.addEventListener('storage',e=>{if(e.key===PKEY){loadPlat()}else if(e.key===dbKey(RES)){try{DB=JSON.parse(e.newValue)||DB}catch(x){return}}else return;if(S.user&&S.user.rol!=='superadmin')S.user=usuario(S.user.id)||null;const a=document.activeElement;if(!a||!['INPUT','TEXTAREA','SELECT'].includes(a.tagName)){const co=S.chatOpen;if(co&&document.getElementById('chatBox'))refrescarChat();else render()}else if(S.chatOpen)refrescarChat()});
}
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{try{r.update()}catch(e){}document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){try{r.update()}catch(e){}}})}).catch(()=>{});
