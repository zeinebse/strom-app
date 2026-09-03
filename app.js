const API='https://api3.geo.admin.ch/rest/services/api';
const ROOF='ch.bfe.solarenergie-eignung-daecher',GWR='ch.bfs.gebaeude_wohnungs_register';

const trades={
  ferblanterie:{
    icon:'🔧',name:'Ferblanterie',desc:'Soumission complète de ferblanterie, revêtements de toiture et charpente.',
    sections:[
      {title:'Travaux préparatoires · Démontage',items:[
        ['Démontage toiture',null,'m²'],['Eternit',null,'m²'],['Structure bois',null,'m²'],['Sous-couverture',null,'m²'],['Ferblanterie',null,'m²'],['Bâchage provisoire',null,'m²']
      ]},
      {title:'Ferblanterie',items:[
        ['Ferblanterie cuivre pour toiture',1,'pce'],['Dépose et repose des chéneaux',null,'m'],['Crochets de chéneaux',null,'pce'],['Raccordement des descentes',null,'pce'],['Tablettes de fonds de toit',null,'m'],['Cheminées',null,'pce'],['Ventilations',null,'pce'],['Entourages des lucarnes',null,'pce'],['Dépose, rehausse cadre et repose 78/98 solaires',null,'pce']
      ]},
      {title:'Revêtements de toitures · Pare-vapeur / isolations',items:[
        ['Pare-vapeur / isolations',null,'m²'],['Toutes découpes',null,'forfait'],['Raccordement du pare-vapeur',null,'forfait']
      ]},
      {title:'Sous-couverture / contre-lattage',items:[
        ['Sous-couverture / contre-lattage',null,'m²'],['Étanchéité de sous-toiture soudée à chaud',null,'m²'],['Raccordements aux éléments traversants',null,'pce'],['Main d’œuvre démontage / évacuation des éléments de toiture',null,'forfait'],['Compléments d’isolation 100 mm type protection extraordinaire (120°C)',null,'m²'],['Sous-couverture type Sarnafil TEX ou similaire',null,'m²']
      ]},
      {title:'Lattage / couverture',items:[
        ['Lattage de soutien bois 27x60',null,'m²'],['Toutes découpes',null,'forfait'],['Bavette 3 plis',null,'m'],['Revêtement larmier',null,'m'],['Revêtement de vire-vent',null,'m'],['Couloir de rives',null,'m'],['Gorge de raccordement entre toiture deux côtés et faîtage ventilé',null,'m'],['Grille de ventilation',null,'m'],['Garniture si nécessaire sous tablette',1,'bloc']
      ]},
      {title:'Charpente',items:[
        ['Pose d’une isolation type Bauder ECO S 125 mm',null,'m²'],['Pose 1er larmier',null,'m'],['Pose d’un calage de ventilation',null,'pce'],['Pose d’une grille de ventilation',null,'m'],['Pose 2ème larmier',null,'m'],['Pose arrêt ventilation',null,'m'],['Pièce de compensation bord de toit',null,'pce'],['Rehausse cadre Velux 78/98, y c. raccords et garniture',null,'pce'],['Pose contre-lattage',null,'m²'],['Vire-vents 1er et 2ème',null,'m'],['Menuiserie autour des lucarnes',1,'bloc'],['Remplacement des éléments de charpente',null,'forfait']
      ]}
    ]
  },
  solaire:{
    icon:'☀️',name:'Installation photovoltaïque',desc:'Soumission complète pour l’installation photovoltaïque.',
    sections:[
      {title:'1. Admin / mise en service / support technique',items:[
        ['Administration, calepinage, simulation du productible, annonce GRD, annonce commune, demande Pronovo',1,'bloc'],['Coordination technique avec DT',1,'bloc'],['Mise en service, IAT, protocoles AC/DC et certification',1,'bloc']
      ]},
      {title:'2. Matériel photovoltaïque',items:[
        ['Panneaux photovoltaïques',null,'pce'],['Onduleur',null,'pce'],['Panneaux factices / raccord au bord de toiture',null,'m²']
      ]},
      {title:'3. Système de montage',items:[
        ['Système de fixation intégré',null,'m²'],['Mise à terre de la structure',1,'bloc'],['Système pare-neige',null,'m']
      ]},
      {title:'4. Câblage, protection DC, chemin de câble',items:[
        ['Dispositif de coupure DC avant onduleur et câblage PV 6 mm²',1,'bloc'],['Protection surtension DC type I & II',1,'bloc'],['Câble solaire souple 6 mm²',null,'m'],['Prises et connecteurs',1,'bloc'],['Protection des câbles DC',1,'bloc'],['Tubes / gaines extérieures pour strings',null,'m'],['Carottages en façade et rhabillage',1,'bloc']
      ]},
      {title:'5. Levage',items:[
        ['Transport et levage du matériel',1,'bloc'],['Évacuation des déchets',1,'bloc'],['Échafaudage, tour d’accès et sécurité en toiture',1,'bloc']
      ]},
      {title:'6. Raccordement AC',items:[
        ['Raccordement de l’onduleur au tableau',1,'bloc'],['Équipotentiels / mise à terre',1,'bloc'],['Création RCP / décompte et consommation interne',1,'bloc'],['Routeur pour monitoring',1,'bloc']
      ]}
    ]
  },
  charpenterie:{icon:'🪵',name:'Charpenterie',desc:'Structure bois, isolation, ventilation et contre-lattage.',sections:[{title:'Charpenterie',items:[['Intervention charpente',null,'forfait']]}]},
  couverture:{icon:'🏠',name:'Couverture',desc:'Dépose, sous-couverture, couverture et finitions.',sections:[{title:'Couverture',items:[['Intervention couverture',null,'forfait']]}]},
  echafaudage:{icon:'🏗️',name:'Échafaudage',desc:'Montage, protections, accès et location.',sections:[{title:'Échafaudage',items:[['Montage / démontage',1,'forfait'],['Surface échafaudée',null,'m²'],['Protections périphériques',null,'m'],['Location',1,'forfait']]}]}
};

