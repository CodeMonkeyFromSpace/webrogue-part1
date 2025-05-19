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

  const width = 80;
  const height = 25;
  const map = Array.from({ length: height }, () => Array(width).fill('#'));
  const gameEl = document.getElementById('game');

  let player = { x: 0, y: 0 };
  let enemy = { x: 0, y: 0 };

  function generateDungeon() {
    const rooms = [];
    const maxRooms = 10;

    function createRoom() {
      const w = Math.floor(Math.random() * 10) + 5;
      const h = Math.floor(Math.random() * 6) + 4;
      const x = Math.floor(Math.random() * (width - w - 1)) + 1;
      const y = Math.floor(Math.random() * (height - h - 1)) + 1;
      return { x, y, w, h };
    }

    function carveRoom(room) {
      for (let y = room.y; y < room.y + room.h; y++) {
        for (let x = room.x; x < room.x + room.w; x++) {
          map[y][x] = '.';
        }
      }
    }

    function carveCorridor(x1, y1, x2, y2) {
      if (Math.random() < 0.5) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) map[y1][x] = '.';
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) map[y][x2] = '.';
      } else {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) map[y][x1] = '.';
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) map[y2][x] = '.';
      }
    }

    for (let i = 0; i < maxRooms; i++) {
      const room = createRoom();
      carveRoom(room);

      if (rooms.length > 0) {
        const prev = rooms[rooms.length - 1];
        carveCorridor(
          Math.floor(prev.x + prev.w / 2),
          Math.floor(prev.y + prev.h / 2),
          Math.floor(room.x + room.w / 2),
          Math.floor(room.y + room.h / 2)
        );
      } else {
        player.x = Math.floor(room.x + room.w / 2);
        player.y = Math.floor(room.y + room.h / 2);
      }

      rooms.push(room);
    }

    const last = rooms[rooms.length - 1];
    enemy.x = Math.floor(last.x + last.w / 2);
    enemy.y = Math.floor(last.y + last.h / 2);
  }

  function draw() {
    const output = map.map((row, y) =>
      row.map((cell, x) => {
        if (x === player.x && y === player.y) return '@';
        if (x === enemy.x && y === enemy.y) return 'E';
        return cell;
      }).join('')
    ).join('\n');
    gameEl.textContent = output;
  }

  function isWalkable(x, y) {
    return map[y]?.[x] === '.' || (x === player.x && y === player.y);
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
    enemyTurn();
    draw();
  }

  function enemyTurn() {
    const dx = Math.sign(player.x - enemy.x);
    const dy = Math.sign(player.y - enemy.y);
    moveEntity(enemy, dx, dy); // Move diagonally if needed
  }

  document.addEventListener('keydown', (e) => {
    const move = controls[e.key];
    if (move) {
      e.preventDefault();
      playerTurn(...move);
    }
  });

  generateDungeon();
  draw();