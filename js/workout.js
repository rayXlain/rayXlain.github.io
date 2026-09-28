// Режим тренировки: таймер, отсчёт с озвучкой, мотивационные вбросы, конфетти в конце.

import { HYPE } from './data.js';
import { audio } from './audio.js';
import { burst, confetti, shake } from './fx.js';

const pick = arr => arr[(Math.random() * arr.length) | 0];
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function createWorkout(root, { onStart, onFinish, onOpenImage, onClose }) {
    const panel = root.querySelector('.wo-panel');
    const img = root.querySelector('#wo-img');
    const title = root.querySelector('#wo-title');
    const cat = root.querySelector('#wo-cat');
    const note = root.querySelector('#wo-note');
    const time = root.querySelector('#wo-time');
    const progress = root.querySelector('#wo-progress');
    const hype = root.querySelector('#wo-hype');
    const series = root.querySelector('.wo-series');
    const countdown = document.getElementById('wo-countdown');
    const startBtn = root.querySelector('#wo-start');
    const stopBtn = root.querySelector('#wo-stop');
    const durBtns = [...root.querySelectorAll('[data-min]')];
    const CIRC = 2 * Math.PI * 54;
    progress.style.strokeDasharray = String(CIRC);

    let complex = null;
    let imageIndex = 0;
    let minutes = 15;
    let total = 0;
    let left = 0;
    let phase = 'idle'; // idle | countdown | running | paused | done
    let lastTs = 0;
    let nextHype = 0;
    let raf = 0;
    let lastFocus = null;
    const timeouts = [];

    function setMinutes(m) {
        minutes = m;
        durBtns.forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.min) === m)));
        if (phase === 'idle' || phase === 'done') { total = left = m * 60; draw(); }
    }

    function draw() {
        time.textContent = fmt(Math.ceil(left));
        progress.style.strokeDashoffset = String(CIRC * (1 - (total ? left / total : 1)));
    }

    function showImage(i) {
        imageIndex = (i + complex.images.length) % complex.images.length;
        img.src = complex.images[imageIndex];
        img.alt = `${complex.title}${complex.images.length > 1 ? ` — часть ${imageIndex + 1}` : ''}`;
        [...series.children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === imageIndex)));
    }

    function setPhase(p) {
        phase = p;
        root.dataset.phase = p;
        startBtn.textContent = { idle: 'ПОГНАЛИ', countdown: '...', running: 'ПАУЗА', paused: 'ДАЛЬШЕ', done: 'ЕЩЁ РАЗ' }[p];
        stopBtn.disabled = p === 'idle' || p === 'done';
        durBtns.forEach(b => { b.disabled = p === 'running' || p === 'countdown' || p === 'paused'; });
    }

    function say(text, big = false) {
        hype.textContent = text;
        hype.classList.remove('pop');
        void hype.offsetWidth;
        hype.classList.add('pop');
        if (big) shake(panel, 12);
    }

    function later(fn, ms) { timeouts.push(setTimeout(fn, ms)); }
    function clearLater() { timeouts.splice(0).forEach(clearTimeout); }

    function startCountdown() {
        setPhase('countdown');
        hype.textContent = 'ГОТОВЬСЯ…';
        onStart?.();
        const steps = ['3', '2', '1', 'ПОГНАЛИ!'];
        const words = ['Три', 'Два', 'Один', 'Погнали!'];
        steps.forEach((s, i) => later(() => {
            countdown.textContent = s;
            countdown.classList.remove('go');
            void countdown.offsetWidth;
            countdown.classList.add('go');
            audio.say(words[i]);
            audio.blip(i === 3 ? 1320 : 660);
            shake(panel, i === 3 ? 18 : 6);
            if (i === 3) {
                const r = countdown.getBoundingClientRect();
                burst(r.left + r.width / 2, r.top + r.height / 2, { count: 60, speed: 12, colors: ['#c6ff00', '#ff0a78', '#00f0ff'] });
            }
        }, i * 850));
        later(() => {
            countdown.classList.remove('go');
            countdown.textContent = '';
            total = left = minutes * 60;
            nextHype = total - 20;
            say('ПОЕХАЛИ! ЧЕСТНО, БЕЗ ЧИТОВ');
            run();
        }, steps.length * 850);
    }

    function run() {
        setPhase('running');
        lastTs = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
    }

    function tick(ts) {
        if (phase !== 'running') return;
        const prev = left;
        left = Math.max(0, left - (ts - lastTs) / 1000);
        lastTs = ts;
        draw();
        if (left <= nextHype && left > 5) {
            const phrase = pick(Math.random() < 0.5 ? HYPE.common : HYPE[complex.kind] || HYPE.common);
            say(phrase, true);
            audio.say(phrase.toLowerCase());
            nextHype = left - (25 + Math.random() * 25);
        }
        if (left > 0 && left <= 3 && Math.ceil(left) !== Math.ceil(prev)) audio.blip(440);
        if (left <= 0) return finish(true);
        raf = requestAnimationFrame(tick);
    }

    function finish(completed) {
        cancelAnimationFrame(raf);
        clearLater();
        const doneMinutes = (total - left) / 60;
        setPhase('done');
        countdown.textContent = '';
        if (completed || doneMinutes >= 1) {
            say(completed ? 'ТРЕНИРОВКА ЗАСЧИТАНА! ТЫ ЛЕГЕНДА' : `ЗАСЧИТАНО ${Math.floor(doneMinutes)} МИН`, true);
            audio.say(completed ? 'Тренировка засчитана. Ты легенда!' : 'Засчитано. Неплохо.');
            audio.fanfare();
            confetti(completed ? 220 : 90);
            onFinish?.(completed ? minutes : Math.floor(doneMinutes));
        } else {
            say('МЕНЬШЕ МИНУТЫ НЕ СЧИТАЕТСЯ :(');
            audio.denied();
        }
        total = left = minutes * 60;
        draw();
    }

    startBtn.addEventListener('click', () => {
        if (phase === 'idle' || phase === 'done') { audio.powerUp(); startCountdown(); }
        else if (phase === 'running') { setPhase('paused'); say('ПАУЗА. ПОПЕЙ ВОДИЧКИ'); }
        else if (phase === 'paused') { say('ПОЕХАЛИ ДАЛЬШЕ'); run(); }
    });
    stopBtn.addEventListener('click', () => finish(false));
    durBtns.forEach(b => b.addEventListener('click', () => { audio.tick(); setMinutes(Number(b.dataset.min)); }));
    root.querySelector('.wo-close').addEventListener('click', () => close());
    img.addEventListener('click', () => onOpenImage?.(complex, imageIndex));
    root.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        if (e.key === ' ' && e.target === root) { e.preventDefault(); startBtn.click(); }
    });

    function open(c, category) {
        complex = c;
        lastFocus = document.activeElement;
        title.textContent = c.title;
        cat.textContent = category ? `${category.icon} ${category.short}` : 'Комплекс месяца';
        note.textContent = c.note || '';
        note.hidden = !c.note;
        series.innerHTML = '';
        if (c.images.length > 1) {
            c.images.forEach((_, i) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = String(i + 1);
                b.setAttribute('aria-label', `Часть ${i + 1}`);
                b.addEventListener('click', () => { audio.tick(); showImage(i); });
                series.appendChild(b);
            });
        }
        showImage(0);
        hype.textContent = 'Выбери время и жми ПОГНАЛИ';
        setPhase('idle');
        setMinutes(minutes);
        root.hidden = false;
        document.body.classList.add('locked');
        requestAnimationFrame(() => startBtn.focus());
    }

    function close() {
        if (root.hidden) return;
        if (phase === 'running' || phase === 'paused') finish(false);
        cancelAnimationFrame(raf);
        clearLater();
        countdown.textContent = '';
        setPhase('idle');
        root.hidden = true;
        document.body.classList.remove('locked');
        onClose?.();
        lastFocus?.focus?.();
    }

    return { open, close, get isOpen() { return !root.hidden; } };
}
