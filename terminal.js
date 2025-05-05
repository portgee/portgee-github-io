const terminal = document.getElementById('terminal');
const output = document.getElementById('output');
const inputLine = document.getElementById('inputLine');

let sessionStart = Date.now();
let gameActive = false;
let currentGame = null;
let effectActive = false;
let snakeInterval = null;
let snake = { body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 }, food: { x: 10, y: 10 }, width: 20, height: 10 };
let todoList = [];
let notesList = [];
let secretUnlocked = false;

const commands = {};
const games = {};
const effects = {};
const apps = {};

function print(text) {
  const line = document.createElement('div');
  line.textContent = text;
  output.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

inputLine.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    const command = inputLine.value.trim();
    if (command !== '') {
      if (!gameActive && !effectActive) {
        print('> ' + command);
        handleCommand(command);
      } else if (currentGame) {
        currentGame(command);
      }
      inputLine.value = '';
    }
  }
  if (gameActive && snakeInterval && ['w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
    handleSnakeInput(event.key.toLowerCase());
  }
});

function handleCommand(input) {
  const args = input.split(' ');
  const cmd = args[0].toLowerCase();
  const params = args.slice(1).join(' ');

  if (commands[cmd]) {
    commands[cmd](params);
  } else if (games[cmd]) {
    games[cmd](params);
  } else if (effects[cmd]) {
    effects[cmd](params);
  } else if (apps[cmd]) {
    apps[cmd](params);
  } else {
    print('Unknown command: ' + input);
  }
}

function fx(effect) {
  if (effectActive) return;
  effectActive = true;
  if (effect === 'earthquake') {
    document.body.style.animation = 'shake 0.5s infinite alternate';
    setTimeout(() => {
      document.body.style.animation = '';
      effectActive = false;
    }, 3000);
  } else if (effect === 'shatter') {
    document.body.style.transform = 'rotate(10deg)';
    setTimeout(() => {
      document.body.style.transform = '';
      effectActive = false;
    }, 3000);
  }
}

function renderSnake() {
  output.innerHTML = '';
  for (let y = 0; y < snake.height; y++) {
    let row = '';
    for (let x = 0; x < snake.width; x++) {
      if (snake.body.some(p => p.x === x && p.y === y)) {
        row += 'O';
      } else if (snake.food.x === x && snake.food.y === y) {
        row += '*';
      } else {
        row += '.';
      }
    }
    print(row);
  }
}

function moveSnake() {
  const newHead = { x: snake.body[0].x + snake.direction.x, y: snake.body[0].y + snake.direction.y };
  if (newHead.x < 0 || newHead.y < 0 || newHead.x >= snake.width || newHead.y >= snake.height || snake.body.some(p => p.x === newHead.x && p.y === newHead.y)) {
    clearInterval(snakeInterval);
    gameActive = false;
    print('Game Over.');
    return;
  }
  snake.body.unshift(newHead);
  if (newHead.x === snake.food.x && newHead.y === snake.food.y) {
    snake.food = { x: Math.floor(Math.random() * snake.width), y: Math.floor(Math.random() * snake.height) };
  } else {
    snake.body.pop();
  }
  renderSnake();
}

