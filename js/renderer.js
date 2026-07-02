import { COLS, ROWS, CELL_SIZE, COLORS } from './constants.js';
import { SHAPES, getCells } from './piece.js';

export function createRenderer({ boardCanvas, nextCanvas, holdCanvas }) {
  const ctx = boardCanvas.getContext('2d');
  const nextCtx = nextCanvas.getContext('2d');
  const holdCtx = holdCanvas.getContext('2d');

  function drawCell(context, x, y, color, size) {
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.strokeStyle = 'rgba(0,0,0,0.2)';
    context.strokeRect(x * size + 1, y * size + 1, size - 2, size - 2);
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(COLS * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  }

  function renderBoard(state, ghostCells) {
    ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    ctx.fillStyle = '#1b1f2b';
    ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    drawGrid();

    state.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) drawCell(ctx, x, y, COLORS[cell], CELL_SIZE);
      });
    });

    ghostCells.forEach(({ x, y }) => {
      if (y >= 0) drawCell(ctx, x, y, COLORS.GHOST, CELL_SIZE);
    });

    getCells(state.current).forEach(({ x, y }) => {
      if (y >= 0) drawCell(ctx, x, y, COLORS[state.current.type], CELL_SIZE);
    });
  }

  function drawMiniPiece(context, type, boxW, boxH) {
    const size = 20;
    const cells = SHAPES[type][0];
    const maxX = Math.max(...cells.map((c) => c[0]));
    const maxY = Math.max(...cells.map((c) => c[1]));
    const minX = Math.min(...cells.map((c) => c[0]));
    const minY = Math.min(...cells.map((c) => c[1]));
    const pieceW = (maxX - minX + 1) * size;
    const pieceH = (maxY - minY + 1) * size;
    const offsetX = (boxW - pieceW) / 2;
    const offsetY = (boxH - pieceH) / 2;
    context.fillStyle = COLORS[type];
    cells.forEach(([dx, dy]) => {
      context.fillRect(
        offsetX + (dx - minX) * size + 1,
        offsetY + (dy - minY) * size + 1,
        size - 2,
        size - 2
      );
    });
  }

  function renderNextQueue(queue) {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.fillStyle = '#1b1f2b';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const slotHeight = nextCanvas.height / 3;
    queue.slice(0, 3).forEach((type, i) => {
      nextCtx.save();
      nextCtx.translate(0, i * slotHeight);
      drawMiniPiece(nextCtx, type, nextCanvas.width, slotHeight);
      nextCtx.restore();
    });
  }

  function renderHold(type) {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    holdCtx.fillStyle = '#1b1f2b';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (type) drawMiniPiece(holdCtx, type, holdCanvas.width, holdCanvas.height);
  }

  function render(state, ghostCells) {
    renderBoard(state, ghostCells);
    renderNextQueue(state.queue);
    renderHold(state.hold);
  }

  return { render };
}
