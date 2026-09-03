// Synchronisation Ström -> portail entreprise.
// Un bordereau déjà publié reste publié après une nouvelle validation toiture :
// ses métrés recalculés sont immédiatement visibles côté entreprise.
(() => {
  const saveBtn=$('#saveRoofCheck');
  if(saveBtn){
    saveBtn.onclick=()=>{
      roofDraft.validated=true;
      roofDraft.validatedAt=new Date().toISOString();
      const ps=getProjects(),p=ps.find(x=>x.id===currentProject.id);
      if(!p)return;
      p.roofCheck=roofDraft;
      const old=p.trades?.ferblanterie;
      if(old?.rows){
        const wasPublished=old.published===true;
        old.rows=applyAutoFerblanterie(old.rows,p.roofMetrics,roofDraft);
        // Ne pas retirer un bordereau déjà disponible aux entreprises.
        old.published=wasPublished;
        old.updatedAt=new Date().toISOString();
      }
      putProjects(ps);
      currentProject=p;
      openStromProject();
    };
  }

  // Message explicite si le poste existe mais n'a jamais été publié.
  const companyBtn=$('#companyFind');
  if(companyBtn){
    companyBtn.onclick=()=>{
      if(!selected.company||!companyTrade)return;
      const p=getProjects().find(x=>x.key===projectKey(selected.company.label));
      const state=p?.trades?.[companyTrade];
      if(!p){
        $('#companyStatus').textContent='Aucun projet Ström n’est disponible pour cette adresse.';
        return;
      }
      if(!state){
        $('#companyStatus').textContent=`Le projet existe, mais aucun bordereau ${trades[companyTrade].name} n’a encore été préparé.`;
        return;
      }
      if(!state.published){
        const filled=(state.rows||[]).filter(r=>r.qty!==''&&num(r.qty)!==null).length;
        $('#companyStatus').textContent=filled
          ?`Le bordereau ${trades[companyTrade].name} contient ${filled} ligne(s) renseignée(s), mais il est encore en brouillon côté Ström. Il faut cliquer sur « Valider et rendre disponible ».`
          :`Le bordereau ${trades[companyTrade].name} est encore en brouillon et ne contient aucune quantité publiée.`;
        return;
      }
      currentProject=p;
      openCompanyQuote(state);
    };
  }
})();