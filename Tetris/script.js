const canvas = document.getElementById('tetris-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverScreen = document.getElementById('game-over-screen');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// Tetromino colors based on vibrant palette
const COLORS = [
    null,
    '#38bdf8', // I - Cyan
    '#3b82f6', // J - Blue
    '#f97316', // L - Orange
    '#eab308', // O - Yellow
    '#22c55e', // S - Green
    '#a855f7', // T - Purple
    '#ef4444'  // Z - Red
];

// Tetromino shapes
const PIECES = [
    [],
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
    [[2,0,0], [2,2,2], [0,0,0]], // J
    [[0,0,3], [3,3,3], [0,0,0]], // L
    [[4,4], [4,4]], // O
    [[0,5,5], [5,5,0], [0,0,0]], // S
    [[0,6,0], [6,6,6], [0,0,0]], // T
    [[7,7,0], [0,7,7], [0,0,0]]  // Z
];

let board = [];
let piece = null;
let nextPieceId = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isStarted = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece() {
    return {
        matrix: PIECES[nextPieceId],
        pos: {x: 3, y: 0}
    };
}

function drawBlock(context, x, y, colorIndex) {
    context.fillStyle = COLORS[colorIndex];
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Borders for blocks
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Add shine effect (top and left edges lighter)
    context.fillStyle = 'rgba(255,255,255,0.3)';
    context.beginPath();
    context.moveTo(x * BLOCK_SIZE, y * BLOCK_SIZE);
    context.lineTo(x * BLOCK_SIZE + BLOCK_SIZE, y * BLOCK_SIZE);
    context.lineTo(x * BLOCK_SIZE + BLOCK_SIZE - 4, y * BLOCK_SIZE + 4);
    context.lineTo(x * BLOCK_SIZE + 4, y * BLOCK_SIZE + 4);
    context.lineTo(x * BLOCK_SIZE + 4, y * BLOCK_SIZE + BLOCK_SIZE - 4);
    context.lineTo(x * BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE);
    context.fill();

    // Darker bottom and right edges
    context.fillStyle = 'rgba(0,0,0,0.3)';
    context.beginPath();
    context.moveTo(x * BLOCK_SIZE + BLOCK_SIZE, y * BLOCK_SIZE);
    context.lineTo(x * BLOCK_SIZE + BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE);
    context.lineTo(x * BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE);
    context.lineTo(x * BLOCK_SIZE + 4, y * BLOCK_SIZE + BLOCK_SIZE - 4);
    context.lineTo(x * BLOCK_SIZE + BLOCK_SIZE - 4, y * BLOCK_SIZE + BLOCK_SIZE - 4);
    context.lineTo(x * BLOCK_SIZE + BLOCK_SIZE - 4, y * BLOCK_SIZE + 4);
    context.fill();
}

function drawMatrix(matrix, offset, context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(context, x + offset.x, y + offset.y, value);
            }
        });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMatrix(board, {x: 0, y: 0}, ctx);
    
    // Draw ghost piece
    if (piece) {
        let ghostPos = {x: piece.pos.x, y: piece.pos.y};
        while (!collide(board, {matrix: piece.matrix, pos: ghostPos})) {
            ghostPos.y++;
        }
        ghostPos.y--;
        
        ctx.globalAlpha = 0.2;
        drawMatrix(piece.matrix, ghostPos, ctx);
        ctx.globalAlpha = 1;
    }
    
    if (piece) drawMatrix(piece.matrix, piece.pos, ctx);
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const matrix = PIECES[nextPieceId];
    
    // Dynamic centering based on piece dimensions
    let width = matrix[0].length;
    let height = matrix.length;
    // O piece is 2x2, others are 3x3 or 4x4
    const offsetX = (4 - width) / 2;
    const offsetY = (4 - height) / 2;
    
    drawMatrix(matrix, {x: offsetX, y: offsetY}, nextCtx);
}

function merge(board, piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + piece.pos.y][x + piece.pos.x] = value;
            }
        });
    });
}

function collide(board, piece) {
    const m = piece.matrix;
    const o = piece.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] === undefined || board[y + o.y][x + o.x] === undefined || board[y + o.y][x + o.x] !== 0)) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    if (!piece) return;
    piece.pos.y++;
    if (collide(board, piece)) {
        piece.pos.y--;
        merge(board, piece);
        resetPiece();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    if (!piece || gameOver) return;
    while (!collide(board, piece)) {
        piece.pos.y++;
    }
    piece.pos.y--;
    merge(board, piece);
    resetPiece();
    arenaSweep();
    dropCounter = 0;
}

function playerMove(offset) {
    piece.pos.x += offset;
    if (collide(board, piece)) {
        piece.pos.x -= offset;
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = piece.pos.x;
    let offset = 1;
    rotate(piece.matrix, dir);
    while (collide(board, piece)) {
        piece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > piece.matrix[0].length) {
            rotate(piece.matrix, -dir);
            piece.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++; // Check the same row again since it has been replaced

        score += rowCount * 100 * level;
        rowCount *= 2;
        lines++;
    }

    if (rowCount > 1) { // Means at least 1 line was cleared
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        updateScore();
    }
}

function updateScore() {
    scoreElement.innerText = score;
    levelElement.innerText = level;
    linesElement.innerText = lines;
}

function resetPiece() {
    if (nextPieceId === null) {
        nextPieceId = Math.floor(Math.random() * 7) + 1;
    }
    piece = createPiece();
    piece.pos.y = 0;
    
    // Dynamic centering for spawn
    if (piece.matrix[0].length === 4) { // I piece
        piece.pos.x = 3;
    } else if (piece.matrix.length === 2) { // O piece
        piece.pos.x = 4;
    } else { // Others 3x3
        piece.pos.x = 3;
    }
    
    nextPieceId = Math.floor(Math.random() * 7) + 1;
    drawNext();

    if (collide(board, piece)) {
        gameOver = true;
        isStarted = false;
        gameOverScreen.classList.remove('hidden');
    }
}

function update(time = 0) {
    if (!isStarted || gameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function startGame() {
    board = createMatrix(COLS, ROWS);
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    gameOver = false;
    isStarted = true;
    nextPieceId = null;
    
    updateScore();
    gameOverScreen.classList.add('hidden');
    
    resetPiece();
    lastTime = performance.now();
    update(lastTime);
    startBtn.innerText = "RESTART";
}

document.addEventListener('keydown', event => {
    if (!isStarted || gameOver) {
        // Prevent default space action if game is over to not click restart repeatedly if focused
        if (event.keyCode === 32) event.preventDefault();
        return;
    }

    if (event.keyCode === 37) { // Left arrow
        event.preventDefault();
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right arrow
        event.preventDefault();
        playerMove(1);
    } else if (event.keyCode === 40) { // Down arrow
        event.preventDefault();
        playerDrop();
    } else if (event.keyCode === 38) { // Up arrow
        event.preventDefault();
        playerRotate(1);
    } else if (event.keyCode === 32) { // Space
        event.preventDefault();
        playerHardDrop();
    }
});

startBtn.addEventListener('click', () => {
    startGame();
    startBtn.blur(); // Remove focus so spacebar doesn't trigger it again
});

restartBtn.addEventListener('click', () => {
    startGame();
    restartBtn.blur();
});

// Initial unstarted state
board = createMatrix(COLS, ROWS);
draw();
