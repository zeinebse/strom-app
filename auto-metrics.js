// Métrés automatiques sûrs : uniquement des valeurs directement calculables
// depuis OFEN + la validation/calepinage Ström. Aucune affectation métier ambiguë.
(() => {
  const baseApply = applyAutoFerblanterie;

  function counts(check) {
    const out = {Velux:0, Cheminée:0, Lucarne:0, Ventilation:0};
    for (const o of check?.obstacles || []) if (Object.prototype.hasOwnProperty.call(out,o.type)) out[o.type]++;
    return out;
  }
  function perimeter(points) {
    if (!Array.isArray(points) || points.length < 2) return 0;
    let s=0; for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];s+=Math.hypot(b[0]-a[0],b[1]-a[1]);}
    return Math.round(s*100)/100;
  }
  function obstaclePerimeter(check,type){return Math.round((check?.obstacles||[]).filter(o=>!type||o.type===type).reduce((s,o)=>s+perimeter(o.points),0)*100)/100}
  function setAuto(rows,label,qty,unit,source){
    if(qty===null||qty===undefined||!Number.isFinite(Number(qty)))return;
    const r=rows.find(x=>x.label===label); if(!r)return;
    if(r.qty===''||r.auto){r.qty=String(qty);r.unit=unit;r.auto=true;r.autoSource=source;}
  }
  function removeCalcRows(rows){return rows.filter(r=>r.section!=='Métrés calculés automatiquement')}
  function addCalc(rows,label,qty,unit,source){
    if(qty===null||qty===undefined||!Number.isFinite(Number(qty)))return;
    rows.unshift({section:'Métrés calculés automatiquement',label,qty:String(qty),unit,auto:true,autoSource:source,internalMetric:true});
  }

  applyAutoFerblanterie = function(rows,m,check){
    rows=removeCalcRows(rows);
    rows=baseApply(rows,m,check);
    if(!m)return rows;
    const c=counts(check), selected=check?.selectedArea??m.area, obstacles=check?.obstacleArea??0, net=check?.netArea??m.area;

    // Lignes de soumission dont la correspondance est directe.
    setAuto(rows,'Démontage toiture',net,'m²',check?.validated?'Surface nette validée par Ström':'Surface OFEN');
    if(c['Cheminée']>0)setAuto(rows,'Cheminées',c['Cheminée'],'pce','Nombre de cheminées dessinées/validées dans le calepinage');
    if(c['Ventilation']>0)setAuto(rows,'Ventilations',c['Ventilation'],'pce','Nombre de ventilations dessinées/validées dans le calepinage');
    if(c['Lucarne']>0)setAuto(rows,'Entourages des lucarnes',c['Lucarne'],'pce','Nombre de lucarnes dessinées/validées dans le calepinage');

    // Valeurs géométriques réellement disponibles, affichées à l’employé Ström
    // comme références de métrage. Elles ne sont volontairement pas assimilées
    // à larmier/faîtage/rive tant que ces bords n'ont pas été typés.
    const metrics=[];
    metrics.push(['Surface brute toiture OFEN',m.area,'m²','Somme des surfaces des pans OFEN']);
    metrics.push(['Surface des pans retenus',selected,'m²','Pans conservés lors de la vérification Ström']);
    metrics.push(['Surface totale des obstacles',obstacles,'m²','Somme des polygones obstacles dessinés']);
    metrics.push(['Surface nette toiture',net,'m²','Pans retenus moins obstacles']);
    metrics.push(['Linéaire extérieur de toiture',m.exterior,'m','Bords extérieurs calculés sur les polygones OFEN']);
    metrics.push(['Linéaire de jonctions entre pans',m.shared,'m','Segments communs entre pans OFEN']);
    metrics.push(['Linéaire total des bords toiture',m.totalLinear,'m','Bords extérieurs + jonctions entre pans']);
    if(c.Velux)metrics.push(['Nombre de Velux',c.Velux,'pce','Velux dessinés/validés']);
    if(c['Cheminée'])metrics.push(['Nombre de cheminées',c['Cheminée'],'pce','Cheminées dessinées/validées']);
    if(c.Lucarne)metrics.push(['Nombre de lucarnes',c.Lucarne,'pce','Lucarnes dessinées/validées']);
    if(c.Ventilation)metrics.push(['Nombre de ventilations',c.Ventilation,'pce','Ventilations dessinées/validées']);
    if((check?.obstacles||[]).length)metrics.push(['Linéaire total autour des obstacles',obstaclePerimeter(check),'m','Périmètres des obstacles dessinés']);
    if(c.Velux)metrics.push(['Linéaire total autour des Velux',obstaclePerimeter(check,'Velux'),'m','Périmètres des Velux dessinés']);
    if(c['Cheminée'])metrics.push(['Linéaire total autour des cheminées',obstaclePerimeter(check,'Cheminée'),'m','Périmètres des cheminées dessinées']);
    if(c.Lucarne)metrics.push(['Linéaire total autour des lucarnes',obstaclePerimeter(check,'Lucarne'),'m','Périmètres des lucarnes dessinées']);
    if(c.Ventilation)metrics.push(['Linéaire total autour des ventilations',obstaclePerimeter(check,'Ventilation'),'m','Périmètres des ventilations dessinées']);
    for(let i=metrics.length-1;i>=0;i--)addCalc(rows,...metrics[i]);
    return rows;
  };

  // Les lignes de référence internes ne sont jamais envoyées comme prestations
  // à l'entreprise. Seules les vraies lignes du bordereau publiées le sont.
  const baseActiveRows=activeRows;
  activeRows=function(state){return baseActiveRows(state).filter(r=>!r.internalMetric)};
})();