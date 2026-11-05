/* =========================================================
   MI RESIDENCIAL — Prototipo demo (PWA)
   Datos guardados en el dispositivo (localStorage).
   Roles: admin · residente (dueño) · inquilino · vigilante
   ========================================================= */
const KEY='miresidencial_v4';const PKEY=KEY+'_plat';const dbKey=id=>KEY+'_r_'+id;let PLAT=null,RES=null;
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,10);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>(typeof curSym==='function'?curSym():'$')+Number(n||0).toFixed(2);
const pad=n=>String(n).padStart(2,'0');
function ymd(d=new Date()){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function nowISO(){const d=new Date();return ymd(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes())}
const periodoActual=()=>ymd().slice(0,7);
function addMonths(p,n){let[y,m]=p.split('-').map(Number);m+=n;while(m>12){m-=12;y++}while(m<1){m+=12;y--}return y+'-'+pad(m)}
function addDays(iso,n){const d=new Date(iso+'T12:00');d.setDate(d.getDate()+n);return ymd(d)}
const MESES_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];const MS=()=>typeof LANG!=='undefined'&&LANG==='en'?MESES_EN:MESES;
const perL=p=>{const[y,m]=p.split('-');return MS()[+m-1]+' '+y};
const perC=p=>{const[y,m]=p.split('-');return MS()[+m-1].slice(0,3)+' '+y.slice(2)};
const hora=iso=>iso?iso.slice(11,16):'';
function fFecha(iso){if(!iso)return'';const[y,m,d]=iso.slice(0,10).split('-');let s=+d+' '+MS()[+m-1].slice(0,3).toLowerCase()+' '+y;if(iso.length>10)s+=' · '+hora(iso);return s}
function genCodigo(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<6;i++)s+=a[Math.floor(Math.random()*a.length)];return s}

