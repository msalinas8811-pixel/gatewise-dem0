"""Pruebas del modo producción en el navegador, con Firebase simulado.
Uso: python3 -m http.server 8765 (en la carpeta de la app) y luego python3 tests/navegador/prueba_roles.py"""
from flujo import *
# ===== t_p4.py =====

h=H()
rid=crear_res(h)
h.logout()
h.login('admin','Admin123',rid)
print('admin', h.js("()=>[S.user&&S.user.rol, DB.casas.length, DB.cuotas.length, DB.cuotas[0]&&DB.cuotas[0].id, !!DB.casas[0].codigo]"))
h.js("()=>{DB.inicioCobro=addMonths(periodoActual(),-2);ensureCuotas();save()}")
h.shot('p4_admin')
h.wait(800)
print('cuotas en nube', len(h.store(f'r/{rid}/cuotas/')))
# crear usuarios como lo hace la app (con clave en el registro)
h.js("""()=>{DB.usuarios.push({id:'u_res1',rol:'residente',nombre:'Rosa Res',casaId:'c1',user:'rosa',pass:'Rosa1234',tel:'7000-0001',dui:'01234567-8',activo:true});
DB.usuarios.push({id:'u_vig',rol:'vigilante',nombre:'Victor Vig',user:'victor',pass:'Vig12345',activo:true});
DB.usuarios.push({id:'u_res2',rol:'residente',nombre:'Pedro',casaId:'c2',user:'pedro',pass:'Pedro123',tel:'7000-0002',activo:true});
DB.casas.find(c=>c.id==='c1').duenoId='u_res1';DB.casas.find(c=>c.id==='c2').duenoId='u_res2';
DB.avisos.unshift({id:'av1',titulo:'Bienvenidos',texto:'Hola',fecha:nowISO()});
DB.notifs.unshift({id:'n_x1',userId:'u_res1',titulo:'Hola Rosa',texto:'t',leida:false,fecha:nowISO()});
DB.notifs.unshift({id:'n_x2',userId:'u_res2',titulo:'Hola Pedro',texto:'t',leida:false,fecha:nowISO()});
save()}""")
h.wait(1500)
print('users auth', sorted(h.js("()=>Object.keys(MOCK.users())")))
print('perfil rosa', h.store(f'r/{rid}/perfiles/u_res1'))
print('pass en db?', 'Rosa1234' in json.dumps(h.store()))
print('local pass?', h.js("()=>DB.usuarios.filter(u=>u.pass).length"))
print('denied', h.denied(), h.toasts())
h.logout()
# ---------- residente
h.login('rosa','Rosa1234',rid)
print('res', h.js("()=>[S.user&&S.user.rol, S.user&&S.user.casaId]"))
print('res ve', h.js("""()=>({casas:DB.casas.length, codigos:DB.casas.filter(c=>c.codigo).map(c=>c.id), cuotasCasas:[...new Set(DB.cuotas.map(q=>q.casaId))], perfilesOtros:DB.usuarios.filter(u=>u.tel&&u.id!==S.user.id).map(u=>u.id), notifs:DB.notifs.map(n=>n.userId), avisos:DB.avisos.length})"""))
h.shot('p4_res')
# pago: como registrarPago
h.js("()=>{const q=DB.cuotas.find(q=>q.casaId==='c1'&&q.estado==='pendiente');q.estado='revision';DB.pagos.unshift({id:'pg1',casaId:'c1',monto:q.monto,estado:'revision',metodo:'transferencia',cuotas:[q.id],fecha:nowISO()});save()}")
h.wait(800)
print('pago nube', list(h.store(f'r/{rid}/pagos/').keys()), 'denied', h.denied())
# intento prohibido: editar aviso y marcar cuota pagada y cambiar mi rol
h.js("()=>{DB.avisos[0].titulo='HACK';DB.cuotas.find(q=>q.casaId==='c1').estado='pagada';save()}")
h.wait(1000)
print('aviso local', h.js("()=>DB.avisos[0].titulo"), 'nube', json.loads(h.store(f'r/{rid}/avisos/av1')[f'r/{rid}/avisos/av1']['d'])['titulo'])
print('cuotas pagadas c1 nube', [v['estado'] for k,v in h.store(f'r/{rid}/cuotas/q_c1').items()][:3])
h.js("()=>{usuario(S.user.id).rol='admin';save()}"); h.wait(1000)
print('rol local', h.js("()=>usuario(S.user.id).rol"), 'claims', h.js("()=>MOCK.users().u_res1.claims"))
print('denied', h.denied()[-4:], h.toasts())
h.logout()
# ---------- vigilante
h.login('victor','Vig12345',rid)
print('vig ve', h.js("""()=>({rol:S.user&&S.user.rol, codigos:DB.casas.filter(c=>c.codigo).length, cuotas:DB.cuotas.length, pagos:DB.pagos.length, tels:DB.usuarios.filter(u=>u.tel).length})"""))
h.shot('p4_vig')
print('denied listen', [d for d in h.denied() if d['op']=='listen'])
print('errs', [e for e in h.errs if 'TUNNEL' not in e][:5])
h.close()

