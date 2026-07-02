import { KEY_BINDINGS } from './constants.js';

function matches(code, bindingList) {
  return bindingList.includes(code);
}

export function setupInput(game, { onPauseToggle, onAnyKey } = {}) {
  const pressed = new Set();

  window.addEventListener('keydown', (e) => {
    const code = e.code;
    if (onAnyKey) onAnyKey();

    // 이동은 OS 키 반복을 그대로 활용, 그 외 액션 키는 최초 입력에만 반응
    if (pressed.has(code)) {
      if (matches(code, KEY_BINDINGS.MOVE_LEFT) || matches(code, KEY_BINDINGS.MOVE_RIGHT)) {
        e.preventDefault();
        if (matches(code, KEY_BINDINGS.MOVE_LEFT)) game.moveLeft();
        if (matches(code, KEY_BINDINGS.MOVE_RIGHT)) game.moveRight();
      }
      return;
    }
    pressed.add(code);

    if (matches(code, KEY_BINDINGS.MOVE_LEFT)) {
      e.preventDefault();
      game.moveLeft();
    } else if (matches(code, KEY_BINDINGS.MOVE_RIGHT)) {
      e.preventDefault();
      game.moveRight();
    } else if (matches(code, KEY_BINDINGS.SOFT_DROP)) {
      e.preventDefault();
      game.softDrop(true);
    } else if (matches(code, KEY_BINDINGS.HARD_DROP)) {
      e.preventDefault();
      game.hardDrop();
    } else if (matches(code, KEY_BINDINGS.ROTATE_CW)) {
      e.preventDefault();
      game.rotate(1);
    } else if (matches(code, KEY_BINDINGS.ROTATE_CCW)) {
      e.preventDefault();
      game.rotate(-1);
    } else if (matches(code, KEY_BINDINGS.HOLD)) {
      e.preventDefault();
      game.hold();
    } else if (matches(code, KEY_BINDINGS.PAUSE)) {
      e.preventDefault();
      if (onPauseToggle) onPauseToggle();
    }
  });

  window.addEventListener('keyup', (e) => {
    const code = e.code;
    pressed.delete(code);
    if (matches(code, KEY_BINDINGS.SOFT_DROP)) game.softDrop(false);
  });
}

function bindHold(el, onDown, onUp) {
  if (!el) return;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); }, { passive: false });
  el.addEventListener('touchend', (e) => { e.preventDefault(); if (onUp) onUp(); }, { passive: false });
  el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
  el.addEventListener('mouseup', (e) => { e.preventDefault(); if (onUp) onUp(); });
  el.addEventListener('mouseleave', () => { if (onUp) onUp(); });
}

function bindRepeat(el, action, { delay = 250, interval = 100 } = {}) {
  if (!el) return;
  let delayTimer = null;
  let intervalTimer = null;
  const stop = () => {
    clearTimeout(delayTimer);
    clearInterval(intervalTimer);
  };
  const start = () => {
    action();
    delayTimer = setTimeout(() => {
      intervalTimer = setInterval(action, interval);
    }, delay);
  };
  bindHold(el, start, stop);
}

function bindTap(el, action) {
  bindHold(el, action, null);
}

export function setupTouchControls(game, elements) {
  const { left, right, rotateBtn, softDropBtn, hardDropBtn, holdBtn } = elements;
  bindRepeat(left, () => game.moveLeft());
  bindRepeat(right, () => game.moveRight());
  bindTap(rotateBtn, () => game.rotate(1));
  bindTap(hardDropBtn, () => game.hardDrop());
  bindTap(holdBtn, () => game.hold());
  bindHold(softDropBtn, () => game.softDrop(true), () => game.softDrop(false));
}