const ICON={
home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
houses:'<path d="M3 21V10l6-5 6 5v11"/><path d="M15 21h6v-8l-3-2.5"/><path d="M8 21v-5h2v5"/>',
card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
mega:'<path d="M3 11v2a1 1 0 001 1h3l5 4V6L7 10H4a1 1 0 00-1 1z"/><path d="M16 9a4 4 0 010 6"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
gatewise:'<path d="M4.5 21V10.5a7.5 7.5 0 0115 0V21"/><path d="M3 21h18"/><path d="M8.5 14.5l2.5 2.5 4.5-4.5"/>',
store:'<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z"/><path d="M5 13v8h14v-8M10 21v-5h4v5"/>',
box:'<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9"/>',
bell:'<path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 004 0"/>',
key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
back:'<path d="M15 18l-6-6 6-6"/>',
chev:'<path d="M9 6l6 6-6 6"/>',
log:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5.5 7-5.5s6.2 2 7 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c2 .7 3.4 2.6 4 5.2"/>',
alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
out:'<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
doc:'<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
flag:'<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
reset:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>',
phone:'<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/>',
doorin:'<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>'
};
const ic=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||''}</svg>`;

const ROL={vendedor:'Tienda / vendedor',superadmin:'Administrador de la APP',cobrador:'Cobrador',admin:'Administración',residente:'Residente (propietario)',inquilino:'Inquilino',vigilante:'Vigilancia'};
const TIPOS={personal:{l:'Personal de trabajo',e:'🛠️'},entrega:{l:'Entrega de comida',e:'🛵'},correo:{l:'Correo / paquetería',e:'📦'},visita:{l:'Visita',e:'👥'}};
const OFICIOS=['Empleada doméstica','Niñera','Jardinero','Albañil','Electricista','Fontanero','Técnico (internet / cable)','Técnico (electrodomésticos)','Pintor','Chofer','Otro'];
const CAT={trabajos:{l:'Trabajos en la residencial',e:'🚧'},servicio:{l:'Interrupción de servicio',e:'⚠️'},seguridad:{l:'Seguridad',e:'🛡️'},evento:{l:'Reunión / evento',e:'📅'},pagos:{l:'Pagos',e:'💳'},general:{l:'General',e:'📢'}};
const CATR=['Seguridad','Mantenimiento','Alumbrado','Basura','Ruido','Áreas verdes','Agua / drenaje','Mascotas','Vecinos','Otro'];
const EST_R={abierto:{l:'Abierto',c:'warn'},proceso:{l:'En proceso',c:'info'},resuelto:{l:'Resuelto',c:'ok'}};
const EST_P={revision:{l:'En revisión',c:'info'},aprobado:{l:'Aprobado',c:'ok'},rechazado:{l:'Rechazado',c:'bad'}};
const METODO={cobrador:'Cobrador a domicilio',transferencia:'Transferencia',link:'Link de pago',efectivo:'Efectivo (registrado por admin)'};

/* ---------------- Datos ---------------- */
let DB, S={user:null,tab:'inicio',sub:null,sel:null};
function genImg({titulo,sub,filas=[],sello,color=marcaPri()}){
  const W=640,c=document.createElement('canvas');const x=c.getContext('2d');
  const wrap=t=>{t=String(t??'');const out=[];let line='';t.split(' ').forEach(w=>{if((line+' '+w).trim().length>40){out.push(line.trim());line=w}else line+=' '+w});if(line.trim())out.push(line.trim());return out.length?out:['']};
  const rows=filas.map(([k,v])=>[k,wrap(v)]);
  const H=150+rows.reduce((a,[,l])=>a+30+l.length*26,0)+(sello?120:40);
  c.width=W;c.height=H;x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle=color;x.fillRect(0,0,W,108);
  x.fillStyle='#fff';x.font='bold 30px sans-serif';x.fillText(titulo,32,50);x.font='18px sans-serif';x.fillText(sub||'',32,84);
  let y=150;rows.forEach(([k,l])=>{x.fillStyle='#64748b';x.font='16px sans-serif';x.fillText(k,32,y);y+=26;x.fillStyle='#111827';x.font='bold 20px sans-serif';l.forEach(t=>{x.fillText(t,32,y);y+=26});y+=4;x.strokeStyle='#e5e7eb';x.beginPath();x.moveTo(32,y-14);x.lineTo(W-32,y-14);x.stroke()});
  if(sello){x.save();x.translate(W-180,y+50);x.rotate(-.12);x.strokeStyle='#15803d';x.lineWidth=4;x.strokeRect(-130,-36,260,72);x.fillStyle='#15803d';x.font='bold 28px sans-serif';x.textAlign='center';x.fillText(sello,0,10);x.restore()}
  return c.toDataURL('image/jpeg',.82);
}
function genFoto(ini,bg,l1,l2){const c=document.createElement('canvas');c.width=480;c.height=480;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,480,480);x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(240,190,90,0,7);x.fill();x.beginPath();x.arc(240,470,170,Math.PI,0);x.fill();x.fillStyle=bg;x.font='bold 64px sans-serif';x.textAlign='center';x.fillText(ini,240,212);if(l1)selloVivo(c,l1,l2);return c.toDataURL('image/jpeg',.8)}
function selloVivo(c,l1,l2){const x=c.getContext('2d');const h=Math.max(56,c.height*.13);x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,c.height-h,c.width,h);x.fillStyle='#fff';x.textAlign='left';const fs=Math.max(13,Math.round(h*.26));x.font='bold '+fs+'px sans-serif';x.fillText(l1,12,c.height-h+fs+8);x.font=fs+'px sans-serif';if(l2)x.fillText(l2,12,c.height-h+fs*2+14)}
function seed(){
  const hoy=ymd(),per=periodoActual(),inicio=addMonths(per,-5);
  const db={version:1,inicioCobro:inicio,
    residencial:{nombre:'Residencial Los Almendros',direccion:'Calle principal, Pasajes A y B',municipio:'Santa Tecla, La Libertad',telefono:'2200-0000',email:'administracion@losalmendros.example',registro:'',
      presidente:{nombre:'Roberto Aguilar',dui:'01234567-8',telefono:'7000-1111',email:'presidente@losalmendros.example'},
      admin:{nombre:'Lucía Martínez',telefono:'7000-2222',email:'admin@losalmendros.example'},
      banco:{banco:'Banco (ejemplo)',tipo:'Cuenta corriente',numero:'000-000000-0',titular:'Asociación Residencial Los Almendros'},
      vigilancia:{telefono:'7000-3333'},
      equipo:[{id:'e1',cargo:'Presidente',nombre:'Roberto Aguilar',dui:'01234567-8',telefono:'7000-1111',email:'presidente@losalmendros.example'},{id:'e2',cargo:'Vicepresidente',nombre:'Gloria Ventura',telefono:'7000-1212'},{id:'e3',cargo:'Secretario(a)',nombre:'Fernando Quintanilla',telefono:'7000-1313'},{id:'e4',cargo:'Tesorero(a)',nombre:'Patricia Solórzano',telefono:'7000-1414'},{id:'e5',cargo:'Vocal',nombre:'Ernesto Lemus',telefono:'7000-1515'},{id:'e6',cargo:'Vocal',nombre:'Claudia Marroquín',telefono:'7000-1616'},{id:'e7',cargo:'Contador(a)',nombre:'Julio Arévalo',telefono:'7000-1717'},{id:'e8',cargo:'Administrador(a)',nombre:'Lucía Martínez',telefono:'7000-2222',email:'admin@losalmendros.example'},{id:'e9',cargo:'Asistente administrativo',nombre:'Karla Menjívar',telefono:'7000-1818'},{id:'e10',cargo:'Jardinero',nombre:'Santos Ayala',telefono:'7000-1919'},{id:'e11',cargo:'Conserje',nombre:'Rosa Hernández',telefono:'7000-2020'}],
      portones:[{id:'p1',nombre:'Portón principal',tipo:'Vehicular y peatonal',horario:'24 horas'},{id:'p2',nombre:'Portón de servicio',tipo:'Vehicular y peatonal',horario:'6:00–18:00'},{id:'p3',nombre:'Acceso peatonal Polígono B',tipo:'Peatonal',horario:'5:00–21:00'}],
      portonTipo:{personal:'p2',entrega:'p1',correo:'p1',visita:'p1'}},
    config:{cuota:35,diaVence:10,recargo:3,linkPago:'',diasAviso:5},
    casas:[],usuarios:[],cuotas:[],pagos:[],pases:[],avisos:[],reclamos:[],notifs:[],solicitudes:[],autorizaciones:[],recordados:{}};
  const nombres=['Marta Rivas','Óscar Pineda','Elena Cruz','Raúl Guevara','Carlos Méndez','Sofía Orellana','Héctor Molina','Ana López','Diana Alvarado','Mario Henríquez'];
  for(let i=1;i<=12;i++)db.casas.push({id:'c'+i,numero:String(i),pasaje:i<=6?'Polígono A':'Polígono B',familia:'',duenoId:null,codigo:genCodigo()});
  db.usuarios.push({id:'u_admin',rol:'admin',nombre:'Lucía Martínez',user:'admin',pass:'1234',activo:true,tel:'7000-2222'});
  db.usuarios.push({id:'u_vig',rol:'vigilante',nombre:'José Portillo',user:'vigilante',pass:'1234',turno:'Día (6:00–18:00)',dui:'04567890-1',activo:true});
  const fams=['Rivas Morales','Pineda Soto','Cruz Ayala','Guevara Funes','Méndez Romero','Orellana Paz','Molina Vides','López Castro','Alvarado Reyes','Henríquez Mejía'];nombres.forEach((n,k)=>{const i=k+1;db.casas[k].familia=fams[k];db.usuarios.push({id:'u_c'+i,rol:'residente',nombre:n,user:'casa'+i,pass:'1234',casaId:'c'+i,tel:'7'+(100+i)+'-'+(4000+i*7),email:'casa'+i+'@correo.example',dui:'0'+(1000000+i*1111)+'-'+i%10,activo:true});db.casas[k].duenoId='u_c'+i});
  db.usuarios.push({id:'u_inq8',rol:'inquilino',nombre:'Pedro Castillo',user:'inquilino8',pass:'1234',casaId:'c8',padreId:'u_c8',tel:'7555-1212',dui:'05551212-3',hasta:addDays(hoy,180),activo:true});
  const mora={c3:3,c5:2,c7:1,c9:4,c10:2};
  db.casas.forEach(c=>{for(let k=0;k<6;k++){const p=addMonths(inicio,k);const pend=k>=6-(mora[c.id]||0);db.cuotas.push({id:uid(),casaId:c.id,periodo:p,monto:db.config.cuota,estado:pend?'pendiente':'pagado'})}});
  // pagos aprobados de ejemplo (casa 5)
  db.pagos.push({id:uid(),casaId:'c5',periodos:[0,1,2,3].map(k=>addMonths(inicio,k)),monto:140,metodo:'transferencia',ref:'884213',fecha:addDays(hoy,-60)+'T09:12',fechaAprob:addDays(hoy,-59)+'T10:00',estado:'aprobado',usuarioId:'u_c5',comprobante:null});
  // pago en revisión (casa 2)
  const c2=db.cuotas.find(q=>q.casaId==='c2'&&q.periodo===per);c2.estado='revision';
  db.pagos.push({id:uid(),casaId:'c2',periodos:[per],monto:38,metodo:'transferencia',ref:'552901',banco:'Banco (ejemplo)',fecha:addDays(hoy,-1)+'T19:40',estado:'revision',usuarioId:'u_c2',
    comprobante:{tipo:'img',nombre:'comprobante.jpg',data:genImg({titulo:'Transferencia exitosa',sub:'Comprobante de ejemplo',filas:[['Monto','$38.00'],['Cuenta destino','Asociación Residencial Los Almendros'],['Referencia','552901'],['Concepto','Cuota '+perL(per)+' Casa 2']],color:'#1d4ed8'})}});
  db.recaudoBase={};
  const P=(o)=>Object.assign({id:uid(),pin:String(100000+Math.floor(Math.random()*899999)),estado:'activo',ingresos:[],dui:'',placa:'',detalle:'',horario:''},o);
  db.pases.push(P({casaId:'c5',creadoPor:'u_c5',tipo:'personal',nombre:'María Hernández',dui:'03344556-7',detalle:'Empleada doméstica',horario:'Lun–Sáb 7:00–16:00',desde:addDays(hoy,-10),hasta:addDays(hoy,50),ingresos:[{entrada:hoy+'T07:45',salida:null,guardiaId:'u_vig'}]}));
  db.pases.push(P({casaId:'c5',creadoPor:'u_c5',tipo:'visita',nombre:'Jorge Ramírez',placa:'P123-456',detalle:'Visita familiar',desde:hoy,hasta:hoy}));
  db.pases.push(P({casaId:'c5',creadoPor:'u_c5',tipo:'entrega',nombre:'Repartidor',detalle:'Pedido de almuerzo (app de delivery)',desde:hoy,hasta:hoy}));
  db.pases.push(P({casaId:'c8',creadoPor:'u_inq8',tipo:'personal',nombre:'Luis Gómez',dui:'02233445-6',detalle:'Técnico (internet / cable)',desde:hoy,hasta:addDays(hoy,1)}));
  db.pases.push(P({casaId:'c3',creadoPor:'u_c3',tipo:'personal',nombre:'Santos Rivera',dui:'06677889-0',detalle:'Albañil',horario:'Lun–Vie 7:00–17:00',desde:addDays(hoy,-5),hasta:addDays(hoy,20),ingresos:[{entrada:addDays(hoy,-1)+'T07:05',salida:addDays(hoy,-1)+'T16:50',guardiaId:'u_vig'}]}));
  db.usuarios.push({id:'u_cob',rol:'cobrador',nombre:'Mauricio Campos',user:'cobrador',pass:'1234',dui:'03456789-0',tel:'7444-5566',activo:true});
  db.visitasCobro=[{id:uid(),casaId:'c9',periodos:db.cuotas.filter(q=>q.casaId==='c9'&&q.estado==='pendiente').map(q=>q.periodo),fecha:hoy,franja:'tarde',recibo:'ambos',nota:'Preguntar por Diana',cobradorId:'',estado:'pendiente',solicitadoPor:'u_c9',creada:addDays(hoy,-1)+'T18:00'},{id:uid(),casaId:'c10',periodos:db.cuotas.filter(q=>q.casaId==='c10'&&q.estado==='pendiente').map(q=>q.periodo),fecha:addDays(hoy,1),franja:'manana',recibo:'digital',nota:'',cobradorId:'u_cob',estado:'pendiente',solicitadoPor:'u_admin',creada:hoy+'T08:00'}];
  {const c7=db.cuotas.filter(q=>q.casaId==='c7'&&q.estado==='pendiente');c7.forEach(q=>q.estado='pagado');db.reciboSeq=2;
   const pA={id:uid(),casaId:'c1',periodos:[addMonths(per,-1)],monto:35,metodo:'cobrador',forma:'efectivo',ref:'C-00001',talonario:'4512',recibo:'fisico',fecha:addDays(hoy,-1)+'T10:20',fechaAprob:addDays(hoy,-1)+'T10:20',estado:'aprobado',usuarioId:'u_cob',cobradorId:'u_cob',cierreId:'ci1',comprobante:null};
   const pH={id:uid(),casaId:'c7',periodos:c7.map(q=>q.periodo),monto:c7.length*38,metodo:'cobrador',forma:'efectivo',ref:'C-00002',talonario:'',recibo:'digital',fecha:hoy+'T09:40',fechaAprob:hoy+'T09:40',estado:'aprobado',usuarioId:'u_cob',cobradorId:'u_cob',cierreId:null,comprobante:null};
   db.pagos.push(pA,pH);db.cierres=[{id:'ci1',cobradorId:'u_cob',fecha:addDays(hoy,-1)+'T17:30',pagos:[pA.id],total:35,efectivo:35,cheques:0,declarado:35,nota:'',estado:'cuadrado',recibido:35,dif:0,revisadoPor:'u_admin',fechaRev:addDays(hoy,-1)+'T18:00'}]}
  db.pases.forEach(p=>p.porton=db.residencial.portonTipo[p.tipo]);db.autorizaciones.forEach(a=>a.porton='p1');
  db.avisos.push({id:uid(),categoria:'servicio',prioridad:'urgente',titulo:'Corte de agua programado',cuerpo:'La distribuidora realizará trabajos en la tubería principal. Se recomienda almacenar agua.',cuando:addDays(hoy,2)+'T08:00',fecha:addDays(hoy,-1)+'T17:00'});
  db.avisos.push({id:uid(),categoria:'trabajos',prioridad:'normal',titulo:'Reparación del portón principal',cuerpo:'Durante la reparación, el ingreso vehicular será por el portón de servicio.',cuando:addDays(hoy,5)+'T09:00',fecha:addDays(hoy,-3)+'T12:00'});
  db.avisos.push({id:uid(),categoria:'evento',prioridad:'normal',titulo:'Asamblea general de residentes',cuerpo:'Se presentará el informe financiero y el plan de mejoras. Asistencia importante.',cuando:addDays(hoy,12)+'T18:00',fecha:addDays(hoy,-6)+'T09:00'});
  db.reclamos.push({id:uid(),casaId:'c5',usuarioId:'u_c5',categoria:'Alumbrado',titulo:'Lámpara dañada en Pasaje A',descripcion:'La lámpara frente a la casa 5 no enciende desde hace 3 noches.',ubicacion:'Frente a casa 5',foto:null,estado:'proceso',fecha:addDays(hoy,-4)+'T20:10',hilo:[{autor:'u_admin',texto:'Gracias por reportar. El electricista viene el jueves.',fecha:addDays(hoy,-3)+'T08:30'}]});
  db.reclamos.push({id:uid(),casaId:'c9',usuarioId:'u_c9',categoria:'Basura',titulo:'Basura acumulada en zona verde',descripcion:'Hay bolsas acumuladas cerca del área de juegos.',ubicacion:'Área de juegos',foto:null,estado:'abierto',fecha:addDays(hoy,-1)+'T11:00',hilo:[]});
  db.casas[10].duenoId=null;db.casas[11].duenoId=null;
  db.solicitudes.push({id:uid(),casaId:'c11',nombre:'Daniela Flores',familia:'Flores Díaz',foto:{tipo:'img',nombre:'foto.jpg',data:genFoto('DF','#7c3aed')},selfie:{tipo:'img',nombre:'selfie.jpg',data:genFoto('DF','#7c3aed','Verificación en vivo · '+fFecha(addDays(hoy,-1)+'T21:12'),'Reto: Muestra 2 dedos junto a tu cara'),fecha:addDays(hoy,-1)+'T21:12',reto:'Muestra 2 dedos junto a tu cara',metodo:'camara'},dui:'07788990-1',tel:'7666-9090',email:'daniela@correo.example',user:'daniela',pass:'1234',estado:'pendiente',fecha:addDays(hoy,-1)+'T21:15',
    documento:{tipo:'img',nombre:'escritura.jpg',data:genImg({titulo:'Escritura de propiedad',sub:'Documento de ejemplo',filas:[['Inmueble','Casa 11, Pasaje B, Residencial Los Almendros'],['Propietaria','Daniela Flores'],['Inscripción','Registro de la Propiedad (ejemplo)']],color:'#334155'})},
    duiFoto:{tipo:'img',nombre:'dui.jpg',data:genImg({titulo:'Documento de identidad',sub:'Imagen de ejemplo',filas:[['Nombre','Daniela Flores'],['DUI','07788990-1']],color:'#475569'})}});
  db.autorizaciones.push({id:uid(),casaId:'c5',nombre:'Mensajero de paquetería',dui:'',tipo:'correo',motivo:'Paquete a nombre de Carlos Méndez',placa:'',estado:'esperando',fecha:nowISO(),guardiaId:'u_vig'});
  const n=(u,t,x,a,f)=>db.notifs.push({id:uid(),userId:u,titulo:t,texto:x,fecha:f||nowISO(),leida:false,accion:a||null});
  n('u_c5','Bienvenido a GateWise','Desde aquí controlas accesos, pagos, avisos y reportes de tu casa.',null,addDays(hoy,-2)+'T10:00');
  n('u_c5','📦 Autorización solicitada','Vigilancia pide autorizar el ingreso de: Mensajero de paquetería.',{tab:'inicio'});
  n('u_c5','✅ Ingresó: María Hernández','Personal de trabajo ingresó a la colonia a las 07:45 · Validado por José Portillo',{tab:'accesos'},hoy+'T07:45');
  n('u_admin','Nueva solicitud de registro','Daniela Flores solicita acceso como propietaria de Casa 11.',{tab:'solicitudes'});
  seedDirectorio(db,true);seedTienda(db);seedResenas(db);seedVotaciones(db);
  return db;
}
function load(id){if(!PLAT||!PLAT.residenciales.length){DB=null;RES=null;return}id=id||RES||PLAT.ultima||'r1';if(!PLAT.residenciales.some(r=>r.id===id))id=PLAT.residenciales[0].id;RES=id;PLAT.ultima=id;savePlat();try{DB=JSON.parse(localStorage.getItem(dbKey(id)))}catch(e){DB=null}if(!DB||!DB.version){DB=id==='r1'?seed():seedVacia(PLAT.residenciales.find(r=>r.id===id))}DB.visitasCobro=DB.visitasCobro||[];if(!DB.tienda)DB.tienda={productos:[],pedidos:[],seq:0};if(id==='r1'&&!DB.tiendaSeeded&&DB.usuarios.some(u=>u.id==='u_c5')&&!DB.usuarios.some(u=>u.rol==='vendedor')){try{seedTienda(DB)}catch(e){}}DB.tiendaSeeded=true;if(!DB.resenas){if(id==='r1'&&DB.usuarios.some(u=>u.id==='u_ven1')){try{seedResenas(DB)}catch(e){}}if(!DB.resenas)DB.resenas=[]}if(!DB.votaciones){if(id==='r1'&&DB.casas.some(c=>c.id==='c5')){try{seedVotaciones(DB)}catch(e){}}if(!DB.votaciones)DB.votaciones=[]}DB.usuarios.forEach(u=>{if(u.id==='u_ven1'&&!u.logo&&u.negocio==='Pupusería Doña Tere')u.logo=genLogo('DT','#b45309');if(u.id==='u_ven2'&&!u.logo&&u.negocio==='Panadería Dulce Hogar')u.logo=genLogo('DH','#be185d')});DB.cierres=DB.cierres||[];DB.reciboSeq=DB.reciboSeq||0;ensureCuotas();save()}
function save(){if(!DB||!RES)return;try{localStorage.setItem(dbKey(RES),JSON.stringify(DB))}catch(e){toast('Almacenamiento lleno: usa fotos más livianas o restablece la demo')}try{nubeRes()}catch(e){}}
function ensureCuotas(){const fin=periodoActual();DB.casas.forEach(c=>{let p=c.desde||DB.inicioCobro,g=0;while(p<=fin&&g<240){if(!DB.cuotas.some(q=>q.casaId===c.id&&q.periodo===p))DB.cuotas.push({id:uid(),casaId:c.id,periodo:p,monto:c.cuota||DB.config.cuota,estado:'pendiente'});p=addMonths(p,1);g++}})}

/* ---------------- Helpers de negocio ---------------- */
const casa=id=>DB.casas.find(c=>c.id===id);
const usuario=id=>DB.usuarios.find(u=>u.id===id);
const casaNom=id=>{const c=casa(id);if(!c)return'—';const dup=DB.casas.some(x=>x.id!==c.id&&x.numero===c.numero);return 'Casa '+c.numero+(dup?' '+c.pasaje.replace(/^pol[ií]gono\s*/i,'Pol. '):'')};
const duenoNom=id=>{const c=casa(id);const u=c&&usuario(c.duenoId);return u?u.nombre:c&&c.prop&&c.prop.nombre?c.prop.nombre+' (sin cuenta)':'Sin propietario registrado'};
const CARGOS={directiva:['Presidente','Vicepresidente','Secretario(a)','Tesorero(a)','Síndico','Vocal'],administracion:['Administrador(a)','Contador(a)','Asistente administrativo'],operativo:['Conserje','Jardinero','Mantenimiento','Electricista','Otro']};
const GRUPO={directiva:'Junta directiva',administracion:'Administración',operativo:'Personal operativo'};
const grupoDe=c=>Object.keys(CARGOS).find(g=>CARGOS[g].includes(c))||'operativo';
const miembro=c=>(DB.residencial.equipo||[]).find(m=>m.cargo===c);
const portones=()=>DB.residencial.portones||[];
const portonNom=id=>{const p=portones().find(x=>x.id===id);return p?p.nombre:'Sin asignar'};
const portonDe=t=>(DB.residencial.portonTipo||{})[t]||'';
const casaDesc=c=>c.pasaje+(typeof casaExtra==='function'&&casaExtra(c)?' · '+casaExtra(c):'')+(c.familia?' · Fam. '+c.familia:'');
const duiValido=d=>(esCondo()||paisRes()!=='SV')?String(d||'').trim().length>=4:/^\d{8}-\d$/.test(d);
const duiOk=d=>!d||duiValido(d);
function avatar(u,s=42){if(u&&u.foto&&u.foto.data)return `<img src="${u.foto.data}" alt="" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex:none">`;const ini=(u?u.nombre:'?').split(' ').map(w=>w[0]).slice(0,2).join('');return `<div class="av" style="width:${s}px;height:${s}px;border-radius:50%">${esc(ini)}</div>`}
const vence=p=>p+'-'+pad(DB.config.diaVence);
const vencida=c=>c.estado!=='pagado'&&ymd()>vence(c.periodo);
const montoCuota=c=>c.monto+(vencida(c)?Number(DB.config.recargo||0):0);
const cuotasCasa=id=>DB.cuotas.filter(c=>c.casaId===id).sort((a,b)=>a.periodo.localeCompare(b.periodo));
const moraCasa=id=>cuotasCasa(id).filter(c=>c.estado==='pendiente'&&vencida(c));
const pendCasa=id=>cuotasCasa(id).filter(c=>c.estado==='pendiente');
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
function morosos(){return DB.casas.map(c=>{const m=moraCasa(c.id);return{c,m,total:sum(m,montoCuota)}}).filter(x=>x.m.length).sort((a,b)=>b.m.length-a.m.length)}
function estadoCasa(c){const m=moraCasa(c.id);if(m.length)return{l:m.length+(m.length>1?' meses':' mes')+' en mora',c:'bad'};if(cuotasCasa(c.id).some(q=>q.estado==='revision'))return{l:'Pago en revisión',c:'info'};if(pendCasa(c.id).length)return{l:'Cuota del mes pendiente',c:'warn'};return{l:'Al día',c:'ok'}}
const usuariosCasa=cid=>DB.usuarios.filter(u=>u.casaId===cid&&u.activo&&(u.rol==='residente'||u.rol==='inquilino')).map(u=>u.id);
const duenoIds=cid=>{const c=casa(cid);return c&&c.duenoId?[c.duenoId]:[]};
const admins=()=>DB.usuarios.filter(u=>u.rol==='admin'&&u.activo).map(u=>u.id);
const vigilantes=()=>DB.usuarios.filter(u=>u.rol==='vigilante'&&u.activo).map(u=>u.id);
const todos=()=>DB.usuarios.filter(u=>u.activo).map(u=>u.id);
function notificar(ids,titulo,texto,accion){const f=nowISO();[...new Set(ids)].forEach(u=>{if(S.user&&u===S.user.id&&S.user.rol==='admin')return;DB.notifs.unshift({id:uid(),userId:u,titulo,texto,fecha:f,leida:false,accion:accion||null})});if(DB.notifs.length>800)DB.notifs.length=800}
const dentro=p=>{const l=p.ingresos[p.ingresos.length-1];return!!(l&&!l.salida)};
const vigenteHoy=p=>p.estado==='activo'&&p.desde<=ymd()&&ymd()<=p.hasta;
function estadoPase(p){const h=ymd(),l=p.ingresos[p.ingresos.length-1];
  if(l&&!l.salida)return{l:'Dentro desde '+hora(l.entrada),c:'ok'};
  if(p.estado==='cancelado')return{l:'Cancelado',c:'mut'};
  if(h>p.hasta)return{l:'Vencido',c:'mut'};
  if(h<p.desde)return{l:'Programado',c:'info'};
  const hi=p.ingresos.filter(i=>i.entrada.slice(0,10)===h);
  if(hi.length)return{l:'Salió a las '+hora(hi[hi.length-1].salida),c:'mut'};
  return{l:'Esperado hoy',c:'warn'}}