function handleSnakeInput(key) {
  if (key === 'w' && snake.direction.y !== 1) snake.direction = { x: 0, y: -1 };
  if (key === 's' && snake.direction.y !== -1) snake.direction = { x: 0, y: 1 };
  if (key === 'a' && snake.direction.x !== 1) snake.direction = { x: -1, y: 0 };
  if (key === 'd' && snake.direction.x !== -1) snake.direction = { x: 1, y: 0 };
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translate(2px, 2px) rotate(0deg); }
  25% { transform: translate(-2px, -2px) rotate(2deg); }
  50% { transform: translate(2px, -2px) rotate(-2deg); }
  75% { transform: translate(-2px, 2px) rotate(2deg); }
  100% { transform: translate(2px, 2px) rotate(-2deg); }
}
`;
document.head.appendChild(style);

commands['help'] = () => {
  print('Commands: ' + Object.keys(commands).concat(Object.keys(games), Object.keys(effects), Object.keys(apps)).join(', '));
};

commands['cmds'] = () => {
    print('Commands: ' + Object.keys(commands).concat(Object.keys(games), Object.keys(effects), Object.keys(apps)).join(', '));
  };

commands['clear'] = () => {
  output.innerHTML = '';
};

commands['hello'] = () => {
  print('Hello, user.');
};

commands['date'] = () => {
  print(new Date().toString());
};

commands['about'] = () => {
  print('Ultimate Terminal 4.0 - Modular!');
};

commands['list-commands'] = () => {
  print('Available Commands:');
  Object.keys(commands).forEach(c => print('- ' + c));
  Object.keys(games).forEach(c => print('- ' + c));
  Object.keys(effects).forEach(c => print('- ' + c));
  Object.keys(apps).forEach(c => print('- ' + c));
};

commands['joke'] = () => {
  const jokes = ["Why don't scientists trust atoms? Because they make up everything!", "I'm afraid for the calendar. Its days are numbered."];
  print(jokes[Math.floor(Math.random() * jokes.length)]);
};

commands['uptime'] = () => {
  const uptime = Math.floor((Date.now() - sessionStart) / 1000);
  print('Uptime: ' + uptime + ' seconds');
};

commands['random'] = () => {
  print('Random number: ' + Math.floor(Math.random() * 100 + 1));
};

games['snake'] = () => {
  gameActive = true;
  snake = { body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 }, food: { x: 10, y: 5 }, width: 20, height: 10 };
  renderSnake();
  snakeInterval = setInterval(moveSnake, 300);
};

effects['earthquake'] = () => {
  fx('earthquake');
};

effects['shatter'] = () => {
  fx('shatter');
};

apps['todo-add'] = (params) => {
  todoList.push(params);
  print('Added to To-Do: ' + params);
};

apps['todo-list'] = () => {
  if (todoList.length === 0) {
    print('To-Do List is empty.');
  } else {
    todoList.forEach((item, index) => print((index + 1) + '. ' + item));
  }
};

apps['todo-remove'] = (params) => {
  const index = parseInt(params) - 1;
  if (index >= 0 && index < todoList.length) {
    todoList.splice(index, 1);
    print('Removed item ' + (index + 1));
  } else {
    print('Invalid index.');
  }
};

apps['todo-clear'] = () => {
  todoList = [];
  print('To-Do list cleared.');
};

apps['notes-add'] = (params) => {
  notesList.push(params);
  print('Note added.');
};

apps['notes-list'] = () => {
  if (notesList.length === 0) {
    print('Notes are empty.');
  } else {
    notesList.forEach((note, index) => print((index + 1) + '. ' + note));
  }
};

apps['notes-clear'] = () => {
  notesList = [];
  print('Notes cleared.');
};

apps['weather'] = async () => {
    if (!navigator.geolocation) {
      print('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiKey = 'ea99730cc0ea4be3b5031836250505';
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        print(`Weather in ${data.location.name}: ${data.current.condition.text}, ${data.current.temp_c}°C`);
      } catch {
        print('Failed to fetch weather.');
      }
    });
};

apps['stopwatch'] = () => {
    const start = Date.now();
    print('Stopwatch started.');
    setTimeout(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      print('Stopwatch: ' + elapsed + ' seconds elapsed.');
    }, 5000);
};

apps['timer'] = (params) => {
    const seconds = parseInt(params) || 5;
    print('Timer started for ' + seconds + ' seconds.');
    setTimeout(() => {
      print('Timer finished!');
    }, seconds * 1000);
};

apps['countdown'] = (params) => {
    let seconds = parseInt(params) || 5;
    if (isNaN(seconds)) {
      print('Invalid number.');
      return;
    }
    const countdownInterval = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        print('Countdown complete!');
      } else {
        print('Countdown: ' + seconds + '...');
        seconds--;
      }
    }, 1000);
  };

  apps['reminder'] = (params) => {
    const parts = params.split(' ');
    const seconds = parseInt(parts.shift());
    const message = parts.join(' ') || 'Reminder!';
    if (isNaN(seconds)) {
      print('Invalid time for reminder.');
      return;
    }
    print('Reminder set for ' + seconds + ' seconds.');
    setTimeout(() => {
      print('⏰ Reminder: ' + message);
    }, seconds * 1000);
  };
  
  games['tetris'] = () => {
    const width = 10;
    const height = 20;
    const shapes = {
      I: [[1, 1, 1, 1]],
      O: [[1, 1], [1, 1]],
      T: [[0, 1, 0], [1, 1, 1]],
      S: [[0, 1, 1], [1, 1, 0]],
      Z: [[1, 1, 0], [0, 1, 1]],
      J: [[1, 0, 0], [1, 1, 1]],
      L: [[0, 0, 1], [1, 1, 1]]
    };
    let grid = Array.from({ length: height }, () => Array(width).fill(0));
    let piece = createPiece();
    let interval;
    let score = 0;
  
    function createPiece() {
      const keys = Object.keys(shapes);
      const shape = shapes[keys[Math.floor(Math.random() * keys.length)]];
      return { shape, x: Math.floor(width / 2) - 1, y: 0 };
    }
  
    function rotate(shape) {
      return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    }
  
    function isValid(offsetX = 0, offsetY = 0, rotated = false) {
      const shape = rotated ? rotate(piece.shape) : piece.shape;
      return shape.every((row, y) => row.every((cell, x) => {
        if (!cell) return true;
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;
        return newX >= 0 && newX < width && newY < height && (newY < 0 || grid[newY][newX] === 0);
      }));
    }
  
    function place() {
      piece.shape.forEach((row, y) => row.forEach((cell, x) => {
        if (cell && piece.y + y >= 0) grid[piece.y + y][piece.x + x] = 1;
      }));
    }
  
    function clearLines() {
      let linesCleared = 0;
      for (let y = height - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell)) {
          grid.splice(y, 1);
          grid.unshift(Array(width).fill(0));
          y++;
          linesCleared++;
        }
      }
      if (linesCleared > 0) {
        score += linesCleared * 100;
      }
    }
  
    function draw() {
      output.innerHTML = '';
      print('Score: ' + score);
      for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
          if (piece.shape[y - piece.y] && piece.shape[y - piece.y][x - piece.x]) {
            line += '[]';
          } else {
            line += grid[y][x] ? '[]' : ' .';
          }
        }
        print(line);
      }
    }
  
    function drop() {
      if (isValid(0, 1)) {
        piece.y++;
      } else {
        place();
        clearLines();
        piece = createPiece();
        if (!isValid()) {
          clearInterval(interval);
          document.removeEventListener('keydown', moveControl);
          print('Game Over. Final Score: ' + score);
          gameActive = false;
          return;
        }
      }
      draw();
    }
  
    function moveControl(e) {
      if (!gameActive) return;
      const key = e.key.toLowerCase();
      if (key === 'a' && isValid(-1, 0)) piece.x--;
      if (key === 'd' && isValid(1, 0)) piece.x++;
      if (key === 's' && isValid(0, 1)) piece.y++;
      if (key === 'w' && isValid(0, 0, true)) piece.shape = rotate(piece.shape);
      if (key === 'e') {
        clearInterval(interval);
        document.removeEventListener('keydown', moveControl);
        print('Game Over. Final Score: ' + score);
        gameActive = false;
        return;
      }

      draw();
    }
  
    gameActive = true;
    draw();
    interval = setInterval(drop, 500);
    document.addEventListener('keydown', moveControl);
};  

games['pong'] = () => {
    const width = 50;
    const height = 20;
    let ball = { x: 10, y: 5, dx: 1, dy: 1 };
    let paddle = { x: 20, width: 10 };
    let interval;
  
    function draw() {
      output.innerHTML = '';
      for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
          if (y === height - 1 && x >= paddle.x && x < paddle.x + paddle.width) {
            line += '==';
          } else if (Math.round(ball.x) === x && Math.round(ball.y) === y) {
            line += 'o ';
          } else {
            line += '. ';
          }
        }
        print(line);
      }
    }
  
    function move() {
      ball.x += ball.dx;
      ball.y += ball.dy;
  
      if (ball.x <= 0 || ball.x >= width - 1) ball.dx *= -1;
      if (ball.y <= 0) ball.dy *= -1;
  
      if (Math.round(ball.y) === height - 1) {
        if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
          ball.dy = -1;
          const hitPos = (ball.x - paddle.x) / paddle.width; 
          if (hitPos < 0.33) {
            ball.dx = -1; // Left side hit
          } else if (hitPos > 0.66) {
            ball.dx = 1;  // Right side hit
          } else {
            ball.dx = Math.random() < 0.5 ? -1 : 1; // Middle random small curve
          }
        } else {
          clearInterval(interval);
          document.removeEventListener('keydown', pongControl);
          print('Game Over.');
          gameActive = false;
        }
      }
      draw();
    }
  
    function pongControl(e) {
      const key = e.key.toLowerCase();
      if (key === 'a' && paddle.x > 0) paddle.x--;
      if (key === 'd' && paddle.x + paddle.width < width) paddle.x++;
      if (key === 'e') {
        clearInterval(interval);
        document.removeEventListener('keydown', pongControl);
        print('Game Over.');
        gameActive = false;
      }
      draw();
    }
  
    gameActive = true;
    draw();
    interval = setInterval(move, 100);
    document.addEventListener('keydown', pongControl);
};

effects['matrix'] = () => {
    if (effectActive) return;
    effectActive = true;
    terminal.style.background = 'black';
    terminal.style.color = 'lime';
    let matrixInterval = setInterval(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      const line = document.createElement('div');
      line.textContent = randomChar.repeat(Math.floor(Math.random() * 50));
      output.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }, 100);
    setTimeout(() => {
      clearInterval(matrixInterval);
      terminal.style.background = '';
      terminal.style.color = '';
      effectActive = false;
    }, 3000);
};

effects['snow'] = () => {
    if (effectActive) return;
    effectActive = true;
    terminal.style.background = 'black';
    terminal.style.color = 'white';
    let snowInterval = setInterval(() => {
      const snowLine = document.createElement('div');
      snowLine.textContent = ' '.repeat(Math.floor(Math.random() * 40)) + '*';
      output.appendChild(snowLine);
      terminal.scrollTop = terminal.scrollHeight;
    }, 150);
    setTimeout(() => {
      clearInterval(snowInterval);
      terminal.style.background = '';
      terminal.style.color = '';
      effectActive = false;
    }, 4000);
};

effects['pulse'] = () => {
    if (effectActive) return;
    effectActive = true;
    let pulseColors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
    let index = 0;
    let pulseInterval = setInterval(() => {
      terminal.style.color = pulseColors[index % pulseColors.length];
      index++;
    }, 300);
    setTimeout(() => {
      clearInterval(pulseInterval);
      terminal.style.color = '';
      effectActive = false;
    }, 4000);
};

effects['rain'] = () => {
    if (effectActive) return;
    effectActive = true;
    setEvent('rain');
    setTimeout(() => {
      setEvent('none');
      effectActive = false;
    }, 8000);
  };
  
effects['thunderstorm'] = () => {
    if (effectActive) return;
    effectActive = true;
    setEvent('thunderstorm');
    setTimeout(() => {
        setEvent('none');
        effectActive = false;
    }, 10000);
};

effects['cloudy'] = () => {
    if (effectActive) return;
    effectActive = true;
    setEvent('cloudy');
    setTimeout(() => {
        setEvent('none');
        effectActive = false;
    }, 10000);
};

effects['lightningstrike'] = () => {
    if (effectActive) return;
    effectActive = true;
    spawnLightning();
    setTimeout(() => {
      effectActive = false;
    }, 1000);
};

effects['theme'] = () => {
    toggleTheme();
};

effects['toggle-pet'] = () => {
    togglePet();
};

games['minesweeper'] = () => {
    const size = 10;
    const mineCount = 40;
    let grid = [];
    let revealed = [];
    let flagged = [];
    let gameLost = false;
    let safeCellsLeft;
    let firstMove = true;
  
    function createEmptyGrid() {
      grid = Array.from({ length: size }, () => Array(size).fill(0));
      revealed = Array.from({ length: size }, () => Array(size).fill(false));
      flagged = Array.from({ length: size }, () => Array(size).fill(false));
      safeCellsLeft = size * size - mineCount;
    }
  
    function placeMines(firstX, firstY) {
      let placed = 0;
      while (placed < mineCount) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const distance = Math.abs(x - firstX) <= 1 && Math.abs(y - firstY) <= 1;
        if (grid[y][x] !== 'M' && !distance) {
          grid[y][x] = 'M';
          placed++;
        }
      }
  
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (grid[y][x] !== 'M') {
            grid[y][x] = countMines(x, y);
          }
        }
      }
    }
  
    function countMines(x, y) {
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            if (grid[ny][nx] === 'M') count++;
          }
        }
      }
      return count;
    }
  
    function draw() {
      output.innerHTML = '';
      let header = '   ';
      for (let x = 0; x < size; x++) {
        header += (x < 10 ? ' ' + x : x) + ' ';
      }
      print(header);
  
      for (let y = 0; y < size; y++) {
        let line = (y < 10 ? ' ' + y : y) + ' ';
        for (let x = 0; x < size; x++) {
          if (revealed[y][x]) {
            line += grid[y][x] === 0 ? ' . ' : ` ${grid[y][x]} `;
          } else if (flagged[y][x]) {
            line += ' F ';
          } else {
            line += '[ ]';
          }
        }
        print(line);
      }
    }
  
    function floodReveal(x, y) {
      const stack = [{ x, y }];
      while (stack.length > 0) {
        const { x: cx, y: cy } = stack.pop();
        if (cx < 0 || cx >= size || cy < 0 || cy >= size) continue;
        if (revealed[cy][cx] || flagged[cy][cx]) continue;
  
        revealed[cy][cx] = true;
        safeCellsLeft--;
  
        if (grid[cy][cx] === 0) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx !== 0 || dy !== 0) {
                stack.push({ x: cx + dx, y: cy + dy });
              }
            }
          }
        }
      }
    }
  
    function reveal(x, y) {
      if (x < 0 || x >= size || y < 0 || y >= size || revealed[y][x] || flagged[y][x]) return;
  
      if (firstMove) {
        placeMines(x, y);
        firstMove = false;
      }
  
      if (grid[y][x] === 'M') {
        gameLost = true;
        revealed[y][x] = true;
        return;
      }
      if (grid[y][x] === 0) {
        floodReveal(x, y);
      } else {
        revealed[y][x] = true;
        safeCellsLeft--;
      }
    }
  
    function toggleFlag(x, y) {
      if (x < 0 || x >= size || y < 0 || y >= size || revealed[y][x]) return;
      flagged[y][x] = !flagged[y][x];
    }
  
    createEmptyGrid();
    draw();
    gameActive = true;
  
    currentGame = function(input) {
      if (input.toLowerCase() === 'exit') {
        gameActive = false;
        currentGame = null;
        print('Exited Minesweeper.');
        return;
      }
      const parts = input.split(' ').map(p => p.trim());
      if (parts.length === 0) return;
  
      if (parts[0] === 'f' && parts.length === 3) {
        const row = parseInt(parts[1]);
        const col = parseInt(parts[2]);
        if (isNaN(row) || isNaN(col)) {
          print('Invalid flag command. Use: f row col');
          return;
        }
        toggleFlag(col, row);
        draw();
        return;
      }
  
      const [row, col] = parts.map(Number);
      if (isNaN(row) || isNaN(col)) {
        print('Invalid move. Use row column.');
        return;
      }
      if (row < 0 || row >= size || col < 0 || col >= size) {
        print('Invalid coordinates.');
        return;
      }
  
      reveal(col, row);
  
      if (gameLost) {
        draw();
        print('💥 You hit a mine! Game Over.');
        gameActive = false;
        currentGame = null;
        return;
      }
  
      if (safeCellsLeft === 0) {
        draw();
        print('🏆 You cleared the field! Victory!');
        gameActive = false;
        currentGame = null;
        return;
      }
  
      draw();
    };
};

effects['matrixwave'] = () => {
    if (effectActive) return;
    effectActive = true;
    terminal.style.background = 'black';
    terminal.style.color = 'lime';
    let interval = setInterval(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
      const randomLine = Array.from({length: 50}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const wave = randomLine.slice(0, Math.floor(Math.random() * randomLine.length));
      const line = document.createElement('div');
      line.textContent = wave;
      output.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }, 50);
    setTimeout(() => {
      clearInterval(interval);
      terminal.style.background = '';
      terminal.style.color = '';
      effectActive = false;
    }, 5000);
};

effects['shockwave'] = () => {
    if (effectActive) return;
    effectActive = true;
    let count = 0;
    let interval = setInterval(() => {
      terminal.style.border = count % 2 === 0 ? '10px solid white' : 'none';
      count++;
      if (count > 6) {
        clearInterval(interval);
        terminal.style.border = '';
        effectActive = false;
      }
    }, 200);
};

effects['warpzone'] = () => {
    if (effectActive) return;
    effectActive = true;
    terminal.style.transform = 'scale(0.5)';
    setTimeout(() => {
      terminal.style.transform = 'scale(1)';
      effectActive = false;
    }, 3000);
};

effects['blackout'] = () => {
    if (effectActive) return;
    effectActive = true;
    terminal.style.background = 'black';
    terminal.style.color = 'black';
    setTimeout(() => {
      terminal.style.background = '';
      terminal.style.color = '';
      effectActive = false;
    }, 1500);
};

effects['implode'] = () => {
    if (effectActive) return;
    effectActive = true;
    terminal.style.transform = 'scale(0)';
    setTimeout(() => {
      terminal.style.transform = 'scale(1)';
      effectActive = false;
    }, 1500);
};

effects['ghost'] = () => {
    if (effectActive) return;
    effectActive = true;
    output.style.opacity = '0.2';
    setTimeout(() => {
      output.style.opacity = '1';
      effectActive = false;
    }, 2000);
};

games['invaders'] = () => {
    const width = 20;
    const height = 10;
    let aliens = [];
    let player = Math.floor(width / 2);
    let interval;
    let score = 0;
  
    function draw() {
      output.innerHTML = '';
      print('Score: ' + score);
      for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
          if (aliens.some(a => a.x === x && a.y === y)) {
            line += '👾';
          } else if (y === height - 1 && x === player) {
            line += 'A ';
          } else {
            line += '. ';
          }
        }
        print(line);
      }
    }
  
    function moveAliens() {
      for (let a of aliens) a.y++;
      if (aliens.some(a => a.y >= height - 1)) {
        clearInterval(interval);
        document.removeEventListener('keydown', invaderControl);
        print('Game Over. Aliens invaded.');
        gameActive = false;
        return;
      }
    }
  
    function invaderControl(e) {
      if (e.key.toLowerCase() === 'a' && player > 0) player--;
      if (e.key.toLowerCase() === 'd' && player < width - 1) player++;
      if (e.key.toLowerCase() === ' ') {
        const beforeKill = aliens.length;
        aliens = aliens.filter(a => !(a.x === player && a.y <= height));
        const afterKill = aliens.length;
        score += (beforeKill - afterKill) * 10;
      }
      draw();
    }
  
    function spawnAliens() {
      for (let i = 0; i < 5; i++) {
        aliens.push({ x: Math.floor(Math.random() * width), y: 0 });
      }
    }
  
    gameActive = true;
    aliens = [];
    player = Math.floor(width / 2);
    score = 0;
    spawnAliens();
    draw();
    interval = setInterval(() => {
      moveAliens();
      if (aliens.length === 0) {
        spawnAliens();
      }
      draw();
    }, 500);
    document.addEventListener('keydown', invaderControl);
};  
  
games['breakout'] = () => {
    const width = 20;
    const height = 10;
    let paddle = { x: 8, width: 6 };
    let ball = { x: 10, y: 5, dx: 1, dy: -1 };
    let bricks = [];
    let interval;
  
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < width; x++) {
        bricks.push({ x, y });
      }
    }
  
    function draw() {
      output.innerHTML = '';
      for (let y = 0; y < height; y++) {
        let line = '';
        for (let x = 0; x < width; x++) {
          if (bricks.some(b => b.x === x && b.y === y)) {
            line += '▓▓';
          } else if (y === height - 1 && x >= paddle.x && x < paddle.x + paddle.width) {
            line += '==';
          } else if (Math.round(ball.x) === x && Math.round(ball.y) === y) {
            line += 'O ';
          } else {
            line += '. ';
          }
        }
        print(line);
      }
    }
  
    function moveBall() {
      ball.x += ball.dx;
      ball.y += ball.dy;
  
      if (ball.x <= 0 || ball.x >= width - 1) ball.dx *= -1;
      if (ball.y <= 0) ball.dy *= -1;
  
      if (Math.round(ball.y) === height - 1) {
        if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
          ball.dy *= -1;
        } else {
          clearInterval(interval);
          document.removeEventListener('keydown', breakoutControl);
          print('Game Over. Ball missed.');
          gameActive = false;
        }
      }
  
      for (let i = 0; i < bricks.length; i++) {
        if (Math.round(ball.x) === bricks[i].x && Math.round(ball.y) === bricks[i].y) {
          bricks.splice(i, 1);
          ball.dy *= -1;
          break;
        }
      }
  
      if (bricks.length === 0) {
        clearInterval(interval);
        document.removeEventListener('keydown', breakoutControl);
        print('You win!');
        gameActive = false;
      }
    }
  
    function breakoutControl(e) {
      if (e.key.toLowerCase() === 'a' && paddle.x > 0) paddle.x--;
      if (e.key.toLowerCase() === 'd' && paddle.x + paddle.width < width) paddle.x++;
      if (e.key.toLowerCase() ===  'e') {
        clearInterval(interval);
        document.removeEventListener('keydown', breakoutControl);
        print('Exited breakout.');
        gameActive = false;
      }
      draw();
    }
  
    gameActive = true;
    draw();
    interval = setInterval(() => {
      moveBall();
      draw();
    }, 200);
    document.addEventListener('keydown', breakoutControl);
};

let wordList = [];

async function fetchWords() {
  try {
    const response = await fetch('wordle.txt');
    const text = await response.text();
    wordList = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length === 5);
  } catch (e) {
    print('Failed to load word list.');
  }
}

games['wordle'] = () => {
    let targetWord = '';
    let maxGuesses = 6;
    let guesses = 0;
  
    async function startGame() {
      if (wordList.length === 0) {
        await fetchWords();
      }
      targetWord = wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
      print('Wordle started! Guess the 5-letter word.');
      print(`You have ${maxGuesses} attempts.`);
      gameActive = true;
      currentGame = handleGuess;
    }
  
    function handleGuess(input) {
      const guess = input.trim().toLowerCase();
      if (guess.length !== 5) {
        print('Please enter a 5-letter word.');
        return;
      }
      if (!wordList.includes(guess)) {
        print('Word not in list. Try another word.');
        return;
      }
      guesses++;
  
      const feedback = Array(5).fill('');
      const targetArr = targetWord.split('');
      const guessArr = guess.split('');
  
      for (let i = 0; i < 5; i++) {
        if (guessArr[i] === targetArr[i]) {
          feedback[i] = `[${guessArr[i].toUpperCase()}]`;
          targetArr[i] = null;
          guessArr[i] = null;
        }
      }
      for (let i = 0; i < 5; i++) {
        if (guessArr[i] !== null) {
          const idx = targetArr.indexOf(guessArr[i]);
          if (idx !== -1) {
            feedback[i] = `(${guessArr[i]})`;
            targetArr[idx] = null;
          } else {
            feedback[i] = ` ${guess[i]} `;
          }
        }
      }
      print(feedback.join(''));
  
      if (guess === targetWord) {
        print('🎉 Correct! You win!');
        gameActive = false;
        currentGame = null;
      } else if (guesses >= maxGuesses) {
        print(`💀 Out of guesses. The word was: ${targetWord.toUpperCase()}`);
        gameActive = false;
        currentGame = null;
      } else {
        print(`${maxGuesses - guesses} guesses left.`);
      }
    }
  
    startGame();
};
  
games['typingrace'] = () => {
async function startRace() {
    if (wordList.length === 0) {
    await fetchWords();
    }
    const sequence = [];
    for (let i = 0; i < 5; i++) {
    sequence.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }

    print('Type these words quickly:');
    print(sequence.join(' '));

    const start = Date.now();
    gameActive = true;

    currentGame = function(input) {
    if (input.trim() === sequence.join(' ')) {
        const time = ((Date.now() - start) / 1000).toFixed(2);
        print('🏁 Finished! Time: ' + time + ' seconds');
    } else {
        print('Incorrect! Try again.');
    }
    gameActive = false;
    currentGame = null;
    };
}

startRace();
};
  