import { getDirectionName } from './util.js';
window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const cellWidth = 10;
  const cellHeight = 20;

  const mapData = await import('./map1.json', { with: { type: 'json' } });
  const mapj = mapData.default;
  const terrainTypeData = await import('./terrainTypes.json', { with: { type: 'json' } });
  const terrainTypes = terrainTypeData.default;

  const mapInfo = {
    mapWidth: mapj.terrainRows[0].length,
    mapHeight: mapj.terrainRows.length,
    playerStart: { x: 1, y: 1 },
    terrain: mapj.terrainRows,
    items: mapj.items,
    mobs: mapj.mobs
  };
  const infoPanel = document.getElementById("info1") as HTMLDivElement;

  function appendMessageToInfoPanel(text: string, color?: string) {
    const div = document.createElement("div");
    div.textContent = text;
    if (color) {
      div.style.color = color;
    }
    infoPanel.appendChild(div);
    infoPanel.scrollTop = infoPanel.scrollHeight; // auto-scroll to bottom
  }

  function echoCommand(text: string) {
    const line = document.createElement("div");
    line.textContent = `> ${text}`;
    infoPanel!.appendChild(line);
    infoPanel!.scrollTop = infoPanel!.scrollHeight; // Auto-scroll to bottom
  }

  const { mapWidth, mapHeight, playerStart, terrain, items, mobs } = mapInfo;
  let viewportWidth = 0;
  let viewportHeight = 0;

  let player = { x: playerStart.x, y: playerStart.y };

  const controls = {
    q: [-1, -1], w: [0, -1], e: [1, -1],
    a: [-1, 0],  s: [0, 0],  d: [1, 0],
    z: [-1, 1],  x: [0, 1],  c: [1, 1]
  };

  function resizeCanvasToFit() {
    viewportWidth = Math.floor(canvas.offsetWidth / cellWidth);
    viewportHeight = Math.floor(canvas.offsetHeight / cellHeight);

    canvas.width = viewportWidth * cellWidth;
    canvas.height = viewportHeight * cellHeight;
    ctx.font = `${cellHeight}px monospace`;
    ctx.textBaseline = "top";
    drawMap();
  }

  function isWalkable(x: number, y: number) {
    const terrainType = terrainTypes[terrain[y]?.[x]];
    return terrainType?.isPassable || (player.x == x && player.y == y);
  }

  function moveEntity(entity: { x: number, y: number }, dx: number, dy: number) {
    const nx = entity.x + dx;
    const ny = entity.y + dy;
    if (isWalkable(nx, ny)) {
      entity.x = nx;
      entity.y = ny;
    }
  }
  
  function playerTurn(dx: number, dy: number) {
    const direction = getDirectionName(dx, dy);
    echoCommand(direction);

    moveEntity(player, dx, dy);

    const terrainChar = terrain[player.y][player.x];
    const tType = terrainTypes[terrainChar];
    if (tType) {
      const msg = `You are ${tType.sameSquareInteraction} ${tType.description}.`;
      appendMessageToInfoPanel(msg, tType.fg);
    } else {
      appendMessageToInfoPanel("You are in unknown terrain.", "gray");
    }

    drawMap();
  }

  function drawMap() {
    const halfX = Math.floor(viewportWidth / 2);
    const halfY = Math.floor(viewportHeight / 2);
    const startX = Math.min(Math.max(0, player.x - halfX), mapWidth - viewportWidth);
    const startY = Math.min(Math.max(0, player.y - halfY), mapHeight - viewportHeight);
    const endX = Math.min(mapWidth, startX + viewportWidth);
    const endY = Math.min(mapHeight, startY + viewportHeight);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        let char = terrain[y]?.[x] ?? " ";

        if (x === player.x && y === player.y) char = "@";

        const terrainType = terrainTypes[char];
        ctx.fillStyle = terrainType?.fg || (char === "@" ? "yellow" : "red");
        ctx.fillText(char, (x - startX) * cellWidth, (y - startY) * cellHeight);
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    const move = controls[e.key];
    if (Array.isArray(move) && move.length === 2) {
      e.preventDefault();
      playerTurn(move[0], move[1]);
    }
  });

  // we need this timeout or resize happens incorrectly
  let resizeTimeout: number | undefined;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      requestAnimationFrame(resizeCanvasToFit);
    }, 100);
  });

  resizeCanvasToFit();
});

export {};