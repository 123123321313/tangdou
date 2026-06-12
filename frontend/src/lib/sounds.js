// 背景音乐 & 音效：使用 Web Audio API 生成简单的复古 8-bit 旋律
let audioCtx = null;
let bgGain = null;
let bgNodes = [];
let musicPlaying = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// 简单的音符频率 (Hz)
const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  REST: 0
};

// 简单可爱的旋律（小星星变奏）
const MELODY = [
  [N.C5, 0.4], [N.C5, 0.4], [N.G5, 0.4], [N.G5, 0.4], [N.A5, 0.4], [N.A5, 0.4], [N.G5, 0.8],
  [N.F5, 0.4], [N.F5, 0.4], [N.E5, 0.4], [N.E5, 0.4], [N.D5, 0.4], [N.D5, 0.4], [N.C5, 0.8],
  [N.G5, 0.4], [N.G5, 0.4], [N.F5, 0.4], [N.F5, 0.4], [N.E5, 0.4], [N.E5, 0.4], [N.D5, 0.8],
  [N.G5, 0.4], [N.G5, 0.4], [N.F5, 0.4], [N.F5, 0.4], [N.E5, 0.4], [N.E5, 0.4], [N.D5, 0.8],
  [N.C5, 0.4], [N.C5, 0.4], [N.G5, 0.4], [N.G5, 0.4], [N.A5, 0.4], [N.A5, 0.4], [N.G5, 0.8],
  [N.F5, 0.4], [N.F5, 0.4], [N.E5, 0.4], [N.E5, 0.4], [N.D5, 0.4], [N.D5, 0.4], [N.C5, 0.8]
];

let melodyIdx = 0;
let bgTimeout = null;

function playNote(freq, duration) {
  if (freq === N.REST || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(bgGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function scheduleMelody() {
  if (!musicPlaying) return;
  const [freq, dur] = MELODY[melodyIdx % MELODY.length];
  playNote(freq, dur * 0.9);
  melodyIdx++;
  bgTimeout = setTimeout(scheduleMelody, dur * 1000);
}

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
  bgGain = ctx.createGain();
  bgGain.gain.value = 0.15;
  bgGain.connect(ctx.destination);
  musicPlaying = true;
  scheduleMelody();
}

export function stopMusic() {
  musicPlaying = false;
  if (bgTimeout) clearTimeout(bgTimeout);
  if (bgGain) {
    bgGain.disconnect();
    bgGain = null;
  }
}

export function isMusicPlaying() { return musicPlaying; }

export function setVolume(v) {
  if (bgGain) bgGain.gain.value = v * 0.3;
}

// 短音效
export function playSfx(type) {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  if (type === "click") {
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } else if (type === "success") {
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(784, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  } else if (type === "fail") {
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  } else if (type === "win") {
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.1);
      o.stop(ctx.currentTime + i * 0.1 + 0.25);
    });
  } else if (type === "unlock") {
    [659, 784, 988, 1175].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.15);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.06);
      o.stop(ctx.currentTime + i * 0.06 + 0.18);
    });
  }
}
