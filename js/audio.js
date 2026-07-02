// 별도 오디오 에셋 없이 Web Audio API 오실레이터로 간단한 효과음을 합성한다.
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep({ freq = 440, duration = 0.08, type = 'square', volume = 0.15 }) {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export const sfx = {
  move: () => beep({ freq: 220, duration: 0.04, type: 'square', volume: 0.08 }),
  rotate: () => beep({ freq: 330, duration: 0.05, type: 'square', volume: 0.1 }),
  hardDrop: () => beep({ freq: 140, duration: 0.08, type: 'sawtooth', volume: 0.15 }),
  lock: () => beep({ freq: 260, duration: 0.05, type: 'triangle', volume: 0.1 }),
  hold: () => beep({ freq: 400, duration: 0.05, type: 'sine', volume: 0.1 }),
  lineClear: (count) => {
    const freqs = [523, 659, 784, 988];
    beep({ freq: freqs[Math.min(count - 1, 3)], duration: 0.15, type: 'square', volume: 0.18 });
  },
  levelUp: () => beep({ freq: 880, duration: 0.2, type: 'sine', volume: 0.2 }),
  gameOver: () => beep({ freq: 110, duration: 0.4, type: 'sawtooth', volume: 0.2 }),
};

export function unlockAudio() {
  const audioCtx = getCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
