export const COLS = 10;
export const ROWS = 20;
export const CELL_SIZE = 30;

export const COLORS = {
  I: '#4dd9ec',
  O: '#f5d547',
  T: '#b56ce0',
  S: '#5ee06c',
  Z: '#ec5b5b',
  J: '#4d7ff0',
  L: '#f0a13c',
  GHOST: 'rgba(255,255,255,0.25)',
};

export const KEY_BINDINGS = {
  MOVE_LEFT: ['ArrowLeft', 'KeyA'],
  MOVE_RIGHT: ['ArrowRight', 'KeyD'],
  SOFT_DROP: ['ArrowDown', 'KeyS'],
  HARD_DROP: ['Space'],
  ROTATE_CW: ['ArrowUp', 'KeyX'],
  ROTATE_CCW: ['KeyZ'],
  HOLD: ['KeyC', 'ShiftLeft'],
  PAUSE: ['KeyP', 'Escape'],
};

// 레벨별 자동 낙하 간격(ms). 인덱스가 레벨과 대응.
export const LEVEL_SPEED_MS = [
  800, 720, 630, 550, 470, 380, 300, 220, 130, 100,
  80, 80, 80, 70, 70, 70, 50, 50, 50, 30,
];

export const LINES_PER_LEVEL = 10;
export const LOCK_DELAY_MS = 500;
export const SOFT_DROP_MULTIPLIER = 20;
export const SCORE_TABLE = { 1: 100, 2: 300, 3: 500, 4: 800 };
export const HIGH_SCORE_KEY = 'tetris_high_score';
