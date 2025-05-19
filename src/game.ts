
let mapData = await import('./map1.json', { with: { type: 'json' } });
const mapj = mapData.default;
const terrainTypeData = await import('./terrainTypes.json', { with: { type: 'json' } });
const terrainTypes = terrainTypeData.default;
const mapInfo = {
    mapWidth: mapj.terrainRows[0].length,
    mapHeight: mapj.terrainRows.length,
    playerStart: {"x": 1, "y": 1},
    terrain: mapj.terrainRows,
    items: mapj.items,
    mobs: mapj.mobs
};
const {mapWidth, mapHeight, playerStart, terrain, items, mobs } = mapInfo;

const controls = {
  q: [-1, -1], // NW
  w: [0, -1],  // N
  e: [1, -1],  // NE
  a: [-1, 0],  // W
  s: [0, 0],   // Wait
  d: [1, 0],   // E
  z: [-1, 1],  // SW
  x: [0, 1],   // S
  c: [1, 1]    // SE
};
  
const gameEl = document.getElementById('game');

let player = { x: playerStart.x, y: playerStart.y };


function draw() {
  const output = terrain.map((row, y) => {
    const thisRow = [... row];
    return thisRow.map((cell, x) => {
      if (x === player.x && y === player.y) return '@';
      const terrainType = terrainTypes[cell];
      return `<span style="color:${terrainType.fg}">${cell}</span>`
    }).join('')
  }).join('\n');
  if (gameEl){
    gameEl.innerHTML = output;
  }
}

function isWalkable(x, y) {
  const currentTerrain = terrain[y]?.[x];
  const terrainType = terrainTypes[currentTerrain];
  return terrainType.isPassable || ( player.x == x && player.y == y);
}

function moveEntity(entity, dx, dy) {
  const nx = entity.x + dx;
  const ny = entity.y + dy;
  if (isWalkable(nx, ny)) {
    entity.x = nx;
    entity.y = ny;
  }
}

function playerTurn(dx, dy) {
  moveEntity(player, dx, dy);
  draw();
}

document.addEventListener('keydown', (e) => {
  const move: [number, number] = controls[e.key];
  if (move) {
    e.preventDefault();
    playerTurn(...move);
  }
});

draw();
export {};
