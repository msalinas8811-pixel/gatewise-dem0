"""Arnés de pruebas de modo producción (Firebase simulado)."""
import json, os, time
from playwright.sync_api import sync_playwright

import pathlib
HERE = pathlib.Path(__file__).resolve().parent
SP = str(HERE)
ROOT = str(HERE.parent.parent)
URL = os.environ.get('GW_URL', 'http://localhost:8765/index.html')
CORE = open(ROOT + '/functions/core.js').read()
MOCK = open(SP + '/mockfb.js').read()
CFG = open(ROOT + '/config.js').read() + '''
window.GATEWISE_MODO="produccion";
window.GATEWISE_FIREBASE_PROD={apiKey:"test",authDomain:"x",projectId:"gatewise-prod",appId:"x"};
'''

class H:
    def __init__(self, headless=True):
        self.pw = sync_playwright().start()
        self.b = self.pw.chromium.launch()
        self.ctx = self.b.new_context(viewport={'width': 400, 'height': 860}, service_workers='block')
        self.ctx.add_init_script(CORE + '\n' + MOCK)
        self.ctx.route('**/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CFG))
        self.ctx.route('https://www.gstatic.com/**', lambda r: r.abort())
        self.p = self.ctx.new_page()
        self.errs = []
        self.p.on('pageerror', lambda e: self.errs.append(str(e)))
        self.p.on('console', lambda m: self.errs.append('console:' + m.text) if m.type == 'error' else None)
        self.p.goto(URL); self.p.wait_for_timeout(600)

    def js(self, code, arg=None):
        return self.p.evaluate(code, arg) if arg is not None else self.p.evaluate(code)

    def wait(self, ms=500): self.p.wait_for_timeout(ms)

    def shot(self, name): os.makedirs(f'{SP}/capturas', exist_ok=True); self.p.screenshot(path=f'{SP}/capturas/{name}.png')

    def toasts(self):
        return self.js("()=>[...document.querySelectorAll('.toast,#toast,[class*=toast]')].map(x=>x.innerText).join(' | ')")

    def login(self, user, pw, rid=None):
        if rid: self.js(f"()=>{{load('{rid}');render()}}")
        if rid: self.js("()=>{S.modoPlat=false;S.tab='inicio';render()}")
        else: self.js("()=>{S.modoPlat=true;S.tab='inicio';render()}")
        self.wait(200)
        self.js("""([u,p])=>{const f=[...document.querySelectorAll('form')].find(f=>f.querySelector('[name=user]')&&f.querySelector('[name=pass]'));
          f.querySelector('[name=user]').value=u;f.querySelector('[name=pass]').value=p;f.requestSubmit()}""", [user, pw])
        for _ in range(40):
            self.wait(150)
            if self.js("()=>!!(S.user&&GW_PROD.listo||S.user&&S.user.rol==='superadmin'&&GW_PROD.platListo)"): break
        self.wait(400)

    def logout(self):
        self.js("()=>{S.imp=null;salir()}"); self.wait(600)

    def denied(self): return self.js("()=>MOCK.denied.slice()")
    def store(self, prefix=''): return self.js("(p)=>Object.fromEntries(Object.entries(MOCK.store()).filter(([k])=>k.startsWith(p)))", prefix)
    def close(self):
        self.b.close(); self.pw.stop()
