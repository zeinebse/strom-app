// Extensions du calepinage Ström : duplication et déplacement d'obstacles.
// Chargé après app.js afin de conserver la logique OFEN/SWISSIMAGE existante.
(() => {
  let movingObstacleIndex = null;

  function centroid(points) {
    if (!Array.isArray(points) || !points.length) return null;
    return [
      points.reduce((s, p) => s + p[0], 0) / points.length,
      points.reduce((s, p) => s + p[1], 0) / points.length,
    ];
  }

  function cloneObstacle(index) {
    const source = roofDraft?.obstacles?.[index];
    if (!source || !Array.isArray(source.points) || source.points.length < 3) return;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = 'O' + Date.now() + Math.random().toString(36).slice(2, 6);
    copy.points = source.points.map(p => [p[0], p[1]]);
    copy.area = Math.round(polyArea(copy.points) * 100) / 100;
    roofDraft.obstacles.push(copy);
    movingObstacleIndex = roofDraft.obstacles.length - 1;
    roofMode = 'moveObstacle';
    obstaclePoints = [];
    $('#roofHelp').textContent = `Copie de « ${source.type} » créée. Cliquez sur la photo à l'endroit où vous voulez placer la copie.`;
    renderRoofEditor();
  }

  function startMove(index) {
    const obstacle = roofDraft?.obstacles?.[index];
    if (!obstacle || !Array.isArray(obstacle.points) || obstacle.points.length < 3) return;
    movingObstacleIndex = index;
    roofMode = 'moveObstacle';
    obstaclePoints = [];
    $('#roofHelp').textContent = `Déplacement de « ${obstacle.type} ». Cliquez sur son nouvel emplacement.`;
    renderRoofEditor();
  }

  function moveToWorld(index, target) {
    const obstacle = roofDraft?.obstacles?.[index];
    if (!obstacle || !Array.isArray(obstacle.points) || obstacle.points.length < 3) return;
    const c = centroid(obstacle.points);
    if (!c) return;
    const de = target[0] - c[0];
    const dn = target[1] - c[1];
    obstacle.points = obstacle.points.map(([e, n]) => [e + de, n + dn]);
    obstacle.area = Math.round(polyArea(obstacle.points) * 100) / 100;
  }

  const baseRenderRoofEditor = renderRoofEditor;
  renderRoofEditor = function renderRoofEditorEnhanced() {
    baseRenderRoofEditor();

    const list = $('#obstacleList');
    if (!list || !roofDraft?.obstacles?.length) return;

    list.innerHTML = roofDraft.obstacles.map((o, i) => `
      <div class="obstacle-item obstacle-item-actions">
        <div>
          <strong>${i + 1}. ${o.type}</strong>
          <small>${o.area} m² · 4 points${movingObstacleIndex === i ? ' · à placer' : ''}</small>
        </div>
        <div class="obstacle-actions-mini">
          <button type="button" class="move-obstacle" data-i="${i}" title="Déplacer">↔</button>
          <button type="button" class="duplicate-obstacle" data-i="${i}" title="Dupliquer">⧉</button>
          <button type="button" class="delete-obstacle" data-i="${i}" title="Supprimer">×</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('.duplicate-obstacle').forEach(b => {
      b.onclick = e => { e.stopPropagation(); cloneObstacle(+b.dataset.i); };
    });
    list.querySelectorAll('.move-obstacle').forEach(b => {
      b.onclick = e => { e.stopPropagation(); startMove(+b.dataset.i); };
    });
    list.querySelectorAll('.delete-obstacle').forEach(b => {
      b.onclick = e => {
        e.stopPropagation();
        const i = +b.dataset.i;
        roofDraft.obstacles.splice(i, 1);
        if (movingObstacleIndex === i) movingObstacleIndex = null;
        else if (movingObstacleIndex != null && movingObstacleIndex > i) movingObstacleIndex--;
        renderRoofEditor();
      };
    });
  };

  // Remplace le clic carte : dessin 4 points + placement des copies/déplacements.
  $('#roofSvg').onclick = e => {
    const box = roofOrthoBox();
    if (!box) return;
    const rect = $('#roofSvg').getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 1000;
    const y = (e.clientY - rect.top) / rect.height * 650;
    const world = svgToWorld(box, x, y);

    if (roofMode === 'moveObstacle' && movingObstacleIndex != null) {
      const moved = roofDraft.obstacles[movingObstacleIndex];
      moveToWorld(movingObstacleIndex, world);
      const label = moved?.type || 'Obstacle';
      movingObstacleIndex = null;
      roofMode = 'pan';
      $('#togglePanMode').classList.add('active-tool');
      $('#addObstacleMode').classList.remove('active-tool');
      $('#obstacleEditor').classList.add('hidden');
      $('#roofHelp').textContent = `${label} placé. Vous pouvez le déplacer ou le dupliquer à nouveau depuis la liste.`;
      renderRoofEditor();
      return;
    }

    if (roofMode !== 'obstacle') return;
    obstaclePoints.push(world);
    if (obstaclePoints.length < 4) {
      $('#roofHelp').textContent = `Obstacle : point ${obstaclePoints.length}/4 placé. Cliquez sur le coin suivant.`;
      renderRoofEditor();
      return;
    }

    const points = obstaclePoints.slice(0, 4);
    const area = Math.round(polyArea(points) * 100) / 100;
    roofDraft.obstacles.push({
      id: 'O' + Date.now(),
      type: $('#obstacleType').value,
      points,
      area,
    });
    obstaclePoints = [];
    renderRoofEditor();
    $('#roofHelp').textContent = `Obstacle ajouté (${area} m²). Vous pouvez le dupliquer avec ⧉ ou en dessiner un autre.`;
  };

  // Le dessin se fait désormais par 4 points : les champs largeur/hauteur ne servent plus.
  const dims = document.querySelector('.obstacle-dims');
  if (dims) dims.style.display = 'none';
  const editorText = document.querySelector('#obstacleEditor p');
  if (editorText) editorText.textContent = 'Cliquez sur les 4 coins de l’obstacle directement sur la photo aérienne.';
})();