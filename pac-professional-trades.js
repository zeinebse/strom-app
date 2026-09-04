/* PAC template based on Ström Soumission N°1143 + restrained professional trade icon system. */
(() => {
  const icons = {
    ferblanterie: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 13h28v6H21v18h-8V19H9z"/><path d="M21 19h12v5H21"/></svg>',
    charpenterie: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 35V23L24 9l16 14v12"/><path d="M13 35V25l11-10 11 10v10"/><path d="M24 15v20"/></svg>',
    couverture: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 33 14 14h23l4 19z"/><path d="M13 20h25M12 26h27"/><path d="M20 14l-3 19M28 14l-1 19M35 14l2 19"/></svg>',
    echafaudage: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M11 7v34M37 7v34M11 14h26M11 26h26M11 38h26"/><path d="m12 15 24 10M36 15 12 25M12 27l24 10M36 27 12 37"/></svg>',
    solaire: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 15h30l4 22H12z"/><path d="M10 22h29M11 29h30M18 15l-2 22M27 15v22M35 15l3 22"/><path d="M15 41h24"/></svg>',
    pac: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="32" height="32" rx="3"/><circle cx="23" cy="25" r="8"/><path d="M23 17c3 2 4 5 1 8-3 0-5-2-6-5m6 5c-2 3-5 4-8 1 0-3 2-5 5-6m3 5c2-3 5-4 8-1 0 3-2 5-5 6"/><path d="M33 14h2M33 18h2M12 36h24"/></svg>'
  };

  Object.keys(icons).forEach(key => { if (trades[key]) trades[key].icon = icons[key]; });

  trades.pac = {
    icon: icons.pac,
    name: 'Pompe à chaleur',
    sections: [
      ['1. Admin / mise en service / support technique', [
        'Admin · Certification PAC System Module',
        'Régie · Heures de technicien',
        'Coordination technique avec DT',
        'Mise en service du matériel, protocole, test d’étanchéité, réglages de chauffe, test de pression, rapport géologique pour les sondes'
      ]],
      ['2. Chaudière à mazout', [
        'Mise hors service et évacuation de la chaudière mazout',
        'Mise hors service et évacuation de la citerne à mazout'
      ]],
      ['3. PAC et ECA', [
        'Fourniture, installation et raccordement PAC saumure-eau',
        'Fourniture, installation et raccordement chauffe-eau sanitaire',
        'Fourniture, installation et raccordement accumulateur de chauffage',
        'Fourniture, installation et raccordement corps de chauffe électrique',
        'Raccordement partie extérieure des sondes et intérieur avec eau glycolée',
        'Divers petits matériels : vidange, manomètre, thermomètre, robinet, raccords, coudes, etc.'
      ]],
      ['4. Circuit secondaire chauffage', [
        'Raccordement PAC aux départs des radiateurs',
        'Groupe de raccordement · vanne mélangeuse, vannes d’arrêt, clapet antiretour, Isobox, pompe de circulation',
        'Isolation des conduites',
        'Divers petits matériels circuit secondaire'
      ]],
      ['5. Raccordement électrique et télégestion', [
        'Raccordement électrique PAC au tableau électrique',
        'Raccordement à l’application web via Wi-Fi ou gateway via carte SIM'
      ]],
      ['6. Sondes', [
        'Forage des sondes · Duplex 40 mm PN16 · injection bentonite ciment · test débit et pression SIA 384-6',
        'Évacuation des boues de forage',
        'Relevé géologique',
        'Assurance RCMO et Casco des forages géothermiques',
        'Raccordement des sondes',
        'Collecteurs et distributeurs',
        'Remplissage avec propylène glycol 30 %',
        'Test de débit et pression par sonde',
        'Fouille 80 cm de profondeur et 50 cm de large',
        'Carottages et rhabillages dans l’entrée du bâtiment',
        'Isolation des conduites des sondes'
      ]]
    ]
  };

  const previousDefaultUnit = defaultUnit;
  defaultUnit = function(label) {
    const s = String(label || '').toLowerCase();
    if (/forage des sondes|boues de forage|fouille 80|raccordement partie extérieure|isolation des conduites des sondes/.test(s)) return 'm';
    if (/pac saumure|chauffe-eau sanitaire|accumulateur de chauffage|corps de chauffe électrique|chaudière mazout|citerne à mazout/.test(s)) return 'pce';
    if (/admin|régie|coordination|mise en service|petits matériels|raccordement pac aux départs|groupe de raccordement|raccordement électrique|application web|relevé géologique|assurance rcmo|raccordement des sondes|collecteurs et distributeurs|propylène glycol|test de débit/.test(s)) return 'bloc';
    return previousDefaultUnit(label);
  };

  function makeExternalTradeButton(key) {
    const t = trades[key];
    const d = document.createElement('button');
    d.className = 'trade';
    d.dataset.tradeKey = key;
    d.innerHTML = `<div class="icon">${t.icon}</div><b>${t.name}</b><p>Consulter le bordereau préparé par Ström.</p>`;
    d.onclick = () => {
      companyTrade = key;
      selected.company = null;
      document.querySelector('#companyAddress').value = '';
      document.querySelector('#companyFind').disabled = true;
      document.querySelector('#companyStatus').textContent = '';
      show('companySearch');
    };
    return d;
  }

  const externalButtons = [...document.querySelectorAll('#tradeGrid .trade')];
  const originalKeys = ['ferblanterie', 'solaire', 'charpenterie', 'couverture', 'echafaudage'];
  externalButtons.forEach((btn, i) => {
    const key = originalKeys[i];
    if (!key || !trades[key]) return;
    btn.dataset.tradeKey = key;
    const icon = btn.querySelector('.icon');
    if (icon) icon.innerHTML = trades[key].icon;
  });
  if (!document.querySelector('#tradeGrid .trade[data-trade-key="pac"]')) {
    document.querySelector('#tradeGrid').appendChild(makeExternalTradeButton('pac'));
  }
})();