# ===== t_p6.py =====

h=H()
rid=crear_res(h)
h.logout()
h.login('admin','Admin123',rid)
h.js("()=>{DB.usuarios.push({id:'u_res1',rol:'residente',nombre:'Rosa Res',casaId:'c1',user:'rosa',pass:'Rosa1234',activo:true});DB.casas.find(c=>c.id==='c1').duenoId='u_res1';save()}"); h.wait(1200)
h.logout()
# ---------- registro de un propietario nuevo
h.js(f"()=>{{load('{rid}');S.modoPlat=false;render()}}"); h.wait(200)
h.js("()=>irRegistro()"); h.wait(800)
print('registro casas', h.js("()=>[S.tab, DB.casas.length, DB.casas.filter(c=>c.codigo).length, DB.casas.filter(c=>c.duenoId).map(c=>c.id)]"))
h.shot('p6_registro')
cod = json.loads(h.store(f'r/{rid}/casasPriv/c3')[f'r/{rid}/casasPriv/c3']['d'])['codigo']
r = h.js("""async (cod)=>{try{const r=await firebase.app().functions('us-east1').httpsCallable('registro')({rid:RES,casaId:'c3',codigo:cod,nombre:'Nuevo Dueño',familia:'Pérez',dui:'01234567-8',tel:'7000-0003',email:'n@x.com',user:'nuevo',pass:'Nuevo123',documento:null,duiFoto:null,foto:null,selfie:'data:image/png;base64,AA'});return r.data}catch(e){return 'ERR '+e.message}}""", cod)
print('registro', r)
r2 = h.js("""async ()=>{try{await firebase.app().functions('us-east1').httpsCallable('registro')({rid:RES,casaId:'c4',codigo:'000000',nombre:'X',dui:'01234567-8',tel:'1',user:'malo',pass:'Malo1234',selfie:'x'});return 'ok?'}catch(e){return 'ERR '+e.message}}""")
print('codigo malo', r2)
print('login antes de aprobar:'); h.login('nuevo','Nuevo123',rid); print(' ', h.js("()=>!!S.user"), h.toasts())
h.login('admin','Admin123',rid)
print('admin?', h.js("()=>[S.user&&S.user.rol,S.tab,GW_PROD.listo, GW_PROD.uid]"), list(h.store(f'r/{rid}/solicitudes').keys()), h.toasts())
sol = h.js("()=>DB.solicitudes.map(s=>[s.id,s.casaId,s.estado,!!s.pass])")
print('solicitudes', sol)
h.js("(id)=>aprobarSol(id)", sol[0][0]); h.wait(1500)
print('aprobada', h.js("()=>[DB.solicitudes[0].estado, casa('c3').duenoId, !!usuario(casa('c3').duenoId)]"))
h.logout()
h.login('nuevo','Nuevo123',rid)
print('nuevo entra', h.js("()=>S.user&&[S.user.rol,S.user.casaId]"))
h.logout()
# ---------- residente crea inquilino
h.login('rosa','Rosa1234',rid)
h.js("()=>{DB.usuarios.push({id:'u_inq1',rol:'inquilino',nombre:'Ines',casaId:'c1',padreId:'u_res1',user:'ines',pass:'Ines1234',activo:true,hasta:addDays(ymd(),90)});save()}"); h.wait(1500)
print('inquilino auth', h.js("()=>MOCK.users().u_inq1&&MOCK.users().u_inq1.claims"), h.toasts())
# residente intenta crear un admin
h.js("()=>{DB.usuarios.push({id:'u_hack',rol:'admin',nombre:'H',user:'hack',pass:'Hack1234',activo:true});save()}"); h.wait(1500)
print('hack auth', 'u_hack' in h.js("()=>MOCK.users()"), 'local', h.js("()=>!!usuario('u_hack')"), h.toasts())
# cambio de clave propia
h.js("()=>{const f=document.createElement('form');f.innerHTML='<input name=a value=Rosa1234><input name=n value=Rosa9999>';document.body.appendChild(f);cambiarPass({preventDefault(){},target:f})}"); h.wait(600)
print('clave', h.js("()=>MOCK.users().u_res1.password"), h.toasts())
h.logout()
# ---------- dueño entra a la residencial y la edita
h.login('msalinas8811@gmail.com','Dueno123')
print('stats', h.js(f"()=>resStats(PLAT.residenciales[0])"))
h.js(f"()=>impersonar('{rid}')"); h.wait(1500)
print('imp', h.js("()=>[S.user&&S.user.rol, S.imp&&S.imp.rol, DB.casas.length, DB.usuarios.length]"))
h.js("()=>salir()"); h.wait(500)
print('de vuelta', h.js("()=>[S.user&&S.user.rol, S.tab]"))
h.shot('p6_owner_back')
print('denied', h.denied())
print('errs', [e for e in h.errs if 'TUNNEL' not in e][:5])
h.close()

# ===== t_p7.py =====

