// Частицы, конфетти, кастомный курсор, тряска экрана

const PINK = ['#ff0a78', '#ff2bd6', '#ff7ac0', '#ffffff'];
const RAVE = ['#ff0a78', '#c6ff00', '#00f0ff', '#ff2bd6', '#ffe14d', '#ffffff'];

let canvas, ctx, dpr = 1;
const particles = [];
let running = false;
let reduced = false;
let god = false;

export function initFx(el, { reducedMotion = false } = {}) {
    canvas = el;
    ctx = canvas.getContext('2d');
    reduced = reducedMotion;
    const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
    };
    resize();
    addEventListener('resize', resize);
}

export function setGodFx(on) { god = on; }

function loop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 1;
        if (p.life <= 0 || p.y > innerHeight + 60) { particles.splice(i, 1); continue; }
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        const a = Math.min(1, p.life / (p.max * 0.4));
        ctx.globalAlpha = a;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.type === 'confetti') {
            ctx.fillStyle = p.color;
            ctx.scale(1, Math.cos(p.life * 0.25));
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.type === 'heart' || p.type === 'text') {
            ctx.fillStyle = p.color;
            ctx.font = `900 ${p.size}px Unbounded, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.text, 0, 0);
        } else {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * a, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (particles.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

function add(p) {
    if (particles.length > 900) particles.shift();
    particles.push(p);
    if (!running) { running = true; requestAnimationFrame(loop); }
}

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

export function burst(x, y, { count = 24, speed = 7, colors = PINK, type = 'spark', size = 4, gravity = 0.15, text = '♥' } = {}) {
    if (reduced) count = Math.ceil(count / 4);
    for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const v = rand(speed * 0.3, speed);
        const life = rand(40, 80);
        add({
            x, y,
            vx: Math.cos(ang) * v,
            vy: Math.sin(ang) * v - (type === 'heart' ? 2 : 0),
            gravity, drag: 0.96,
            life, max: life,
            size: type === 'heart' ? rand(size * 3, size * 6) : rand(size * 0.5, size * 1.5),
            color: pick(colors),
            type, text,
            rot: type === 'heart' ? rand(-0.4, 0.4) : 0,
            vr: type === 'heart' ? rand(-0.05, 0.05) : 0
        });
    }
}

export function confetti(amount = 180) {
    if (reduced) amount = 40;
    for (let i = 0; i < amount; i++) {
        const fromLeft = i % 2 === 0;
        const life = rand(120, 220);
        add({
            x: fromLeft ? -10 : innerWidth + 10,
            y: innerHeight * rand(0.55, 0.95),
            vx: (fromLeft ? 1 : -1) * rand(6, 17),
            vy: rand(-22, -9),
            gravity: 0.35, drag: 0.985,
            life, max: life,
            size: rand(8, 16),
            color: pick(RAVE),
            type: 'confetti',
            rot: rand(0, 6), vr: rand(-0.3, 0.3)
        });
    }
}

export function floatText(x, y, text, color = '#c6ff00') {
    add({ x, y, vx: 0, vy: -1.6, gravity: 0, drag: 0.99, life: 70, max: 70, size: 22, color, type: 'text', text, rot: 0, vr: 0 });
}

export function shake(el, strength = 10) {
    if (reduced || !el || !el.animate) return;
    const frames = [];
    for (let i = 0; i < 8; i++) {
        const k = 1 - i / 8;
        frames.push({ transform: `translate(${rand(-1, 1) * strength * k}px, ${rand(-1, 1) * strength * k}px) rotate(${rand(-1, 1) * strength * 0.08 * k}deg)` });
    }
    frames.push({ transform: 'none' });
    el.animate(frames, { duration: 420, easing: 'ease-out' });
}

export function initCursor(root) {
    if (!matchMedia('(pointer: fine)').matches || reduced) return;
    const dot = root.querySelector('.cursor-dot');
    const ring = root.querySelector('.cursor-ring');
    document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, lastX = x, lastY = y;

    addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        x = e.clientX;
        y = e.clientY;
        const speed = Math.hypot(x - lastX, y - lastY);
        if (speed > 28 || (god && speed > 6)) {
            add({
                x, y, vx: rand(-1, 1), vy: rand(-1, 1), gravity: god ? -0.05 : 0.02, drag: 0.94,
                life: 30, max: 30, size: god ? 16 : 3, color: pick(god ? RAVE : PINK),
                type: god ? 'heart' : 'spark', text: '♥', rot: 0, vr: 0
            });
        }
        lastX = x;
        lastY = y;
    }, { passive: true });

    addEventListener('pointerover', e => {
        const hit = e.target.closest?.('a, button, input, [role="button"], [data-hover], .vinyl');
        ring.classList.toggle('hover', !!hit);
    });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
    document.addEventListener('pointerleave', () => root.classList.add('gone'));
    document.addEventListener('pointerenter', () => root.classList.remove('gone'));

    (function follow() {
        rx += (x - rx) * 0.2;
        ry += (y - ry) * 0.2;
        dot.style.transform = `translate(${x}px, ${y}px)`;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(follow);
    })();
}