function genPin(){let p;do{p=String(100000+Math.floor(Math.random()*899999))}while(DB.pases.some(x=>x.pin===p&&x.estado==='activo'));return p}
const vigencia=p=>p.desde===p.hasta?fFecha(p.desde):fFecha(p.desde)+' → '+fFecha(p.hasta);

/* ---------------- UI base ---------------- */
let toastT;function toast(t){let d=$('#toast');if(!d){d=document.createElement('div');d.id='toast';d.className='toast';document.body.appendChild(d)}d.textContent=t;d.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>d.style.display='none',3200)}
function sheet(title,html){closeSheet();const d=document.createElement('div');d.className='ov';d.id='ov';d.innerHTML=`<div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="sh-h"><b>${title}</b><button class="icon-btn" onclick="closeSheet()" aria-label="Cerrar">${ic('x',20)}</button></div><div class="sh-b">${html}</div></div>`;d.addEventListener('click',e=>{if(e.target===d)closeSheet()});document.body.appendChild(d)}
function closeSheet(){S.chatOpen=null;if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}const o=$('#ov');if(o)o.remove()}
const ALIC={bad:'alert',warn:'clock',ok:'okc',info:'info'};const alertBox=(c,t,p,on)=>{const x=`<span class="al-ic">${ic(ALIC[c]||'info',20)}</span><span class="al-tx"><b>${t}</b>${p?`<p>${p}</p>`:''}</span>`;return on?`<button class="alert ax ${c}" onclick="${on}">${x}<span class="al-ch">${ic('chev',18)}</span></button>`:`<div class="alert ax ${c}">${x}</div>`};
const KPIC=[[/recaud|cobrad|ingreso|ventas|mrr/i,'trend','green'],[/mora|por cobrar|deuda/i,'alert','red'],[/dentro/i,'doorin','blue'],[/reclamo/i,'chatalert','amber'],[/pase/i,'ticket','teal'],[/pedido/i,'bag','pink'],[/producto/i,'box','indigo'],[/residencial|comunidad/i,'building','teal'],[/usuario|residente|persona/i,'users','violet'],[/casa/i,'houses','sky'],[/solicitud/i,'userplus','blue'],[/efectivo|caja|recibo/i,'cash','green']];
const kpi=(l,v,on)=>{const k=KPIC.find(x=>x[0].test(String(l)))||[0,'chart','indigo'];return `<button class="kpi" onclick="${on}"><span class="ki c-${k[2]}">${ic(k[1],18)}</span><span>${l}</span><b>${v}</b></button>`};
const chip=(l,c='')=>`<span class="chip ${c}">${l}</span>`;
const empty=t=>`<div class="empty">${t}</div>`;
const menuItem=(icon,label,on,badge)=>`<button class="item mi" onclick="${on}"><span class="mic c-${(typeof ICOL!=='undefined'&&ICOL[icon])||'teal'}">${ic(icon,20)}</span><b class="grow">${label}</b>${badge?chip(badge,'bad'):''}${ic('chev',18)}</button>`;
const seg=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button class="${S[key]===v?'on':''}" onclick="S.${key}='${v}';render()">${l}</button>`).join('')}</div>`;
function verArchivo(f,titulo){if(!f)return toast('Sin archivo adjunto');
  if(f.tipo==='img')return sheet(titulo||'Archivo',`<img class="thumb" src="${f.data}" alt="${esc(f.nombre)}"><a class="btn block" download="${esc(f.nombre)}" href="${f.data}">Descargar</a>`);
  if(!f.data)return sheet(titulo||'Archivo',`<p>📄 ${esc(f.nombre)}</p><p class="note">En la demo los PDF mayores a 900 KB solo guardan el nombre. En la versión real se guardan completos en la nube.</p>`);
  let url=f.data;try{const b=atob(f.data.split(',')[1]);const a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);url=URL.createObjectURL(new Blob([a],{type:'application/pdf'}))}catch(e){}
  sheet(titulo||'Archivo',`<p>📄 ${esc(f.nombre)}</p><a class="btn block" href="${url}" target="_blank" rel="noopener">Abrir PDF</a><a class="btn ghost block" download="${esc(f.nombre)}" href="${url}">Descargar</a>`)}
