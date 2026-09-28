// Процедурное техно и звуковые эффекты на WebAudio. Никаких mp3 — всё синтезируется.

let ctx = null;
let master, musicBus, sfxBus, delaySend, noiseBuf;
let sfxOn = false;
let beatOn = false;
let bpm = 128;
let timer = null;
let nextTime = 0;
let step = 0;
const kickListeners = new Set();

// Ля минор: корень баса на каждый такт и арпеджио
const BASS = [55.0, 43.65, 65.41, 49.0];
const ARP = [440, 523.25, 659.25, 783.99, 880, 659.25, 587.33, 523.25];
const ARP_PATTERN = [0, 2, 4, 1, 5, 3, 6, 2, 7, 4, 1, 5, 0, 6, 3, 4];

function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(comp);
    comp.connect(ctx.destination);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0.55;
    musicBus.connect(master);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.5;
    sfxBus.connect(master);

    // Эхо для арпеджио
    const delay = ctx.createDelay(1);
    delay.delayTime.value = (60 / bpm) * 0.75;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2200;
    delaySend = ctx.createGain();
    delaySend.gain.value = 0.5;
    delaySend.connect(delay);
    delay.connect(tone);
    tone.connect(feedback);
    feedback.connect(delay);
    tone.connect(musicBus);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return true;
}

function env(gainNode, t, peak, decay) {
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function noise(t, dur, filterType, freq, q, peak, bus, rate = 1) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    src.playbackRate.value = rate;
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    env(g, t, peak, dur);
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
    return { src, f, g };
}

function tone(t, type, freq, dur, peak, bus, freqEnd) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    const g = ctx.createGain();
    env(g, t, peak, dur);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
    return { o, g };
}

// --- Барабаны и синты ---

function kick(t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(165, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g);
    g.connect(musicBus);
    o.start(t);
    o.stop(t + 0.55);
    // Сообщаем визуалу ровно в момент удара
    const delayMs = Math.max(0, (t - ctx.currentTime) * 1000);
    setTimeout(() => kickListeners.forEach(fn => fn()), delayMs);
}

function hat(t, peak) { noise(t, 0.05, 'highpass', 8000, 0.7, peak, musicBus); }

function clap(t) {
    for (let i = 0; i < 3; i++) noise(t + i * 0.012, 0.09 + i * 0.03, 'bandpass', 1300, 0.9, 0.5, musicBus);
}

function bass(t, freq) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 9;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(140, t + 0.16);
    const g = ctx.createGain();
    env(g, t, 0.32, 0.18);
    o.connect(f);
    f.connect(g);
    g.connect(musicBus);
    o.start(t);
    o.stop(t + 0.22);
}

function arp(t, freq) {
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 2600;
    const g = ctx.createGain();
    env(g, t, 0.05, 0.12);
    o.connect(f);
    f.connect(g);
    g.connect(musicBus);
    g.connect(delaySend);
    o.start(t);
    o.stop(t + 0.16);
}

function scheduleStep(s, t) {
    const inBar = s % 16;
    const bar = Math.floor(s / 16) % 4;
    if (inBar % 4 === 0) kick(t);
    if (inBar === 4 || inBar === 12) clap(t);
    hat(t, inBar % 4 === 2 ? 0.28 : 0.07);
    if (inBar % 4 !== 0) bass(t, BASS[bar] * (inBar % 4 === 3 ? 2 : 1));
    if (bar >= 2 && inBar % 2 === 0) arp(t, ARP[ARP_PATTERN[inBar]]);
    // Раз в 4 такта — подкат
    if (bar === 3 && inBar >= 12) noise(t, 0.12, 'bandpass', 600 + inBar * 400, 3, 0.18, musicBus);
}

function scheduler() {
    const stepDur = 60 / bpm / 4;
    while (nextTime < ctx.currentTime + 0.12) {
        scheduleStep(step, nextTime);
        nextTime += stepDur;
        step = (step + 1) % 64;
    }
}

