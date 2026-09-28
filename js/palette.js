// Командная палитра (Ctrl+K): нечёткий поиск по группам, болячкам, месяцам и командам.

let FusePromise = null;
const loadFuse = () => FusePromise ||= import('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.mjs')
    .then(m => m.default)
    .catch(() => null);

export function createPalette(root, { onOpen, onClose, onMove } = {}) {
    const input = root.querySelector('.palette-input');
    const list = root.querySelector('.palette-list');
    let items = [];
    let fuse = null;
    let results = [];
    let active = 0;
    let lastFocus = null;

    function render() {
        list.innerHTML = '';
        if (!results.length) {
            const li = document.createElement('li');
            li.className = 'palette-empty';
            li.textContent = 'Ничего не нашлось. Попробуй «спина», «глаза» или «март».';
            list.appendChild(li);
            return;
        }
        results.forEach((item, i) => {
            const li = document.createElement('li');
            li.className = 'palette-item' + (i === active ? ' active' : '');
            li.id = `pal-${i}`;
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', String(i === active));
            li.innerHTML = `<span class="pi-icon" aria-hidden="true"></span><span class="pi-text"><b></b><small></small></span><span class="pi-kind"></span>`;
            li.querySelector('.pi-icon').textContent = item.icon || '›';
            li.querySelector('b').textContent = item.label;
            li.querySelector('small').textContent = item.hint || '';
            li.querySelector('.pi-kind').textContent = item.kind || '';
            li.addEventListener('pointermove', () => { if (active !== i) { active = i; sync(); } });
            li.addEventListener('click', () => run(i));
            list.appendChild(li);
        });
        input.setAttribute('aria-activedescendant', `pal-${active}`);
    }

    function sync() {
        [...list.children].forEach((li, i) => {
            li.classList.toggle('active', i === active);
            li.setAttribute('aria-selected', String(i === active));
        });
        input.setAttribute('aria-activedescendant', `pal-${active}`);
        list.children[active]?.scrollIntoView({ block: 'nearest' });
    }

    function search() {
        const q = input.value.trim().toLowerCase();
        active = 0;
        if (!q) {
            results = items.filter(i => i.featured);
        } else if (fuse) {
            results = fuse.search(q).slice(0, 10).map(r => r.item);
        } else {
            results = items.filter(i => (i.label + ' ' + (i.keywords || '')).toLowerCase().includes(q)).slice(0, 10);
        }
        render();
    }

    function run(i) {
        const item = results[i];
        if (!item) return;
        close();
        item.action();
    }

    function open() {
        if (!root.hidden) return;
        lastFocus = document.activeElement;
        root.hidden = false;
        input.value = '';
        search();
        requestAnimationFrame(() => input.focus());
        onOpen?.();
    }

    function close() {
        if (root.hidden) return;
        root.hidden = true;
        onClose?.();
        lastFocus?.focus?.();
    }

    input.addEventListener('input', search);
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, results.length); sync(); onMove?.(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % Math.max(1, results.length); sync(); onMove?.(); }
        else if (e.key === 'Enter') { e.preventDefault(); run(active); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    root.addEventListener('click', e => { if (e.target === root) close(); });

    return {
        open, close,
        get isOpen() { return !root.hidden; },
        async setItems(next) {
            items = next;
            const Fuse = await loadFuse();
            if (Fuse) {
                fuse = new Fuse(items, {
                    threshold: 0.38,
                    ignoreLocation: true,
                    keys: [{ name: 'label', weight: 2 }, { name: 'keywords', weight: 1 }]
                });
            }
            if (!root.hidden) search();
        }
    };
}
