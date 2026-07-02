import {
  LEVEL_SPEED_MS,
  LINES_PER_LEVEL,
  LOCK_DELAY_MS,
  SOFT_DROP_MULTIPLIER,
  SCORE_TABLE,
} from './constants.js';
import { createBoard, isValidPosition, lockPiece, clearLines } from './board.js';
import { createPiece, getCells, getGhostCells, rotatePiece, createBagGenerator } from './piece.js';

export const STATUS = { IDLE: 'idle', PLAYING: 'playing', PAUSED: 'paused', GAMEOVER: 'gameover' };

export function createGame(callbacks = {}) {
  const cb = {
    onMove: () => {},
    onRotate: () => {},
    onHardDrop: () => {},
    onLock: () => {},
    onLineClear: () => {},
    onGameOver: () => {},
    onHold: () => {},
    onLevelUp: () => {},
    ...callbacks,
  };

  const nextFromBag = createBagGenerator();
  let state;

  function refillQueue(queue) {
    while (queue.length < 3) queue.push(nextFromBag());
  }

  function reset() {
    const queue = [];
    refillQueue(queue);
    const firstType = queue.shift();
    refillQueue(queue);

    state = {
      status: STATUS.IDLE,
      board: createBoard(),
      current: createPiece(firstType),
      queue,
      hold: null,
      canHold: true,
      score: 0,
      lines: 0,
      level: 0,
      dropTimer: 0,
      lockTimer: 0,
      isLocking: false,
      softDropping: false,
    };
  }
  reset();

  function start() {
    if (state.status === STATUS.GAMEOVER) reset();
    state.status = STATUS.PLAYING;
  }

  function pause() {
    if (state.status === STATUS.PLAYING) state.status = STATUS.PAUSED;
  }

  function resume() {
    if (state.status === STATUS.PAUSED) state.status = STATUS.PLAYING;
  }

  function togglePause() {
    if (state.status === STATUS.PLAYING) pause();
    else if (state.status === STATUS.PAUSED) resume();
  }

  function getDropInterval() {
    const idx = Math.min(state.level, LEVEL_SPEED_MS.length - 1);
    return LEVEL_SPEED_MS[idx];
  }

  function canMove(dx, dy) {
    const cells = getCells(state.current).map((c) => ({ x: c.x + dx, y: c.y + dy }));
    return isValidPosition(state.board, cells);
  }

  function moveLeft() {
    if (state.status !== STATUS.PLAYING) return;
    if (canMove(-1, 0)) {
      state.current.x -= 1;
      refreshLockState();
      cb.onMove();
    }
  }

  function moveRight() {
    if (state.status !== STATUS.PLAYING) return;
    if (canMove(1, 0)) {
      state.current.x += 1;
      refreshLockState();
      cb.onMove();
    }
  }

  function refreshLockState() {
    if (canMove(0, 1)) {
      state.isLocking = false;
      state.lockTimer = 0;
    } else {
      state.isLocking = true;
      state.lockTimer = 0;
    }
  }

  function softDrop(active) {
    state.softDropping = active;
  }

  function rotate(dir) {
    if (state.status !== STATUS.PLAYING) return;
    const result = rotatePiece(state.board, state.current, dir);
    if (result) {
      state.current = result;
      refreshLockState();
      cb.onRotate();
    }
  }

  function hold() {
    if (state.status !== STATUS.PLAYING || !state.canHold) return;
    const currentType = state.current.type;
    if (state.hold === null) {
      state.hold = currentType;
      spawnNext();
    } else {
      const swapType = state.hold;
      state.hold = currentType;
      state.current = createPiece(swapType);
    }
    state.canHold = false;
    state.dropTimer = 0;
    state.lockTimer = 0;
    state.isLocking = false;
    cb.onHold();
    checkTopOut();
  }

  function spawnNext() {
    const nextType = state.queue.shift();
    refillQueue(state.queue);
    state.current = createPiece(nextType);
    state.dropTimer = 0;
    state.lockTimer = 0;
    state.isLocking = false;
  }

  function checkTopOut() {
    if (!isValidPosition(state.board, getCells(state.current))) {
      state.status = STATUS.GAMEOVER;
      cb.onGameOver(state.score);
    }
  }

  function lockCurrent() {
    state.board = lockPiece(state.board, getCells(state.current), state.current.type);
    const { board, cleared } = clearLines(state.board);
    state.board = board;

    if (cleared > 0) {
      state.score += (SCORE_TABLE[cleared] || 0) * (state.level + 1);
      state.lines += cleared;
      const newLevel = Math.floor(state.lines / LINES_PER_LEVEL);
      if (newLevel > state.level) {
        state.level = newLevel;
        cb.onLevelUp(newLevel);
      }
      cb.onLineClear(cleared);
    }

    cb.onLock();
    state.canHold = true;
    spawnNext();
    checkTopOut();
  }

  function hardDrop() {
    if (state.status !== STATUS.PLAYING) return;
    let dropped = 0;
    while (canMove(0, 1)) {
      state.current.y += 1;
      dropped += 1;
    }
    state.score += dropped * 2;
    cb.onHardDrop();
    lockCurrent();
  }

  function update(dtMs) {
    if (state.status !== STATUS.PLAYING) return;

    if (canMove(0, 1)) {
      state.isLocking = false;
      state.lockTimer = 0;
      const interval = state.softDropping
        ? getDropInterval() / SOFT_DROP_MULTIPLIER
        : getDropInterval();
      state.dropTimer += dtMs;
      if (state.dropTimer >= interval) {
        state.dropTimer = 0;
        state.current.y += 1;
        if (state.softDropping) state.score += 1;
      }
    } else {
      state.isLocking = true;
      state.lockTimer += dtMs;
      if (state.lockTimer >= LOCK_DELAY_MS) {
        lockCurrent();
      }
    }
  }

  function getGhost() {
    return getGhostCells(state.board, state.current);
  }

  function getState() {
    return state;
  }

  return {
    start,
    pause,
    resume,
    togglePause,
    restart: () => reset(),
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotate,
    hold,
    update,
    getGhost,
    getState,
  };
}
