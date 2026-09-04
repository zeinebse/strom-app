/* PAC template based on Ström Soumission N°1143 + professional trade icon system. */
(() => {
  const icons = {
    ferblanterie: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 34V17l15-7 15 7v17"/><path d="M15 34V21l9-4 9 4v13"/><path d="M8 38h32"/><path d="M35 12v10"/></svg>',
    charpenterie: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 36 24 10l17 26"/><path d="M12 29h24"/><path d="M17 21h14"/><path d="M15 36V26m18 10V26"/></svg>',
    couverture: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 29 24 11l18 18"/><path d="M11 29h26"/><path d="M14 29v9h20v-9"/><path d="m17 22 7-7 7 7"/></svg>',
    echafaudage: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 8v32M38 8v32M10 15h28M10 25h28M10 35h28"/><path d="m10 15 28 10M38 15 10 25M10 25l28 10M38 25 10 35"/></svg>',
    solaire: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="34" cy="12" r="5"/><path d="M34 3v3m0 12v3m9-9h-3m-12 0h-3m15.4-6.4-2.1 2.1m-8.6 8.6-2.1 2.1m12.8 0-2.1-2.1M29.7 7.7l-2.1-2.1"/><path d="M7 22h27l5 17H12L7 22Z"/><path d="M10 28h26M12 34h25M17 22l2 17M26 22l1 17"/></svg>',
    pac: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="8" width="30" height="32" rx="4"/><circle cx="24" cy="24" r="8"/><path d="M24 16c3 3 3 5 0 8-3-1-5-3-5-5m5 5c-3 3-5 3-8 0 1-3 3-5 5-5m3 5c3-3 5-3 8 0-1 3-3 5-5 5"/><path d="M15 13h8M33 13h1M15 35h18"/></svg>'
  };

  // Replace emoji-like symbols with restrained line icons.
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

  // Units from the structure of Soumission 1143; quantities remain deliberately blank/project-specific.
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

  // Existing external buttons were created by app.js before this extension loaded: refresh their icons.
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