h=H()
rid=crear_res(h)
# dueño edita la residencial y cambia la clave del admin
h.js(f"()=>editarRes('{rid}')"); h.wait(800)
names = h.js("()=>[...document.querySelectorAll('form [name]')].map(i=>i.name)")
print('form editar', [n for n in names if 'ass' in n or n in('nombre','adminUser')])
h.js("()=>{const i=document.querySelector('form [name=adminPass]');if(i)i.value='Nueva123'}")
h.js("()=>[...document.querySelectorAll('form')].pop().requestSubmit()"); h.wait(2000)
print('clave admin', h.js("()=>MOCK.users().u_admin.password"), h.toasts(), h.denied())
h.logout()
h.login('admin','Nueva123',rid)
print('admin entra', h.js("()=>S.user&&S.user.rol"))
h.js("()=>{DB.inicioCobro=addMonths(periodoActual(),-1);ensureCuotas();DB.usuarios.push({id:'u_res1',rol:'residente',nombre:'Rosa',casaId:'c1',user:'rosa',pass:'Rosa1234',activo:true},{id:'u_cob',rol:'cobrador',nombre:'Cobra',user:'cobra',pass:'Cobra123',activo:true},{id:'u_ven',rol:'vendedor',nombre:'Vende',user:'vende',pass:'Vende123',tel:'7777',activo:true});casa('c1').duenoId='u_res1';save()}"); h.wait(1500)
def recorrer(rol):
    keys = h.js("(r)=>Object.keys(VIEWS[r]||{})", rol)
    bad=[]
    for k in keys:
        n=len(h.errs)
        try: h.js("(k)=>{closeSheet&&closeSheet();go(k)}", k); h.wait(120)
        except Exception as e: bad.append((k,str(e)[:120])); continue
        new=[e for e in h.errs[n:] if 'TUNNEL' not in e]
        if new: bad.append((k,new[:2]))
    return len(keys), bad
print('admin vistas', recorrer('admin'))
# admin desactiva a Rosa
h.js("()=>toggleUser('u_res1')"); h.wait(1000)
print('rosa activo nube', h.store(f'r/{rid}/miembros/u_res1')[f'r/{rid}/miembros/u_res1'].get('activo'))
h.js("()=>toggleUser('u_res1')"); h.wait(1000)
h.logout()
for u,p,rol in [('rosa','Rosa1234','residente'),('cobra','Cobra123','cobrador'),('vende','Vende123','vendedor')]:
    h.login(u,p,rid)
    print(rol, 'entra', h.js("()=>S.user&&S.user.rol"), 'vistas', recorrer(rol), 'listen denied', [d for d in h.denied() if d['op']=='listen'])
    h.shot('p7_'+rol)
    h.logout()
h.login('msalinas8811@gmail.com','Dueno123')
print('owner vistas', recorrer('superadmin'))
h.js("()=>go('mas')"); h.wait(300); h.shot('p7_owner_mas')
print('menu dueño', h.js("()=>document.querySelector('#app').innerText.split('\\n').filter(x=>x.trim()).slice(0,30)"))
# eliminar residencial
h.js(f"()=>eliminarRes('{rid}')"); h.wait(300)
h.js("()=>{document.getElementById('elimRes').value='Villas del Sol'}")
h.js(f"()=>GW_PROD.eliminarResOk('{rid}')"); h.wait(1500)
print('tras eliminar', len(h.store(f'r/{rid}')), sorted(h.js("()=>Object.keys(MOCK.users())")), h.js("()=>PLAT.residenciales.length"))
print('denied total', h.denied())
print('errs', [e for e in h.errs if 'TUNNEL' not in e][:5])
h.close()

# ===== t_p8.py =====

h=H()
rid=crear_res(h)
h.logout()
h.login('admin','Admin123',rid)
h.js("()=>{DB.usuarios.push({id:'u_res1',rol:'residente',nombre:'Rosa',casaId:'c1',user:'rosa',pass:'Rosa1234',tel:'7000',activo:true});casa('c1').duenoId='u_res1';save()}"); h.wait(1500)
h.logout()
h.shot('p8_login')
print('login txt', 'Instala GateWise' in h.js("()=>document.body.innerText"))
h.login('rosa','Rosa1234',rid)
h.js("()=>go('mas')"); h.wait(300); h.shot('p8_res_mas')
t=h.js("()=>document.querySelector('main')?document.querySelector('main').innerText:document.body.innerText")
print('menu', [x for x in ['Activar notificaciones','Instalar la app','Eliminar mi cuenta','Este teléfono'] if x in t])
h.js("()=>GW_PROD.pedirEliminarCuenta()"); h.wait(300); h.shot('p8_elim')
h.js("()=>{document.getElementById('elimOk').value='ELIMINAR';GW_PROD.eliminarCuenta()}"); h.wait(1500)
print('tras eliminar', h.js("()=>[!!S.user, 'u_res1' in MOCK.users()]"), list(h.store(f'r/{rid}/perfiles/u_res1').keys()), h.toasts())
print('errs', [e for e in h.errs if 'TUNNEL' not in e][:5])
h.close()
