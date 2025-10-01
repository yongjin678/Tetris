const rows = 20;
const cols = 10;
const container = document.getElementById('game-container');
const nextContainer = document.getElementById('next-container');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-btn');

let grid = [];
let nextPiece = null;
let currentPiece = null;
let currentPos = { x: 3, y: 0 };
let score = 0;
let gameInterval = null;

const pieces = {
  I: { shape: [[1,1,1,1]], color: 'I' },
  O: { shape: [[1,1],[1,1]], color: 'O' },
  T: { shape: [[0,1,0],[1,1,1]], color: 'T' },
  S: { shape: [[0,1,1],[1,1,0]], color: 'S' },
  Z: { shape: [[1,1,0],[0,1,1]], color: 'Z' },
  J: { shape: [[1,0,0],[1,1,1]], color: 'J' },
  L: { shape: [[0,0,1],[1,1,1]], color: 'L' }
};

// 그리드 초기화
function initGrid() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(null));
}

// 랜덤 블록 생성
function randomPiece() {
  const keys = Object.keys(pieces);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return { shape: pieces[type].shape, color: pieces[type].color };
}

// 그리드와 블록 그리기
function drawGrid() {
  container.innerHTML = '';
  for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if(grid[r][c]) cell.classList.add(grid[r][c]);
      container.appendChild(cell);
    }
  }
  if(currentPiece) drawShadow();
  if(currentPiece) drawPiece(currentPiece, currentPos, container, cols);
}

// 블록 그리기
function drawPiece(piece, pos, targetContainer, targetCols) {
  piece.shape.forEach((row, i) => {
    row.forEach((val, j) => {
      if(val){
        const index = (pos.y + i) * targetCols + (pos.x + j);
        if(targetContainer.children[index]) {
          targetContainer.children[index].classList.add(piece.color);
        }
      }
    });
  });
}

// 다음 블록 표시
function drawNext() {
  nextContainer.innerHTML = '';
  for(let r=0; r<4; r++){
    for(let c=0; c<4; c++){
      const cell = document.createElement('div');
      cell.classList.add('cell');
      nextContainer.appendChild(cell);
    }
  }
  if(nextPiece) drawPiece(nextPiece, {x:0, y:0}, nextContainer, 4);
}

// 충돌 체크
function collision(xOffset=0, yOffset=0, shape=currentPiece.shape){
  for(let y=0; y<shape.length; y++){
    for(let x=0; x<shape[y].length; x++){
      if(shape[y][x]){
        const newX = currentPos.x + x + xOffset;
        const newY = currentPos.y + y + yOffset;
        if(newX < 0 || newX >= cols || newY >= rows || (grid[newY] && grid[newY][newX])) return true;
      }
    }
  }
  return false;
}

// 그림자 블록 표시
function drawShadow() {
  let shadowY = currentPos.y;
  while(!collision(0, shadowY - currentPos.y +1)) shadowY++;
  currentPiece.shape.forEach((row, i) => {
    row.forEach((val, j) => {
      if(val){
        const index = (shadowY + i) * cols + (currentPos.x + j);
        if(container.children[index]){
          container.children[index].classList.add('shadow');
        }
      }
    });
  });
}

// 블록 고정
function fixPiece() {
  currentPiece.shape.forEach((row, i) => {
    row.forEach((val, j) => {
      if(val) grid[currentPos.y + i][currentPos.x + j] = currentPiece.color;
    });
  });
  clearLines();
  spawnPiece();
}

// 줄 삭제
function clearLines() {
  let lines = 0;
  grid = grid.filter(row => {
    if(row.every(cell => cell)){
      lines++;
      return false;
    }
    return true;
  });
  while(grid.length < rows){
    grid.unshift(Array(cols).fill(null));
  }
  if(lines){
    score += lines * 10;
    scoreEl.textContent = score;
  }
}

// 블록 회전
function rotate(piece) {
  return piece[0].map((_, i) => piece.map(row => row[i]).reverse());
}

// 블록 한 칸 떨어뜨리기
function drop() {
  if(!collision(0,1)){
    currentPos.y++;
  } else {
    fixPiece();
  }
  drawGrid();
}

// 블록 한 번에 떨어뜨리기 (Space 키)
function hardDrop() {
  let dropY = currentPos.y;
  while(!collision(0, dropY - currentPos.y +1)) dropY++;
  currentPos.y = dropY;
  fixPiece();
}

// 새로운 블록 생성
function spawnPiece() {
  currentPiece = nextPiece;
  currentPos = { x: 3, y: 0 };
  nextPiece = randomPiece();
  drawNext();
  if(collision()) {
    clearInterval(gameInterval);
    alert('게임 오버! 점수: ' + score);
  }
}

// 키보드 이벤트
document.addEventListener('keydown', e => {
  if(!currentPiece) return;
  if(e.key === 'ArrowLeft' && !collision(-1,0)) currentPos.x--;
  if(e.key === 'ArrowRight' && !collision(1,0)) currentPos.x++;
  if(e.key === 'ArrowDown') drop();
  if(e.key === 'ArrowUp') {
    const rotated = rotate(currentPiece.shape);
    if(!collision(0,0,rotated)) currentPiece.shape = rotated;
  }
  if(e.code === 'Space') { // Space 키로 hard drop
    e.preventDefault(); // 스크롤 방지
    hardDrop();
  }
  drawGrid();
});

// 게임 시작 버튼
startBtn.addEventListener('click', () => {
  clearInterval(gameInterval);
  initGrid();
  score = 0;
  scoreEl.textContent = score;
  nextPiece = randomPiece();
  currentPiece = null;
  currentPos = { x: 3, y: 0 };
  spawnPiece();
  drawGrid();
  gameInterval = setInterval(drop, 500);
});
