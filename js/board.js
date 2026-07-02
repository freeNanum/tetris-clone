import { COLS, ROWS } from './constants.js';

export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function isValidPosition(board, cells) {
  return cells.every(({ x, y }) => {
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y < 0) return true; // 스폰 영역(보드 위쪽)은 항상 허용
    return board[y][x] === null;
  });
}

export function lockPiece(board, cells, type) {
  const newBoard = board.map((row) => row.slice());
  cells.forEach(({ x, y }) => {
    if (y >= 0 && y < ROWS) newBoard[y][x] = type;
  });
  return newBoard;
}

export function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = board.length - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...emptyRows, ...remaining], cleared };
}
