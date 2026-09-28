// Пластинка месяцев: крути мышью/пальцем, колесом или стрелками.

import { MONTHS, MONTHS_SHORT } from './data.js';

const STEP = 30;

export function createVinyl(root, { onChange, onTick, onScratch }) {
    const ring = root.querySelector('.vinyl-ring');
    const label = root.querySelector('.vinyl-month');
    const labels = MONTHS_SHORT.map((m, i) => {
        const el = document.createElement('span');
        el.className = 'vinyl-tick';
        el.textContent = m;
        el.style.setProperty('--a', `${i * STEP}deg`);
        ring.appendChild(el);
        return el;
    });

    let angle = 0;
    let index = 0;
    let dragging = false;

    const norm = i => ((i % 12) + 12) % 12;
    const indexAt = a => norm(Math.round(-a / STEP));

    function render(animate) {
        ring.style.transition = animate ? 'transform .5s cubic-bezier(.2,1.4,.4,1)' : 'none';
        ring.style.transform = `rotate(${angle}deg)`;
        const at = indexAt(angle);
        labels.forEach((el, i) => el.classList.toggle('on', i === at));
        label.textContent = MONTHS[at];
        root.setAttribute('aria-valuenow', String(at + 1));
        root.setAttribute('aria-valuetext', MONTHS[at]);
    }

    function set(i, { silent = false } = {}) {
        i = norm(i);
        // Ближайший угол, чтобы не крутить через полкруга
        const target = -i * STEP;
        angle = target + Math.round((angle - target) / 360) * 360;
        render(true);
        if (i !== index) {
            index = i;
            if (!silent) onChange(i);
        }
    }

    // --- Перетаскивание ---
    let startPointerAngle = 0;
    let startAngle = 0;
    let lastAt = 0;
    const center = () => {
        const r = root.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
    };
    const pointerAngle = e => {
        const [cx, cy] = center();
        return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    };

    root.addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return;
        dragging = true;
        root.setPointerCapture(e.pointerId);
        startPointerAngle = pointerAngle(e);
        startAngle = angle;
        lastAt = indexAt(angle);
        root.classList.add('dragging');
        onScratch?.();
    });
    root.addEventListener('pointermove', e => {
        if (!dragging) return;
        let delta = pointerAngle(e) - startPointerAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        angle = startAngle + delta;
        render(false);
        const at = indexAt(angle);
        if (at !== lastAt) { lastAt = at; onTick?.(); }
        // Несколько оборотов подряд
        if (Math.abs(delta) > 150) { startAngle = angle; startPointerAngle = pointerAngle(e); }
    });
    const release = () => {
        if (!dragging) return;
        dragging = false;
        root.classList.remove('dragging');
        set(indexAt(angle));
    };
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);

    root.addEventListener('wheel', e => {
        e.preventDefault();
        onTick?.();
        set(index + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    root.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onTick?.(); set(index + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onTick?.(); set(index - 1); }
    });

    render(false);
    return {
        set,
        get: () => index,
        next: () => set(index + 1),
        prev: () => set(index - 1)
    };
}
