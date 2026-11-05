from hprod import *
def fill(h, vals):
    h.js("""(v)=>{const f=[...document.querySelectorAll('form')].pop();for(const k in v){const i=f.querySelector('[name='+k+']');if(!i)continue;if(i.tagName==='SELECT'&&!v[k]){i.selectedIndex=Math.min(1,i.options.length-1)}else i.value=v[k];i.dispatchEvent(new Event('change',{bubbles:true}))}}""", vals)
def submit(h):
    h.js("()=>[...document.querySelectorAll('form')].pop().requestSubmit()"); h.wait(1200)
def crear_res(h):
    h.js("()=>{MOCK.reset();MOCK.crearDueno('Dueno123')}"); h.p.reload(); h.wait(800)
    h.login('msalinas8811@gmail.com','Dueno123')
    h.js("()=>go('nuevaRes')"); h.wait(300)
    fill(h, {'nombre':'Villas del Sol','linea':'Calle 1','region':'','ciudad':'San Salvador','casas':'12','adminNombre':'Ana Admin','adminUser':'admin','adminPass':'Admin123','estado':'activa'})
    fill(h, {'region':''})
    submit(h)
    return h.js("()=>PLAT.residenciales[0]&&PLAT.residenciales[0].id")