let current=null,project=null,rows=[],hits=[],selectedHit=null;const $=s=>document.querySelector(s);const money=n=>new Intl.NumberFormat('fr-CH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)+' CHF';const clean=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();const num=v=>{if(typeof v==='number'&&isFinite(v))return v;if(typeof v==='string'){const n=Number(v.replace(/'/g,'').replace(',','.'));return isFinite(n)?n:null}return null};
function page(n){document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));$('#step'+n).classList.add('active');scrollTo({top:0,behavior:'smooth'})}function attr(a,names){const keys=Object.keys(a||{});for(const n of names){const k=keys.find(k=>k.toLowerCase().replace(/[^a-z0-9]/g,'')===n.toLowerCase().replace(/[^a-z0-9]/g,''));if(k)return a[k]}return null}function norm(X,Y){if(X>1e6&&X<1.4e6&&Y>2.4e6&&Y<2.9e6)return{x:Y,y:X};if(X>50000&&X<350000&&Y>450000&&Y<900000)return{x:Y+2e6,y:X+1e6};return{x:X,y:Y}}
Object.entries(trades).forEach(([k,t])=>{const d=document.createElement('div');d.className='trade';d.innerHTML=`<div class="icon">${t.icon}</div><b>${t.name}</b><p>${t.desc}</p>`;d.onclick=()=>{current=k;selectedHit=null;$('#projectAddress').value='';$('#addressResults').classList.remove('open');$('#analyseBtn').disabled=true;$('#addressTitle').textContent='Où se trouve le projet ?';page(2)};$('#tradeGrid').appendChild(d)});
async function searchAddresses(q){const p=new URLSearchParams({lang:'fr',searchText:q,type:'locations',sr:'2056',limit:'10',origins:'address'}),r=await fetch(`${API}/SearchServer?${p}`);if(!r.ok)throw Error('Recherche d’adresse indisponible');const d=await r.json();return(d.results||[]).map(z=>{const a=z.attrs||{},X=num(a.x),Y=num(a.y);if(X===null||Y===null)return null;const p=norm(X,Y);return{label:clean(a.label),x:p.x,y:p.y,raw:a,links:z.links||[]}}).filter(Boolean)}
function renderHits(){const b=$('#addressResults');b.innerHTML=hits.map((h,i)=>`<div class="address-result" data-i="${i}"><span class="pin">⌖</span><div><strong>${h.label}</strong><small>Adresse officielle suisse</small></div></div>`).join('');b.classList.toggle('open',!!hits.length);b.querySelectorAll('.address-result').forEach(x=>x.onclick=()=>{selectedHit=hits[Number(x.dataset.i)];$('#projectAddress').value=selectedHit.label;b.classList.remove('open');$('#analyseBtn').disabled=false;$('#analyseStatus').textContent=''})}
let timer;$('#projectAddress').oninput=()=>{selectedHit=null;$('#analyseBtn').disabled=true;clearTimeout(timer);const q=$('#projectAddress').value.trim();if(q.length<3){hits=[];renderHits();return}timer=setTimeout(async()=>{try{hits=await searchAddresses(q);renderHits()}catch{hits=[];renderHits()}},220)};document.addEventListener('click',e=>{if(!e.target.closest('.search-shell'))$('#addressResults').classList.remove('open')});
async function identify(layer,x,y,tolerance=20){const p=new URLSearchParams({geometryType:'esriGeometryPoint',returnGeometry:'true',layers:`all:${layer}`,geometry:`${x},${y}`,tolerance:String(tolerance),order:'distance',lang:'fr',sr:'2056',mapExtent:`${x-50},${y-50},${x+50},${y+50}`,imageDisplay:'256,256,96'}),r=await fetch(`${API}/MapServer/identify?${p}`);if(!r.ok)return[];return((await r.json()).results||[]).filter(f=>f.attributes)}
function egidOf(f){const v=attr(f?.attributes||{},['gwr_egid','GWR_EGID','egid','EGID']);return v==null?'':String(v)}function buildingId(f){const v=attr(f?.attributes||{},['building_id','buildingid','BUILDING_ID','sb_uuid','SB_UUID']);return v==null?'':String(v)}
async function findRoofsByBuilding(id){const p=new URLSearchParams({layer:ROOF,searchField:'building_id',searchText:id,contains:'false',returnGeometry:'true'}),r=await fetch(`${API}/MapServer/find?${p}`);if(!r.ok)return[];return((await r.json()).results||[]).filter(f=>f.attributes)}
function unique(roofs){const m=new Map;roofs.forEach(r=>{const bid=buildingId(r),df=String(attr(r.attributes,['df_nummer','DF_NUMMER','dfnummer'])||''),eg=egidOf(r);if(!bid)return;const k=bid+'-'+df+'-'+eg;if(!m.has(k))m.set(k,r)});return[...m.values()]}
async function exactRoofs(hit){let gwr=null;const g=await identify(GWR,hit.x,hit.y,20);if(g.length)gwr=g[0];const expected=gwr?String(attr(gwr.attributes,['egid','EGID','gwr_egid','GWR_EGID'])||''):'';const scan=[];if(gwr){const gx=num(attr(gwr.attributes,['gkode','GKODE','x'])),gy=num(attr(gwr.attributes,['gkodn','GKODN','y']));if(gx!==null&&gy!==null){const p=norm(gx,gy);scan.push(p)}}scan.push({x:hit.x,y:hit.y});for(const p of scan){const near=(await identify(ROOF,p.x,p.y,20)).filter(r=>buildingId(r));if(!near.length)continue;const target=expected||egidOf(near[0]);if(!target)continue;let same=near.filter(r=>egidOf(r)===target);for(const bid of [...new Set(same.map(buildingId).filter(Boolean))])same.push(...(await findRoofsByBuilding(bid)).filter(r=>egidOf(r)===target));same=unique(same.filter(r=>egidOf(r)===target));if(same.length)return{roofs:same,egid:target}}throw Error('Aucune toiture OFEN n’a pu être rattachée avec certitude à ce bâtiment.')}
function avg(vals){const a=vals.filter(v=>v!==null);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null}function summarize(hit,res){const roofs=res.roofs,areas=roofs.map(r=>num(attr(r.attributes,['FLAECHE','flaeche','Flaeche','surface','area','shape_area','SHAPE_Area','roof_area']))),area=areas.some(v=>v!==null)?areas.reduce((s,v)=>s+(v||0),0):null;return{address:hit.label,egid:res.egid,roofCount:roofs.length,roofArea:area===null?null:Math.round(area),avgSlope:avg(roofs.map(r=>num(attr(r.attributes,['NEIGUNG','neigung','slope','tilt'])))),orientation:avg(roofs.map(r=>num(attr(r.attributes,['AUSRICHTUNG','ausrichtung','orientation','azimuth']))))}}
$('#analyseBtn').onclick=async()=>{if(!selectedHit)return;$('#analyseBtn').disabled=true;$('#analyseStatus').textContent='Identification du bâtiment exact…';try{const res=await exactRoofs(selectedHit);project=summarize(selectedHit,res);prepareQuote();$('#analyseStatus').textContent='';page(3)}catch(e){$('#analyseStatus').textContent=e.message||'Analyse impossible.';$('#analyseBtn').disabled=false}};
function prepareQuote(){const t=trades[current];$('#projectTitle').textContent=t.name;$('#tradeDescription').textContent=project.address;$('#formTitle').textContent=`Soumission · ${t.name}`;const fmt=n=>n===null?'Non disponible':Math.round(n*10)/10;const info=[['Adresse',project.address],['EGID',project.egid||'Non disponible'],['Nombre de pans OFEN',project.roofCount],['Surface toiture OFEN',project.roofArea===null?'Non disponible':project.roofArea+' m²'],['Pente moyenne OFEN',project.avgSlope===null?'Non disponible':fmt(project.avgSlope)+'°'],['Orientation moyenne OFEN',project.orientation===null?'Non disponible':fmt(project.orientation)+'°']];$('#technicalInfo').innerHTML=info.map(([a,b])=>`<div class="info"><span>${a}</span><strong>${b}</strong></div>`).join('');rows=[];t.sections.forEach(s=>s.items.forEach(i=>rows.push({section:s.title,label:i[0],qty:i[1],unit:i[2],price:0})));renderRows()}
function renderRows(){const box=$('#quoteRows');box.innerHTML='';let last='';rows.forEach(r=>{if(r.section!==last){const h=document.createElement('div');h.className='section-title';h.textContent=r.section;box.appendChild(h);last=r.section}const d=document.createElement('div');d.className='row';d.innerHTML=`<div class="designation">${r.label}</div><div class="locked-qty">${r.qty===null?'—':r.qty}</div><div class="locked-unit">${r.unit}</div><input type="number" min="0" step="0.01" value="${r.price||''}" placeholder="CHF"><span class="amount">${r.qty===null?'—':money(r.qty*r.price)}</span>`;const inp=d.querySelector('input');inp.oninput=e=>{r.price=Number(e.target.value)||0;d.querySelector('.amount').textContent=r.qty===null?'—':money(r.qty*r.price);renderTotal()};box.appendChild(d)});renderTotal()}
function renderTotal(){$('#grandTotal').textContent=money(rows.reduce((s,r)=>s+(r.qty===null?0:r.qty*r.price),0))}
$('#addRow').onclick=()=>{const label=prompt('Nom de la prestation complémentaire :');if(!label)return;const qtyRaw=prompt('Quantité (laisser vide si inconnue) :','');const qty=qtyRaw===''?null:Number(qtyRaw);rows.push({section:'Prestations complémentaires',label,qty:Number.isFinite(qty)?qty:null,unit:prompt('Unité :','pce')||'pce',price:0});renderRows()};document.querySelectorAll('.back').forEach(b=>b.onclick=()=>page(Number(b.dataset.back)));$('#reviewBtn').onclick=()=>{const total=rows.reduce((s,r)=>s+(r.qty===null?0:r.qty*r.price),0);$('#summary').innerHTML=`<div class="summary-head"><div><span>Adresse</span><strong>${project.address}</strong></div><div><span>Poste</span><strong>${trades[current].name}</strong></div><div><span>Entreprise</span><strong>${$('#companyName').value||'Non renseigné'}</strong></div></div><table><thead><tr><th>Prestation</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.label}</td><td>${r.qty===null?'À calculer par Climacy':r.qty+' '+r.unit}</td><td>${money(r.price)}</td><td>${r.qty===null?'—':money(r.qty*r.price)}</td></tr>`).join('')}</tbody></table><div class="total"><span>Total HT</span><strong>${money(total)}</strong></div>`;page(4)};$('#sendBtn').onclick=()=>{$('#sendStatus').textContent='✓ Soumission prête. Le branchement au système Ström reste à connecter.'};