function leerArchivo(file){return new Promise((res,rej)=>{if(!file||!file.size)return res(null);const r=new FileReader();
  if(file.type.startsWith('image/')){r.onload=()=>{const img=new Image();img.onload=()=>{const m=1100,s=Math.min(1,m/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res({tipo:'img',nombre:file.name.replace(/\.\w+$/,'')+'.jpg',data:c.toDataURL('image/jpeg',.7)})};img.onerror=()=>rej(new Error('img'));img.src=r.result};r.onerror=rej;r.readAsDataURL(file)}
  else if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){if(file.size>900000)return res({tipo:'pdf',nombre:file.name,data:null});r.onload=()=>res({tipo:'pdf',nombre:file.name,data:r.result});r.onerror=rej;r.readAsDataURL(file)}
  else rej(new Error('tipo'))})}

/* ---------------- Navegación ---------------- */
const NAV={
  admin:[{id:'inicio',l:'Inicio',i:'home'},{id:'casas',l:'Casas',i:'houses'},{id:'pagos',l:'Pagos',i:'card'},{id:'avisos',l:'Avisos',i:'mega'},{id:'mas',l:'Más',i:'menu'}],
  residente:[{id:'inicio',l:'Inicio',i:'home'},{id:'accesos',l:'Accesos',i:'key'},{id:'pagos',l:'Pagos',i:'card'},{id:'avisos',l:'Avisos',i:'mega'},{id:'mas',l:'Más',i:'menu'}],
  inquilino:[{id:'inicio',l:'Inicio',i:'home'},{id:'accesos',l:'Accesos',i:'key'},{id:'avisos',l:'Avisos',i:'mega'},{id:'mas',l:'Más',i:'menu'}],
  vigilante:[{id:'inicio',l:'Portería',i:'shield'},{id:'sinpase',l:'Sin pase',i:'doorin'},{id:'bitacora',l:'Bitácora',i:'log'},{id:'avisos',l:'Avisos',i:'mega'},{id:'mas',l:'Más',i:'menu'}]};
