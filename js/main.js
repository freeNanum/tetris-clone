import { COLS, ROWS, CELL_SIZE } from './constants.js';
import { createGame, STATUS } from './game.js';
import { createRenderer } from './renderer.js';
import { setupInput, setupTouchControls } from './input.js';
import { sfx, unlockAudio } from './audio.js';
import { getHighScore, setHighScore } from './storage.js';

const boardCanvas = document.getElementById('board-canvas');
boardCanvas.width = COLS * CELL_SIZE;
boardCanvas.height = ROWS * CELL_SIZE;
const nextCanvas = document.getElementById('next-canvas');
const holdCanvas = document.getElementById('hold-canvas');

const scoreEl = document.getElementById('score-value');
const levelEl = document.getElementById('level-value');
const linesEl = document.getElementById('lines-value');
const highScoreEl = document.getElementById('highscore-value');

const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('gameover-screen');
const finalScoreEl = document.getElementById('final-score');
const overlays = [startScreen, pauseScreen, gameOverScreen];

const renderer = createRenderer({ boardCanvas, nextCanvas, holdCanvas });

let highScore = getHighScore();
highScoreEl.textContent = highScore;

function showOverlay(target) {
  overlays.forEach((el) => el.classList.add('hidden'));
  if (target) target.classList.remove('hidden');
}

const game = createGame({
  onMove: () => sfx.move(),
  onRotate: () => sfx.rotate(),
  onHardDrop: () => sfx.hardDrop(),
  onLock: () => sfx.lock(),
  onLineClear: (count) => sfx.lineClear(count),
  onLevelUp: () => sfx.levelUp(),
  onHold: () => sfx.hold(),
  onGameOver: (score) => {
    sfx.gameOver();
    if (score > highScore) {
      highScore = score;
      setHighScore(highScore);
      highScoreEl.textContent = highScore;
    }
    finalScoreEl.textContent = score;
    showOverlay(gameOverScreen);
  },
});

setupInput(game, {
  onAnyKey: unlockAudio,
  onPauseToggle: () => {
    game.togglePause();
    const status = game.getState().status;
    if (status === STATUS.PAUSED) showOverlay(pauseScreen);
    else if (status === STATUS.PLAYING) showOverlay(null);
  },
});

setupTouchControls(game, {
  left: document.getElementById('btn-left'),
  right: document.getElementById('btn-right'),
  rotateBtn: document.getElementById('btn-rotate'),
  softDropBtn: document.getElementById('btn-softdrop'),
  hardDropBtn: document.getElementById('btn-harddrop'),
  holdBtn: document.getElementById('btn-hold'),
});

document.getElementById('start-btn').addEventListener('click', () => {
  unlockAudio();
  game.start();
  showOverlay(null);
});

document.getElementById('resume-btn').addEventListener('click', () => {
  game.togglePause();
  showOverlay(null);
});

document.getElementById('restart-btn').addEventListener('click', () => {
  game.restart();
  game.start();
  showOverlay(null);
});

document.getElementById('pause-btn').addEventListener('click', () => {
  unlockAudio();
  game.togglePause();
  const status = game.getState().status;
  if (status === STATUS.PAUSED) showOverlay(pauseScreen);
  else if (status === STATUS.PLAYING) showOverlay(null);
});

function updateHUD(state) {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  linesEl.textContent = state.lines;
}

let lastTime = 0;
function loop(timestamp) {
  const dt = lastTime ? timestamp - lastTime : 0;
  lastTime = timestamp;

  game.update(Math.min(dt, 100));
  const state = game.getState();
  const ghost = state.status === STATUS.PLAYING ? game.getGhost() : [];
  renderer.render(state, ghost);
  updateHUD(state);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
