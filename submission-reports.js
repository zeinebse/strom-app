/* Réception et rapports consolidés des soumissions entreprise.
   Extension volontairement isolée : aucun calcul de métrés n'est modifié. */
(() => {
  const STORE='strom-company-submissions-v1';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(e){return[]}};
  const write=v=>localStorage.setItem(STORE,JSON.stringify(v));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>new Intl.NumberFormat('fr-CH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)+' CHF';
  const companyKey=c=>(String(c.vat||'').trim()||String(c.email||'').trim()||String(c.name||'').trim()).toLowerCase();

  function currentOffer(){
    if(!currentProject||!companyTrade)return null;
    const rows=[];
    document.querySelectorAll('#companyRows .row').forEach(r=>{
      const priceRaw=r.querySelector('.unit-price')?.value??'';
      if(priceRaw==='')return;
      const qty=Number(r.querySelector('.locked-qty')?.textContent.replace('🔒','').trim())||0;
      const price=Number(priceRaw)||0;
      rows.push({
        label:r.querySelector('.designation')?.textContent.trim()||'',
        qty,
        unit:r.querySelector('.locked-unit')?.textContent.replace('🔒','').trim()||'',
        unitPrice:price,
        total:qty*price
      });
    });
    return {
      projectId:currentProject.id,
      projectKey:currentProject.key,
      projectAddress:currentProject.address,
      company:{
        name:document.querySelector('#companyName')?.value.trim()||'Entreprise non renseignée',
        contact:document.querySelector('#contactName')?.value.trim()||'',
        email:document.querySelector('#email')?.value.trim()||'',
        vat:document.querySelector('#vat')?.value.trim()||''
      },
      tradeKey:companyTrade,
      tradeName:trades[companyTrade]?.name||companyTrade,
      rows,
      notes:document.querySelector('#companyNotes')?.value.trim()||'',
      submittedAt:new Date().toISOString()
    };
  }

  window.stromSubmitCompanyOffer=()=>{
    const offer=currentOffer(); if(!offer)return;
    if(!offer.rows.length){
      document.querySelector('#sendStatus').textContent='Aucun prix n’a été renseigné : aucune soumission n’a été enregistrée.';
      return;
    }
    const all=read(),ck=companyKey(offer.company);
    let dossier=all.find(x=>x.projectId===offer.projectId&&companyKey(x.company)===ck);
    if(!dossier){
      dossier={id:'S'+Date.now(),projectId:offer.projectId,projectKey:offer.projectKey,projectAddress:offer.projectAddress,company:offer.company,trades:{},createdAt:offer.submittedAt};
      all.push(dossier);
    }
    dossier.company=offer.company;
    dossier.projectAddress=offer.projectAddress;
    dossier.trades[offer.tradeKey]={name:offer.tradeName,rows:offer.rows,notes:offer.notes,submittedAt:offer.submittedAt};
    dossier.updatedAt=offer.submittedAt;
    write(all);
    document.querySelector('#sendStatus').textContent='✓ Soumission transmise. Ce poste a été ajouté au dossier consolidé de votre entreprise.';
  };

  function projectDossiers(){
    if(!currentProject)return[];
    return read().filter(x=>x.projectId===currentProject.id||x.projectKey===currentProject.key);
  }
  function dossierTotal(d){return Object.values(d.trades||{}).reduce((s,t)=>s+(t.rows||[]).reduce((a,r)=>a+(Number(r.total)||0),0),0)}
  function tradeTotal(t){return(t.rows||[]).reduce((s,r)=>s+(Number(r.total)||0),0)}

  function renderHub(){
    const box=document.querySelector('#stromSubmissions'),count=document.querySelector('#submissionCount');
    if(!box||!currentProject)return;
    const ds=projectDossiers().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
    count.textContent=ds.length+(ds.length>1?' reçues':' reçue');
    if(!ds.length){box.innerHTML='<div class="empty-state">Aucune soumission reçue pour ce projet.</div>';return}
    box.innerHTML=ds.map(d=>{
      const ts=Object.values(d.trades||{});
      const tags=ts.map(t=>'<span class="submission-tag">✓ '+esc(t.name)+'</span>').join('');
      const date=d.updatedAt?new Date(d.updatedAt).toLocaleDateString('fr-CH'):'';
      return '<article class="submission-card"><div><h3>'+esc(d.company?.name||'Entreprise')+'</h3><div class="submission-meta">'+ts.length+' poste(s) remis · mise à jour '+esc(date)+'</div><div class="submission-tags">'+tags+'</div></div><div class="submission-total"><small>Total HT renseigné</small><strong>'+fmt(dossierTotal(d))+'</strong><div class="submission-actions"><button class="secondary view-submission" data-id="'+esc(d.id)+'">Voir l’offre</button><button class="primary pdf-submission" data-id="'+esc(d.id)+'">PDF</button></div></div></article>'
    }).join('');
    box.querySelectorAll('.view-submission').forEach(b=>b.onclick=()=>openReport(b.dataset.id,false));
    box.querySelectorAll('.pdf-submission').forEach(b=>b.onclick=()=>openReport(b.dataset.id,true));
  }

  function ensureModal(){
    let m=document.querySelector('#submissionReportModal'); if(m)return m;
    m=document.createElement('div');m.id='submissionReportModal';m.className='report-modal';
    m.innerHTML='<div class="report-sheet"><div class="report-toolbar"><strong>Rapport de soumission</strong><div><button id="reportPrint">Imprimer / PDF</button> <button id="reportClose">Fermer</button></div></div><div id="reportPaper" class="report-paper"></div></div>';
    document.body.appendChild(m);
    m.querySelector('#reportClose').onclick=()=>m.classList.remove('open');
    m.querySelector('#reportPrint').onclick=()=>window.print();
    m.onclick=e=>{if(e.target===m)m.classList.remove('open')};
    return m;
  }

  function openReport(id,printNow){
    const d=read().find(x=>x.id===id);if(!d)return;
    const m=ensureModal(),paper=m.querySelector('#reportPaper');
    const tradesHtml=Object.entries(d.trades||{}).map(([key,t],i)=>{
      const rows=(t.rows||[]).map(r=>'<tr><td>'+esc(r.label)+'</td><td>'+esc(r.qty)+'</td><td>'+esc(r.unit)+'</td><td>'+fmt(r.unitPrice)+'</td><td>'+fmt(r.total)+'</td></tr>').join('');
      const notes=t.notes?'<div class="report-notes"><b>Remarques / exclusions · '+esc(t.name)+'</b><br>'+esc(t.notes)+'</div>':'';
      return '<section class="report-section"><div class="report-section-head"><b>'+String(i+1).padStart(2,'0')+' · '+esc(t.name).toUpperCase()+'</b><strong>'+fmt(tradeTotal(t))+'</strong></div><table class="report-table"><thead><tr><th>Désignation</th><th>Qté</th><th>Unité</th><th>Prix unitaire</th><th>Total</th></tr></thead><tbody>'+rows+'</tbody></table>'+notes+'</section>'
    }).join('');
    const last=d.updatedAt?new Date(d.updatedAt).toLocaleDateString('fr-CH'):'';
    paper.innerHTML='<div class="report-brand">STRÖM</div><div class="report-kicker">RAPPORT CONSOLIDÉ DE SOUMISSION</div><h1 class="report-title">'+esc(d.projectAddress)+'</h1><div class="report-address">Offre entreprise · '+esc(last)+'</div><div class="report-info"><div><span>Maître du bordereau</span><strong>Ström SA</strong><small>Crissier · Suisse</small></div><div><span>Entreprise</span><strong>'+esc(d.company?.name||'—')+'</strong><small>'+esc(d.company?.contact||'')+'</small></div><div><span>Contact</span><strong>'+esc(d.company?.email||'—')+'</strong><small>'+esc(d.company?.vat||'')+'</small></div></div>'+tradesHtml+'<div class="report-grand"><span>TOTAL HT</span><strong>'+fmt(dossierTotal(d))+'</strong></div><div class="report-footer"><span>STRÖM · Soumissions professionnelles</span><span>'+esc(d.projectAddress)+'</span></div>';
    m.classList.add('open');
    if(printNow)setTimeout(()=>window.print(),120);
  }

  const originalOpen=window.openStromProject;
  if(typeof originalOpen==='function')window.openStromProject=function(){originalOpen();renderHub()};
  document.addEventListener('click',e=>{if(e.target?.closest?.('.project-item'))setTimeout(renderHub,0)});
})();