const BACK={casa:'casas'};
function go(t,sub){S.tab=t;S.sub=sub??null;closeSheet();render();window.scrollTo(0,0)}
function render(){aplicarMarca();
  const app=$('#app');
  if(!S.user&&!DB&&PLAT.residenciales.length)load();
  if(!S.user){app.innerHTML=S.tab==='registro'?vRegistro():S.tab==='solicitarRes'?vSolicitarRes():authShell(vLogin());return}
  const u=S.user,navs=NAV[u.rol],V=VIEWS[u.rol];
  if(!V[S.tab])S.tab='inicio';
  const isSub=!navs.some(n=>n.id===S.tab);
  const nl=u.rol==='superadmin'?PLAT.solicitudes.filter(s=>s.estado==='pendiente').length:DB.notifs.filter(n=>n.userId===u.id&&!n.leida).length;
  const body=V[S.tab]();
  app.innerHTML=shellHTML(u,navs,V,isSub,nl,body);
}

/* ---------------- Sesión ---------------- */
function setSes(id){try{sessionStorage.setItem(KEY+'_s',id||'')}catch(e){}try{localStorage.setItem(KEY+'_last',id||'')}catch(e){}}
function getSes(){let s='';try{s=sessionStorage.getItem(KEY+'_s')}catch(e){}if(s===null||s===undefined||s===''){try{s=localStorage.getItem(KEY+'_last')||''}catch(e){}}return s}
function puedeEntrar(u){if(u&&u.rol!=='superadmin'){const r=PLAT.residenciales.find(x=>x.id===RES);if(r&&r.estado==='suspendida')return'El servicio de esta residencial está suspendido. Contacta al proveedor de la app.';if(r&&r.estado==='prueba'&&r.vencePrueba&&ymd()>r.vencePrueba)return'El periodo de prueba de esta residencial terminó.'}if(!u||!u.activo)return'Usuario desactivado. Contacta a la administración';if(u.rol==='inquilino'){if(u.hasta&&ymd()>u.hasta)return'Tu acceso como inquilino venció. Pide al propietario que lo renueve';const p=usuario(u.padreId);if(!p||!p.activo)return'El propietario de la casa ya no está activo'}return''}
function login(e){e.preventDefault();const f=new FormData(e.target);const un=String(f.get('user')).trim().toLowerCase();if(S.modoPlat||!PLAT.residenciales.length){return loginDueno(un,f.get('pass'))}if(!DB)return toast('Usuario o clave incorrectos');const u=DB.usuarios.find(x=>x.user.toLowerCase()===un&&x.pass===f.get('pass'));if(!u)return toast('Usuario o contraseña incorrectos');entrar(u)}
function asegurarEjemplo(){const ej=seedPlat();if(!PLAT.residenciales.some(r=>r.id==='r1')){PLAT.residenciales.unshift(ej.residenciales[0]);try{localStorage.removeItem(dbKey('r1'))}catch(e){}}PLAT.demo=true;savePlat()}
function entrarId(id){asegurarEjemplo();if(id==='sa1')return entrar(PLAT.superadmins.find(x=>x.id==='sa1'));if(RES!=='r1')load('r1');entrar(usuario(id))}
function entrar(u){if(u&&u.rol==='superadmin')setTimeout(()=>{try{cachearResidenciales()}catch(e){}},50);const err=puedeEntrar(u);if(err)return toast(err);S.user=u;S.tab='inicio';S.sel=null;S.imp=null;setSes((u.rol==='superadmin'?'plat':RES)+'|'+u.id);autoRecordatorio(u);save();render();window.scrollTo(0,0)}
function salir(){closeSheet();if(S.user&&S.user.rol==='superadmin'&&!S.imp)cerrarDueno();if(S.imp){const sa=S.imp;S.imp=null;S.user=sa;S.tab='residenciales';S.sub=null;setSes('plat|'+sa.id);render();return}S.modoPlat=!!(S.user&&S.user.rol==='superadmin');S.user=null;S.tab='inicio';setSes('');render()}
function resetDemoOld(){limpiarDatos(true);toast('Datos de ejemplo cargados')}
function limpiarDatos(conEjemplos){if(NUBE.on)nubeBorrarTodo().catch(errNube);const propios=(PLAT&&PLAT.superadmins||[]).filter(x=>x.id!=='sa1');
  try{Object.keys(localStorage).filter(k=>k.startsWith(KEY)).forEach(k=>localStorage.removeItem(k))}catch(e){}
  if(conEjemplos){PLAT=seedPlat();PLAT.demo=true;PLAT.superadmins=PLAT.superadmins.concat(propios)}else PLAT={version:1,ultima:null,superadmins:propios,residenciales:[],solicitudes:[],demo:false};
  savePlat();RES=null;DB=null;if(PLAT.residenciales.length)load();if(NUBE.on)subirTodo().catch(errNube);S.imp=null;S.user=null;S.tab='inicio';S.sub=null;setSes('');closeSheet();render()}
