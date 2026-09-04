/* Keep Couverture prestations inside Charpenterie, but remove Couverture as a standalone trade. */
(() => {
  delete trades.couverture;

  // app.js may already have rendered trade cards before this extension loads.
  document.querySelectorAll('#tradeGrid .trade, #stromTradeGrid .trade').forEach(card => {
    const text = (card.textContent || '').toLowerCase();
    if (card.dataset.tradeKey === 'couverture' || text.includes('couverture')) card.remove();
  });
})();