export const audio = {
    get sfxOn() { return sfxOn; },
    get beatOn() { return beatOn; },

    // Вызывать только из обработчика действия пользователя
    enable() {
        if (!init()) return false;
        if (ctx.state === 'suspended') ctx.resume();
        sfxOn = true;
        return true;
    },

    disable() {
        this.stopBeat();
        sfxOn = false;
    },

    startBeat() {
        if (!this.enable() || beatOn) return;
        beatOn = true;
        step = 0;
        nextTime = ctx.currentTime + 0.06;
        musicBus.gain.cancelScheduledValues(ctx.currentTime);
        musicBus.gain.setValueAtTime(0.55, ctx.currentTime);
        timer = setInterval(scheduler, 25);
        scheduler();
    },

    stopBeat() {
        if (!beatOn) return;
        beatOn = false;
        clearInterval(timer);
        timer = null;
    },

    toggleBeat() {
        if (beatOn) this.stopBeat(); else this.startBeat();
        return beatOn;
    },

    setBpm(value) { bpm = value; },

    onKick(fn) { kickListeners.add(fn); return () => kickListeners.delete(fn); },

    // --- SFX ---
    blip(freq = 880) {
        if (!sfxOn) return;
        tone(ctx.currentTime, 'square', freq, 0.06, 0.12, sfxBus, freq * 1.5);
    },

    tick() {
        if (!sfxOn) return;
        noise(ctx.currentTime, 0.03, 'highpass', 3000, 1, 0.35, sfxBus);
    },

    scratch() {
        if (!sfxOn) return;
        const t = ctx.currentTime;
        const n = noise(t, 0.22, 'bandpass', 1800, 4, 0.7, sfxBus, 0.6);
        n.f.frequency.setValueAtTime(400, t);
        n.f.frequency.exponentialRampToValueAtTime(3200, t + 0.08);
        n.f.frequency.exponentialRampToValueAtTime(500, t + 0.2);
        tone(t, 'sawtooth', 180, 0.18, 0.12, sfxBus, 520);
    },

    boom() {
        if (!sfxOn) return;
        const t = ctx.currentTime;
        tone(t, 'sine', 120, 0.9, 0.9, sfxBus, 28);
        const n = noise(t, 1.1, 'lowpass', 3000, 0.5, 0.8, sfxBus);
        n.f.frequency.exponentialRampToValueAtTime(80, t + 1);
    },

    powerUp() {
        if (!sfxOn) return;
        const t = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(t + i * 0.07, 'square', f, 0.12, 0.1, sfxBus));
    },

    fanfare() {
        if (!sfxOn) return;
        const t = ctx.currentTime;
        const notes = [[523.25, 0], [523.25, 0.12], [523.25, 0.24], [659.25, 0.36], [783.99, 0.6], [1046.5, 0.84]];
        notes.forEach(([f, dt]) => {
            tone(t + dt, 'sawtooth', f, 0.3, 0.12, sfxBus);
            tone(t + dt, 'square', f / 2, 0.3, 0.06, sfxBus);
        });
    },

    denied() {
        if (!sfxOn) return;
        const t = ctx.currentTime;
        tone(t, 'sawtooth', 160, 0.18, 0.2, sfxBus);
        tone(t + 0.2, 'sawtooth', 120, 0.35, 0.2, sfxBus);
    },

    granted() {
        if (!sfxOn) return;
        const t = ctx.currentTime;
        [660, 880, 1320].forEach((f, i) => tone(t + i * 0.09, 'triangle', f, 0.25, 0.18, sfxBus));
    },

    flatline() {
        if (!sfxOn) return;
        tone(ctx.currentTime, 'sine', 1000, 1.6, 0.12, sfxBus);
    },

    say(text) {
        if (!sfxOn || !('speechSynthesis' in window)) return;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ru-RU';
        const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('ru'));
        if (voice) u.voice = voice;
        u.rate = 1.05;
        u.pitch = 0.8;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }
};