function borrarRegistros(){const propios=PLAT.superadmins.filter(x=>x.id!=='sa1');
  sheet('Borrar todos los registros',`<div class="alert bad"><b>Se borra todo lo de este dispositivo</b><p>Residenciales, casas, usuarios, pagos, accesos, avisos y reclamos, incluidos los de ejemplo. No se puede deshacer.</p></div>
  <p class="sm">${propios.length?`Se conserva tu usuario de Administrador de la APP (<b>${propios.map(x=>esc(x.user)).join(', ')}</b>) para que entres y registres tu primera residencial real.`:`Después crea tu usuario con <b>“Crear usuario de Administrador de la APP”</b> y registra tu primera residencial real.`}</p>
  <label class="f">Escribe BORRAR para confirmar<input id="borrarConf" autocomplete="off" autocapitalize="characters" oninput="document.getElementById('borrarBtn').disabled=this.value.trim().toUpperCase()!=='BORRAR'"></label>
  <button id="borrarBtn" class="btn bad block" disabled onclick="limpiarDatos(false);toast('Registros borrados. Ya puedes empezar con datos reales.')">Borrar todo y empezar en blanco</button><button class="btn ghost block" onclick="closeSheet()">Cancelar</button>`)}
function autoRecordatorio(u){if(u.rol!=='residente')return;const per=periodoActual(),k=u.casaId+'_'+per;if(DB.recordados[k])return;
  const m=moraCasa(u.casaId);const pend=pendCasa(u.casaId);
  if(m.length){notificar([u.id],'💳 Tienes pagos vencidos',`${m.length} mes(es) en mora: ${m.map(c=>perL(c.periodo)).join(', ')}. Total ${money(sum(m,montoCuota))}.`,{tipo:'pagar',periodos:m.map(c=>c.periodo)});DB.recordados[k]=1}
  else if(pend.length){const dias=Math.round((new Date(vence(per)+'T12:00')-new Date(ymd()+'T12:00'))/864e5);if(dias<=DB.config.diasAviso){notificar([u.id],'⏰ Tu cuota vence pronto',`La cuota de ${perL(per)} vence el ${fFecha(vence(per))}.`,{tipo:'pagar',periodos:[per]});DB.recordados[k]=1}}}

