const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const scoreDisplay = document.getElementById('score');

const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;

const COLORS = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

let board, currentPiece, currentPos, currentPieceIndex, score = 0;
let gameInterval, isPlaying = false;

document.addEventListener('keydown', handleKeyDown);
startButton.addEventListener('click', startGame);

function handleKeyDown(event) {
    if (!isPlaying) return;
    if (event.key === 'ArrowLeft') movePiece(-1, 0);
    else if (event.key === 'ArrowRight') movePiece(1, 0);
    else if (event.key === 'ArrowDown') movePiece(0, 1);
    else if (event.key === 'ArrowUp') rotatePiece();
}

function startGame() {
    isPlaying = true;
    resetGame();
    gameInterval = setInterval(gameLoop, 500);
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0;
    scoreDisplay.textContent = `Pontuação: ${score}`;
    generatePiece();
}

function generatePiece() {
    currentPieceIndex = Math.floor(Math.random() * SHAPES.length);
    currentPiece = SHAPES[currentPieceIndex];
    currentPos = { x: 3, y: 0 };
    if (!isValidMove(currentPos, currentPiece)) {
        clearInterval(gameInterval);
        alert("Game Over");
        isPlaying = false;
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece() {
    ctx.fillStyle = COLORS[currentPieceIndex];
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                ctx.fillRect((currentPos.x + x) * BLOCK_SIZE, (currentPos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect((currentPos.x + x) * BLOCK_SIZE, (currentPos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function movePiece(dx, dy) {
    const newPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    if (isValidMove(newPos, currentPiece)) {
        currentPos = newPos;
    } else if (dy > 0) {
        placePiece();
    }
    drawGame();
}

function rotatePiece() {
    const rotatedPiece = currentPiece[0].map((_, i) => currentPiece.map(row => row[i])).reverse();
    if (isValidMove(currentPos, rotatedPiece)) {
        currentPiece = rotatedPiece;
    }
    drawGame();
}

function isValidMove(position, piece) {
    return piece.every((row, y) => row.every((cell, x) => 
        !cell || 
        (position.y + y < ROWS && 
        position.x + x >= 0 && 
        position.x + x < COLS && 
        !board[position.y + y][position.x + x])
    ));
}

function placePiece() {
    currentPiece.forEach((row, y) => 
        row.forEach((cell, x) => {
            if (cell) board[currentPos.y + y][currentPos.x + x] = COLORS[currentPieceIndex];
        })
    );
    checkLines();
    generatePiece();
}

function checkLines() {
    let linesToRemove = [];
    for (let y = 0; y < ROWS; y++) {
        if (board[y].every(cell => cell)) {
            linesToRemove.push(y);
        }
    }

    if (linesToRemove.length > 0) {
        linesToRemove.forEach(y => board.splice(y, 1));
        while (board.length < ROWS) {
            board.unshift(Array(COLS).fill(null));
        }
        score += linesToRemove.length * 100;
        scoreDisplay.textContent = `Pontuação: ${score}`;
    }
}

function drawGame() {
    drawBoard();
    drawPiece();
}

function gameLoop() {
    movePiece(0, 1);
}
