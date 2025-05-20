
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

const cols = 80;
const rows = 25;
const cellWidth = 10;
const cellHeight = 20;

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



const canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx;
if (canvas !== null) {
  if ((canvas instanceof HTMLCanvasElement)){
    ctx = canvas.getContext("2d");
  }
}

let player = { x: playerStart.x, y: playerStart.y };

function draw() {
  let output = terrain.map((row, y) => {
    const thisRow = [... row];
    return thisRow.map((cell, x) => {
      if (x === player.x && y === player.y) return '@';
      return cell;
    }).join('')
  }).join('\n');
  // todo: combine the code above with the code below, properly; I think we're going in circles
  const charArray2d = output.split('\n').map(line => [...line]);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < mapWidth; y++) {
    for (let x = 0; x < mapHeight; x++) {
      const char = charArray2d[y][x];
      const terrainType = terrainTypes[char];
      if (terrainType) {
        ctx.fillStyle = terrainType.fg;
      } else {
        if (char === '@') {
          ctx.fillStyle = "yellow";
        } 
        else {
          ctx.fillStyle = "red";
        }
      }
      ctx.fillText(char, x * cellWidth, y * cellHeight);
    }
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
  // TODO: revisit this; dx and dy could be anything, and
  // moveEntity wil put them at their destination as long as 
  // that destination square (x + dx, y + dy) is walkable.. meaning any squares in between
  // (x, y) and (x + dx, y + dy) could be completely impassable and we'd teleport right through.
  if (isWalkable(nx, ny)) {
    entity.x = nx;
    entity.y = ny;
  }
}

function playerTurn(dx, dy) {
  moveEntity(player, dx, dy);
  draw();
}

ctx.font = `${cellHeight}px monospace`;
ctx.textBaseline = "top";

document.addEventListener('keydown', (e) => {
  const move: [number, number] = controls[e.key];
  if (move) {
    e.preventDefault();
    playerTurn(...move);
  }
});

draw();
export {};