/* ---------------- Login y registro ---------------- */
function vLogin(){const plat=S.modoPlat||!PLAT.residenciales.length;return `<div class="login"><div class="row" style="align-items:flex-start">${(()=>{const m=marcaActual();return m&&m.logo?logoImg(m.logo,64,'18px','margin-bottom:12px;border:1px solid var(--line)'):`<div class="logo">${ic('gatewise',36)}</div>`})()}<span class="grow"></span>${langBtn()}</div><h1 style="margin:0 0 2px">GateWise</h1><p class="muted" style="margin:0 0 18px">Administración de residenciales</p>
<form onsubmit="login(event)" class="card"><div class="f">Entrar a<div class="combo"><input id="resq" autocomplete="off" placeholder="Escribe las primeras letras de la residencial" value="${esc(plat?'Administrador de la APP':(PLAT.residenciales.find(r=>r.id===RES)||{}).nombre||'')}" onfocus="this.select();filtraRes('')" oninput="filtraRes(this.value)" onkeydown="teclaRes(event)" onblur="setTimeout(()=>{const b=document.getElementById('resList');if(b)b.hidden=true;this.value=${plat?"'Administrador de la APP'":"(PLAT.residenciales.find(r=>r.id===RES)||{}).nombre||''"}},150)"><div id="resList" class="combo-list" hidden></div></div></div><label class="f">${plat?'Correo del Administrador de la APP':'Usuario'}<input name="user" ${plat?'type="email" autocomplete="email"':'autocomplete="username"'} autocapitalize="none" required></label><label class="f">Clave<input name="pass" type="password" autocomplete="current-password" required></label><button class="btn block">Ingresar</button><p class="note" style="margin:10px 0 0">${plat?'Acceso del Administrador de la APP: crea y administra todas las residenciales.':'Administración, residentes, inquilinos, vigilancia y cobradores de '+esc(DB?DB.residencial.nombre:'')+' entran con su usuario y clave.'}</p></form>
${!plat&&DB?`<button class="btn ghost block" onclick="irRegistro()">Soy propietario · crear mi cuenta</button>`:''}<button class="btn ghost block" onclick="S.tab='solicitarRes';render()">Quiero la app para mi residencial</button>
${cfgNube()?'':PLAT.residenciales.length||PLAT.solicitudes.length?`<button class="btn ghost block" style="color:var(--bad)" onclick="borrarRegistros()">🗑️ Borrar todos los registros</button>`:`<button class="btn ghost block" onclick="resetDemo()">Cargar datos de ejemplo</button>`}<p class="note nubeEstado" style="text-align:center;margin-top:14px;cursor:pointer;text-decoration:underline dotted" onclick="verNube()">${nubeTxt()}</p>${versionHTML()}</div>`}
function nuevoDueno(){return toast('Solo el dueño de la app es Administrador de la APP');sheet('Crear usuario de Administrador de la APP',`<p class="note" style="margin-top:0">El Administrador de la APP da de alta las residenciales, sus perfiles, administradores y planes. Después entras con este usuario en la pantalla de inicio.</p><form onsubmit="crearPlataforma(event)"><label class="f">Tu nombre<input name="nombre" required autocomplete="name"></label><label class="f">Usuario<input name="user" required autocapitalize="none" autocomplete="username" placeholder="Ej. miguel"></label><div class="two"><label class="f">Contraseña<input name="pass" type="password" required minlength="6" autocomplete="new-password"></label><label class="f">Repite la contraseña<input name="pass2" type="password" required minlength="6" autocomplete="new-password"></label></div><button class="btn block">Crear usuario y entrar</button></form>`)}
const RETOS=['Muestra 2 dedos junto a tu cara','Levanta el pulgar y sonríe','Toca tu oreja derecha','Muestra la palma de tu mano abierta','Cierra un ojo y sonríe'];
let SELFIE=null,camStream=null;
function irRegistro(){S.tab='registro';S.reto=null;SELFIE=null;render();window.scrollTo(0,0)}
function vRegistro(){const c12=casa('c12');S.reto=S.reto||RETOS[Math.floor(Math.random()*RETOS.length)];return `<div class="login"><button class="btn ghost smb" style="align-self:flex-start;margin-bottom:12px" onclick="S.tab='inicio';render()">${ic('back',16)} Volver</button><h2>Registro de propietario</h2>
<div class="card sm"><b>¿Cómo se valida que eres el dueño?</b><ol style="margin:8px 0 0;padding-left:18px;color:var(--muted)"><li>Usa el <b>código de verificación</b> único de tu casa, entregado en físico por la administración.</li><li>Adjunta un documento que acredite la propiedad y la foto de tu DUI.</li><li>Tómate una <b>foto en tiempo real</b> siguiendo la instrucción que te damos, para comprobar que eres tú.</li><li>La administración compara todo y aprueba. Hasta entonces la cuenta no tiene acceso.</li></ol></div>
<form onsubmit="enviarRegistro(event)" class="card">
<h3 style="margin-top:0">Tu casa</h3>
<label class="f">Casa<select name="casa" required>${DB.casas.map(c=>`<option value="${c.id}" ${c.id==='c12'?'selected':''}>${casaNom(c.id)} · ${esc(c.pasaje)}${c.duenoId?'':' (sin registrar)'}</option>`).join('')}</select></label>
<label class="f">Código de verificación de la casa<input name="codigo" required autocapitalize="characters" placeholder="Ej. 7KQ2MX"></label>
<p class="note" style="margin-top:-6px">Demo: el código de Casa 12 es <b>${c12?c12.codigo:''}</b>.</p>
<label class="f">Apellidos de la familia<input name="familia" required placeholder="Ej. Hernández López"></label>
<h3>Tus datos</h3>
<label class="f">Nombre completo<input name="nombre" required></label>
<div class="two"><label class="f">DUI<input name="dui" inputmode="numeric" maxlength="10" autocomplete="off" required placeholder="00000000-0"></label><label class="f">Teléfono<input name="tel" required inputmode="tel"></label></div>
<label class="f">Correo<input name="email" type="email" required></label>
<label class="f">Tu foto de perfil<input name="foto" type="file" accept="image/*" required></label>
<h3>Documentos</h3>
<label class="f">Documento de propiedad (foto o PDF)<input name="doc" type="file" accept="image/*,application/pdf" required></label>
<label class="f">Foto del DUI<input name="duif" type="file" accept="image/*" required></label>
<h3>Foto en tiempo real</h3>
<div class="alert info"><b>Instrucción: ${esc(S.reto)}</b><p>Tómate la foto ahora con la cámara frontal. No se aceptan fotos de la galería. La foto queda sellada con fecha y hora.</p></div>
<div id="selfiePrev">${selfiePrev()}</div>
<button type="button" class="btn sec block" onclick="abrirCamara()">${SELFIE?'Repetir foto':'Abrir cámara'}</button>
<input type="file" id="selfieIn" accept="image/*" capture="user" hidden onchange="selfieArchivo(this)">
<h3>Acceso</h3>
<div class="two"><label class="f">Usuario<input name="user" required autocapitalize="none"></label><label class="f">Contraseña<input name="pass" type="password" required minlength="4"></label></div>
<label class="chk" style="border:0"><input type="checkbox" required><span class="sm">Declaro que soy propietario(a) y que la información es verídica.</span></label>
<button class="btn block">Enviar solicitud</button></form></div>`}
const selfiePrev=()=>SELFIE?`<img class="thumb" src="${SELFIE.data}" alt="Foto en tiempo real" style="max-height:260px">`:'';
function pintarSelfie(){const p=document.getElementById('selfiePrev');if(p)p.innerHTML=selfiePrev()}
async function abrirCamara(){
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){try{
    const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720}},audio:false});
    sheet('Foto en tiempo real',`<div class="alert info"><b>${esc(S.reto)}</b></div><video id="camv" autoplay playsinline muted style="width:100%;border-radius:12px;transform:scaleX(-1);background:#000"></video><button class="btn block" onclick="capturarSelfie()">${ic('check',18)} Tomar foto</button>`);
    camStream=st;const v=document.getElementById('camv');v.srcObject=st;try{await v.play()}catch(e){}return}catch(e){camStream=null}}
  document.getElementById('selfieIn').click()}
