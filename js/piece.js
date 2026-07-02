import { COLS } from './constants.js';
import { isValidPosition } from './board.js';

// 4x4 기준 그리드 위의 셀 좌표. [rotation 0,1,2,3][cell index] = [dx, dy]
export const SHAPES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
};

const TYPES = Object.keys(SHAPES);
const SPAWN_X = Math.floor((COLS - 4) / 2);

// 캐주얼 게임을 위한 단순화된 벽킥 오프셋 목록 (공식 SRS 킥 테이블의 축약판)
const KICKS = [
  [0, 0], [1, 0], [-1, 0], [0, -1], [1, -1], [-1, -1], [0, -2], [2, 0], [-2, 0],
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createBagGenerator() {
  let bag = [];
  return function next() {
    if (bag.length === 0) bag = shuffle([...TYPES]);
    return bag.pop();
  };
}

export function createPiece(type) {
  return { type, rotation: 0, x: SPAWN_X, y: 0 };
}

export function getCells(piece) {
  return SHAPES[piece.type][piece.rotation].map(([dx, dy]) => ({
    x: piece.x + dx,
    y: piece.y + dy,
  }));
}

export function rotatePiece(board, piece, dir) {
  const nextRotation = (piece.rotation + dir + 4) % 4;
  for (const [kx, ky] of KICKS) {
    const candidate = { ...piece, rotation: nextRotation, x: piece.x + kx, y: piece.y + ky };
    if (isValidPosition(board, getCells(candidate))) {
      return candidate;
    }
  }
  return null;
}

export function getGhostCells(board, piece) {
  let ghost = piece;
  while (isValidPosition(board, getCells({ ...ghost, y: ghost.y + 1 }))) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }
  return getCells(ghost);
}
