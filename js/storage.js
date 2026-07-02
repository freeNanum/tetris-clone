import { HIGH_SCORE_KEY } from './constants.js';

export function getHighScore() {
  const raw = localStorage.getItem(HIGH_SCORE_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function setHighScore(score) {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}