function sellar(c,metodo){selloVivo(c,'Verificación en vivo · '+fFecha(nowISO()),'Reto: '+S.reto);SELFIE={tipo:'img',nombre:'selfie.jpg',data:c.toDataURL('image/jpeg',.75),fecha:nowISO(),reto:S.reto,metodo};pintarSelfie();const b=document.querySelector('[onclick="abrirCamara()"]');if(b)b.textContent='Repetir foto';toast('Foto en tiempo real lista')}
function capturarSelfie(){const v=document.getElementById('camv');if(!v||!v.videoWidth)return toast('La cámara aún no está lista');const s=Math.min(1,900/v.videoWidth);const c=document.createElement('canvas');c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(v,0,0,c.width,c.height);x.setTransform(1,0,0,1,0,0);closeSheet();sellar(c,'camara')}
function selfieArchivo(inp){const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(!f.type.startsWith('image/'))return toast('Debe ser una foto');
  if(Date.now()-f.lastModified>5*60*1000)return toast('La foto debe tomarse en este momento con la cámara, no desde la galería');
  const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const s=Math.min(1,900/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);sellar(c,'captura')};img.src=r.result};r.readAsDataURL(f)}
async function enviarRegistro(e){e.preventDefault();const f=new FormData(e.target);const c=casa(f.get('casa'));
  if(String(f.get('codigo')).trim().toUpperCase()!==c.codigo)return toast('El código no coincide con la casa seleccionada');
  if(!duiValido(String(f.get('dui')).trim()))return toast('El DUI debe tener 9 dígitos: 00000000-0');
  const un=String(f.get('user')).trim().toLowerCase();if(DB.usuarios.some(u=>u.user.toLowerCase()===un)||DB.solicitudes.some(s=>s.estado==='pendiente'&&s.user.toLowerCase()===un))return toast('Ese usuario ya existe, elige otro');
  if(DB.solicitudes.some(s=>s.estado==='pendiente'&&s.casaId===c.id))return toast('Ya hay una solicitud pendiente para esa casa');
  if(!SELFIE)return toast('Falta la foto en tiempo real');
  let doc,duif,foto;try{doc=await leerArchivo(f.get('doc'));duif=await leerArchivo(f.get('duif'));foto=await leerArchivo(f.get('foto'))}catch(x){return toast('Archivo no válido. Usa foto o PDF')}
  DB.solicitudes.unshift({id:uid(),casaId:c.id,nombre:f.get('nombre'),familia:String(f.get('familia')).trim(),dui:f.get('dui'),tel:f.get('tel'),email:f.get('email'),user:un,pass:f.get('pass'),documento:doc,duiFoto:duif,foto,selfie:SELFIE,estado:'pendiente',fecha:nowISO()});
  notificar(admins(),'Nueva solicitud de registro',`${f.get('nombre')} solicita acceso como propietario(a) de ${casaNom(c.id)}.`,{tab:'solicitudes'});save();SELFIE=null;
  S.tab='inicio';render();sheet('Solicitud enviada',`<p>Tu solicitud para <b>${casaNom(c.id)}</b> quedó en revisión. La administración validará tus documentos y tu foto, y te avisará. Después podrás ingresar con tu usuario <b>${esc(un)}</b>.</p><button class="btn block" onclick="closeSheet()">Entendido</button>`)}

/* ---------------- Notificaciones ---------------- */
function verNotifs(){if(S.user.rol==='superadmin')return go('solicitudesRes');const ns=DB.notifs.filter(n=>n.userId===S.user.id).slice(0,80);
  sheet('Notificaciones',ns.length?ns.map(n=>`<button class="item" onclick="abrirNotif('${n.id}')"><div class="grow"><b>${!n.leida?'<span class="dot"></span>':''}${esc(n.titulo)}</b><div class="sm">${esc(n.texto)}</div><div class="muted sm">${fFecha(n.fecha)}</div></div></button>`).join('')+`<button class="btn ghost block" onclick="leerTodas()">Marcar todas como leídas</button>`:empty('Sin notificaciones'))}
function abrirNotif(id){const n=DB.notifs.find(x=>x.id===id);if(!n)return;n.leida=true;save();closeSheet();const a=n.accion;if(!a)return render();if(a.tipo==='pagar'){S.sel=a.periodos;return go('pagos')}if(a.tipo==='pedido'||a.tipo==='chat'){if(!pedido(a.id))return render();go(S.user.rol==='vendedor'?'pedidos':S.user.rol==='admin'?'tienda':'tienda',S.user.rol==='vendedor'||S.user.rol==='admin'?undefined:'pedidos');return a.tipo==='chat'?abrirChat(a.id):verPedido(a.id)}go(a.tab||'inicio',a.sub)}
function leerTodas(){DB.notifs.forEach(n=>{if(n.userId===S.user.id)n.leida=true});save();closeSheet();render()}
