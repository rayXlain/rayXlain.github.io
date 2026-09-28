// Полноэкранный просмотр комплекса: клик — зум в точку, перетаскивание — панорама.

export function createLightbox(root, { onNav } = {}) {
    const img = root.querySelector('#lb-img');
    const prev = root.querySelector('.lb-prev');
    const next = root.querySelector('.lb-next');
    let images = [];
    let index = 0;
    let zoom = 1;
    let tx = 0, ty = 0;
    let drag = null;
    let lastFocus = null;

    function apply(animate = true) {
        img.style.transition = animate ? 'transform .35s cubic-bezier(.2,.9,.3,1)' : 'none';
        img.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
        root.classList.toggle('zoomed', zoom > 1);
    }

    function show(i) {
        index = (i + images.length) % images.length;
        img.src = images[index].src;
        img.alt = images[index].alt;
        zoom = 1; tx = ty = 0;
        apply(false);
    }

    img.addEventListener('pointerdown', e => {
        e.preventDefault();
        drag = { x: e.clientX, y: e.clientY, tx, ty, moved: false };
        img.setPointerCapture(e.pointerId);
    });
    img.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 5) drag.moved = true;
        if (drag.moved && zoom > 1) { tx = drag.tx + dx; ty = drag.ty + dy; apply(false); }
    });
    img.addEventListener('pointerup', e => {
        if (!drag) return;
        const wasDrag = drag.moved;
        drag = null;
        if (wasDrag) return;
        if (zoom > 1) { zoom = 1; tx = ty = 0; }
        else {
            // Зум в точку клика
            const r = img.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            zoom = 2.4;
            tx = (cx - e.clientX) * (zoom - 1);
            ty = (cy - e.clientY) * (zoom - 1);
        }
        apply();
    });

    prev.addEventListener('click', () => { onNav?.(); show(index - 1); });
    next.addEventListener('click', () => { onNav?.(); show(index + 1); });
    root.querySelector('.lb-close').addEventListener('click', () => close());
    root.addEventListener('click', e => { if (e.target === root || e.target.classList.contains('lb-stage')) close(); });
    root.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
        if (images.length > 1 && e.key === 'ArrowLeft') show(index - 1);
        if (images.length > 1 && e.key === 'ArrowRight') show(index + 1);
    });

    function open(complex, i = 0) {
        lastFocus = document.activeElement;
        images = complex.images.map((src, j) => ({
            src,
            alt: `${complex.title}${complex.images.length > 1 ? ` — часть ${j + 1}` : ''}`
        }));
        prev.hidden = next.hidden = images.length < 2;
        root.hidden = false;
        show(i);
        document.body.classList.add('locked');
        requestAnimationFrame(() => root.querySelector('.lb-close').focus());
    }

    function close() {
        if (root.hidden) return;
        root.hidden = true;
        if (document.getElementById('workout').hidden) document.body.classList.remove('locked');
        lastFocus?.focus?.();
    }

    return { open, close, get isOpen() { return !root.hidden; } };
}
