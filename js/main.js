import { GROUPS, COMPLEXES, MONTHS, MONTHS_SHORT, complexesFor } from './data.js';
import { audio } from './audio.js';
import { initShader } from './shader.js';
import { initFx, initCursor, burst, confetti, shake, floatText, setGodFx } from './fx.js';
import { initAuth, authErrorText } from './firebase.js';
import { createXP, levelOf } from './xp.js';
import { createVinyl } from './vinyl.js';
import { createPalette } from './palette.js';
import { createWorkout } from './workout.js';
import { createLightbox } from './lightbox.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const pick = arr => arr[(Math.random() * arr.length) | 0];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;
const els = {
    boot: $('#boot'), bootLog: $('#boot-log'), bootEnter: $('#boot-enter'), bootSkip: $('#boot-skip'),
    gate: $('#gate'), gateCard: $('#gate-card'), gateSub: $('#gate-sub'),
    form: $('#auth-form'), email: $('#auth-email'), password: $('#auth-password'),
    submit: $('#auth-submit'), reset: $('#auth-reset'), msg: $('#auth-msg'),
    app: $('#app'), main: $('#main'),
    heart: $('#heart'), title: $('#title'), tagline: $('#tagline'),
    program: $('#program'), complexes: $('#complexes'), disclaimer: $('#disclaimer'),
    vinylGroup: $('#vinyl-group'), vinylNow: $('#vinyl-now'),
    btnBeat: $('#btn-beat'), toasts: $('#toasts'), flash: $('#flash'), levelup: $('#levelup')
};

// ---------- Фон, частицы, курсор ----------

const shader = initShader($('#bg'), { reducedMotion: reduced });
initFx($('#fx'), { reducedMotion: reduced });
initCursor($('#cursor'));
if (reduced) body.classList.add('reduced');

audio.onKick(() => {
    shader.kick();
    if (!els.app.hidden && !reduced) {
        els.heart.animate(
            [{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
            { duration: 260, easing: 'cubic-bezier(.2,.9,.3,1)' }
        );
    }
});

// ---------- Мелкие UI-штуки ----------

function toast(text, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = text;
    els.toasts.appendChild(el);
    while (els.toasts.children.length > 4) els.toasts.firstElementChild.remove();
    setTimeout(() => el.classList.add('out'), 3200);
    setTimeout(() => el.remove(), 3700);
}

function flash(text, color = '') {
    els.flash.textContent = text;
    els.flash.dataset.color = color;
    els.flash.classList.remove('on');
    void els.flash.offsetWidth;
    els.flash.classList.add('on');
}

function hideScreen(el) {
    if (el.hidden) return Promise.resolve();
    el.classList.add('leaving');
    return wait(reduced ? 0 : 450).then(() => { el.hidden = true; el.classList.remove('leaving'); });
}

// ---------- Загрузка ----------

const BOOT = [
    ['FITHEALTH39 BIOS v39.0 — (c) Калининград', null],
    ['ПАМЯТЬ: 640 КБ ПРОТЕИНА', 'OK'],
    ['> проверка позвоночника', 'OK'],
    ['> калибровка бицепсов', 'OK'],
    ['> загрузка протеина в ОЗУ', '146%', 'warn'],
    ['> поиск силы воли', 'НЕ НАЙДЕНО', 'err'],
    ['> установка силы воли', '[██████████] OK'],
    ['> синхронизация с сердцем', '♥ 72 BPM', 'warn'],
    ['> разгон пульса до 128 BPM', 'ГОТОВО'],
    ['> отключение дивана', 'ВЫПОЛНЕНО'],
    ['', null],
    ['СИСТЕМА ГОТОВА. ТЕЛО ЖДЁТ.', null, 'big']
];

let seenBoot = false;
try { seenBoot = sessionStorage.getItem('fh39:boot') === '1'; } catch { /* нет хранилища — не беда */ }

function bootLine(text, status, cls) {
    const line = document.createElement('div');
    line.className = `bl ${cls || ''}`;
    const label = document.createElement('span');
    label.textContent = text;
    line.appendChild(label);
    if (status) {
        const dots = document.createElement('span');
        dots.className = 'bl-dots';
        const st = document.createElement('span');
        st.className = `bl-st ${cls === 'err' ? 'err' : cls === 'warn' ? 'warn' : 'ok'}`;
        st.textContent = status;
        line.append(dots, st);
    }
    els.bootLog.appendChild(line);
}

async function runBoot() {
    let skipped = false;
    const skip = e => {
        if (e.target.closest?.('#boot-enter')) return;
        skipped = true;
    };
    addEventListener('keydown', skip);
    els.boot.addEventListener('pointerdown', skip);
    const speed = seenBoot || reduced ? 0.25 : 1;
    for (const [text, status, cls] of BOOT) {
        bootLine(text, status, cls);
        if (!skipped) await wait((status ? 190 : 120) * speed + Math.random() * 90 * speed);
    }
    removeEventListener('keydown', skip);
    els.boot.removeEventListener('pointerdown', skip);
    try { sessionStorage.setItem('fh39:boot', '1'); } catch { /* ок */ }
    els.bootSkip.hidden = true;
    els.bootEnter.hidden = false;
    $('[data-enter="sound"]', els.bootEnter).focus();
    return new Promise(resolve => {
        els.bootEnter.addEventListener('click', e => {
            const b = e.target.closest('[data-enter]');
            if (b) resolve(b.dataset.enter === 'sound');
        });
    });
}

// ---------- Вход ----------

let auth = null;
let mode = 'login';

function setMode(next) {
    mode = next;
    $$('.tabs [role="tab"]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
    els.submit.textContent = mode === 'login' ? 'ОТСКАНИРОВАТЬ ТЕЛО' : 'СОЗДАТЬ НОВОЕ ТЕЛО';
    els.password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    els.reset.hidden = mode !== 'login';
    els.msg.textContent = '';
    els.msg.className = 'auth-msg';
}

function gateError(text) {
    els.gateCard.classList.remove('scanning', 'denied');
    void els.gateCard.offsetWidth;
    els.gateCard.classList.add('denied');
    els.msg.textContent = text;
    els.msg.className = 'auth-msg err';
    audio.denied();
    shake(els.gateCard, 14);
}

$$('.tabs [role="tab"]').forEach(t => t.addEventListener('click', () => { audio.tick(); setMode(t.dataset.mode); }));

els.form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!auth) return;
    const email = els.email.value.trim();
    const password = els.password.value;
    if (!email) return gateError('Email забыл ввести.');
    if (!password) return gateError('А пароль?');
    els.gateCard.classList.remove('denied');
    els.gateCard.classList.add('scanning');
    els.msg.textContent = 'СКАНИРОВАНИЕ…';
    els.msg.className = 'auth-msg';
    els.submit.disabled = true;
    audio.blip(520);
    try {
        await (mode === 'login' ? auth.login(email, password) : auth.register(email, password));
    } catch (err) {
        gateError(authErrorText(err));
    } finally {
        els.submit.disabled = false;
    }
});

els.reset.addEventListener('click', async () => {
    if (!auth) return;
    const email = els.email.value.trim();
    if (!email) return gateError('Впиши email — пришлём ссылку для сброса.');
    try {
        await auth.reset(email);
        els.msg.textContent = `Письмо для сброса пароля улетело на ${email}.`;
        els.msg.className = 'auth-msg ok';
        audio.granted();
    } catch (err) {
        gateError(authErrorText(err));
    }
});

function showGate() {
    closeOverlays();
    els.gateCard.classList.remove('scanning', 'granted', 'denied');
    els.password.value = '';
    setMode('login');
    const reveal = () => {
        els.gate.hidden = false;
        requestAnimationFrame(() => els.email.focus());
    };
    if (!els.app.hidden) hideScreen(els.app).then(reveal);
    else reveal();
}

// ---------- Приложение ----------

let xp = null;
let group = null;
let month = new Date().getMonth();
const currentMonth = new Date().getMonth();
let appReady = false;
let god = false;

async function showApp(user) {
    if (!els.gate.hidden) {
        els.gateCard.classList.remove('scanning', 'denied');
        els.gateCard.classList.add('granted');
        els.msg.textContent = 'ДОСТУП РАЗРЕШЁН';
        els.msg.className = 'auth-msg ok';
        audio.granted();
        await wait(reduced ? 200 : 900);
        await hideScreen(els.gate);
    }
    if (!appReady) { setupApp(); appReady = true; }

    xp = createXP(user.uid);
    xp.onChange((state, ev) => {
        renderHud();
        if (ev?.amount) {
            const hud = $('#hud-xp').getBoundingClientRect();
            floatText(hud.left + hud.width / 2, hud.bottom + 14, `+${ev.amount} XP`);
            toast(`+${ev.amount} XP · ${ev.reason}`, 'xp');
        }
        if (ev?.levelUp) levelUp(ev.levelUp.title);
    });
    renderHud();

    els.app.hidden = false;
    els.app.classList.remove('entered');
    void els.app.offsetWidth;
    els.app.classList.add('entered');
    window.scrollTo(0, 0);

    const name = (user.email || 'атлет').split('@')[0];
    toast(`С возвращением, ${name}!`);
    setTimeout(() => xp?.dailyVisit(), 900);
}

function renderHud() {
    if (!xp) return;
    const lvl = levelOf(xp.state.xp);
    $('#hud-lvl').textContent = `LVL ${lvl.index + 1}`;
    $('#hud-title').textContent = lvl.title;
    $('#xp-fill').style.width = `${Math.round(lvl.progress * 100)}%`;
    $('#hud-xp').title = `${xp.state.xp} XP${lvl.toNext ? ` · до следующего уровня ${lvl.toNext}` : ' · максимум'}`;
    const s = xp.currentStreak();
    $('#hud-streak').textContent = `🔥 ${s}`;
    $('#hud-streak').classList.toggle('hot', s > 0);
}

function levelUp(title) {
    $('#lu-title').textContent = title;
    els.levelup.hidden = false;
    els.levelup.classList.remove('on');
    void els.levelup.offsetWidth;
    els.levelup.classList.add('on');
    audio.fanfare();
    audio.say(`Новый уровень. ${title}`);
    confetti(240);
    setTimeout(() => { els.levelup.hidden = true; }, 2800);
}

// Заголовок: буквы разбегаются от курсора, иногда глючат, по двойному клику падают
let letters = [];
let gravityOn = false;

function setupTitle() {
    const text = els.title.textContent;
    els.title.textContent = '';
    letters = [...text].map(ch => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        s.setAttribute('aria-hidden', 'true');
        els.title.appendChild(s);
        return s;
    });

    if (!reduced) {
        addEventListener('pointermove', e => {
            if (gravityOn || els.app.hidden) return;
            for (const s of letters) {
                const r = s.getBoundingClientRect();
                const dx = r.left + r.width / 2 - e.clientX;
                const dy = r.top + r.height / 2 - e.clientY;
                const d = Math.hypot(dx, dy);
                if (d < 140) {
                    const k = (1 - d / 140) * 26;
                    s.style.transform = `translate(${(dx / (d || 1)) * k}px, ${(dy / (d || 1)) * k}px) rotate(${dx * 0.04}deg)`;
                } else if (s.style.transform) {
                    s.style.transform = '';
                }
            }
        }, { passive: true });

        (function glitchLoop() {
            setTimeout(() => {
                if (!gravityOn && !document.hidden) {
                    const n = 1 + ((Math.random() * 3) | 0);
                    for (let i = 0; i < n; i++) {
                        const s = pick(letters);
                        s.classList.add('g');
                        setTimeout(() => s.classList.remove('g'), 180 + Math.random() * 200);
                    }
                }
                glitchLoop();
            }, 1400 + Math.random() * 2600);
        })();
    }

    els.title.addEventListener('dblclick', gravity);
}

function gravity() {
    if (gravityOn || reduced) return;
    gravityOn = true;
    audio.boom();
    toast('ГРАВИТАЦИЯ ВКЛЮЧЕНА');
    const bodies = letters.map(el => {
        el.style.transition = 'none';
        el.style.transform = '';
        return { el, r: el.getBoundingClientRect(), x: 0, y: 0, vx: (Math.random() - 0.5) * 10, vy: -Math.random() * 10, rot: 0, vr: (Math.random() - 0.5) * 16 };
    });
    const t0 = performance.now();
    (function step(now) {
        for (const b of bodies) {
            b.vy += 0.9;
            b.x += b.vx;
            b.y += b.vy;
            b.rot += b.vr;
            const floor = innerHeight - 8;
            if (b.r.bottom + b.y > floor) {
                b.y = floor - b.r.bottom;
                b.vy *= -0.55;
                b.vx *= 0.85;
                b.vr *= 0.6;
            }
            const left = b.r.left + b.x;
            if (left < 0 || left + b.r.width > innerWidth) b.vx *= -1;
            b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
        }
        if (now - t0 < 3200) return requestAnimationFrame(step);
        for (const b of bodies) {
            b.el.style.transition = 'transform .9s cubic-bezier(.2,1.5,.4,1)';
            b.el.style.transform = '';
        }
        audio.powerUp();
        setTimeout(() => {
            letters.forEach(l => { l.style.transition = ''; });
            gravityOn = false;
        }, 950);
    })(t0);
}

// Слоган печатается сам
function setupTagline() {
    const phrases = [
        'ЛФК, но это рейв',
        'качаем позвоночник под 128 BPM',
        'глаза — тоже мышцы',
        '39 регион, вставай с дивана',
        'комплекс месяца уже ждёт',
        'дыши. просто дыши.'
    ];
    if (reduced) return;
    let i = 0, n = phrases[0].length, deleting = true;
    (function loop() {
        const p = phrases[i];
        els.tagline.textContent = p.slice(0, n);
        let delay = deleting ? 28 : 55;
        if (!deleting && n === p.length) { deleting = true; delay = 2600; }
        else if (deleting && n === 0) { deleting = false; i = (i + 1) % phrases.length; delay = 300; }
        else n += deleting ? -1 : 1;
        setTimeout(loop, delay);
    })();
}

function setupTicker() {
    const a = ['ПРИСЕДАЙ ИЛИ ПРОИГРАЕШЬ', 'ГЛАЗА — ТОЖЕ МЫШЦЫ', 'ПОЗВОНОЧНИК — ТВОЙ ВНУТРЕННИЙ СТЕРЖЕНЬ', 'КАЛИНИНГРАД КАЧАЕТСЯ', 'ДИВАН — НЕ ДРУГ'];
    const b = ['ВДОХ', 'ВЫДОХ', 'СПИНА РОВНО', '15 МИНУТ В ДЕНЬ', 'БЕЗ ФАНАТИЗМА', 'ЛФК = РЕЙВ'];
    const fill = (el, words) => {
        const chunk = words.map(w => `<span>${w}</span><i>✦</i>`).join('');
        el.innerHTML = chunk.repeat(4);
    };
    fill($('#ticker-a'), a);
    fill($('#ticker-b'), b);
}

// Сердце: клики — сердечки, 10 кликов подряд — взрыв
function setupHeart() {
    let clicks = [];
    let broken = false;
    els.heart.addEventListener('click', e => {
        if (broken) return;
        const now = Date.now();
        clicks = clicks.filter(t => now - t < 3500);
        clicks.push(now);
        const r = els.heart.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2;
        const y = e.clientY || r.top + r.height / 2;
        burst(x, y, { type: 'heart', count: 8 + clicks.length * 2, speed: 5 + clicks.length, size: 5 });
        audio.blip(440 + clicks.length * 90);
        if (clicks.length === 7) toast('эй, полегче…');
        if (clicks.length >= 10) {
            broken = true;
            clicks = [];
            els.heart.classList.add('broken');
            burst(r.left + r.width / 2, r.top + r.height / 2, { type: 'heart', count: 90, speed: 18, size: 6, gravity: 0.25 });
            burst(r.left + r.width / 2, r.top + r.height / 2, { count: 80, speed: 20, colors: ['#fff', '#ff0a78', '#ffe14d'] });
            audio.boom();
            shake(els.main, 22);
            flash('💔');
            toast('ТЫ СЛОМАЛ СЕРДЦЕ. Регенерация…');
            xp?.once('heart', 15, 'сломал сердце');
            setTimeout(() => {
                els.heart.classList.remove('broken');
                audio.powerUp();
                broken = false;
            }, 2400);
        }
    });
}

// Карточки групп с 3D-наклоном
function setupGroups() {
    $$('.gcard').forEach(card => {
        card.addEventListener('pointermove', e => {
            if (reduced || e.pointerType !== 'mouse') return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
            card.style.setProperty('--ry', `${(px - 0.5) * 18}deg`);
            card.style.setProperty('--mx', `${px * 100}%`);
            card.style.setProperty('--my', `${py * 100}%`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
        card.addEventListener('pointerenter', () => audio.tick());
        card.addEventListener('click', () => {
            const r = card.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2, { count: 50, speed: 14, colors: ['#ff0a78', '#c6ff00', '#00f0ff', '#fff'] });
            shake(card, 10);
            selectGroup(card.dataset.group);
        });
    });
}

function selectGroup(id, { scroll = true } = {}) {
    const changed = group !== id;
    group = id;
    $$('.gcard').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.group === id)));
    els.vinylGroup.textContent = id;
    els.disclaimer.hidden = id !== 'III';
    if (changed) audio.powerUp();
    els.program.hidden = false;
    renderComplexes();
    if (scroll) els.program.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

function renderComplexes() {
    if (!group) return;
    const list = complexesFor(group, month);
    els.complexes.className = `complexes ${list.length > 1 ? 'multi' : 'single'}`;
    els.complexes.innerHTML = '';
    for (const { category, complex } of list) {
        const card = document.createElement('article');
        card.className = 'ccard';
        if (category) card.dataset.cat = category.id;
        card.innerHTML = `
            <button type="button" class="ccard-screen" data-act="view">
                <img loading="lazy" alt="">
                <span class="ccard-scan" aria-hidden="true"></span>
                <span class="ccard-badge"></span>
            </button>
            <div class="ccard-body">
                <p class="ccard-cat"></p>
                <h3 class="ccard-title"></h3>
                <p class="ccard-note"></p>
                <div class="ccard-actions">
                    <button type="button" class="btn-ghost sm" data-act="view">🔍 СМОТРЕТЬ</button>
                    <button type="button" class="btn-mega sm" data-act="go">ПОГНАЛИ →</button>
                </div>
            </div>`;
        const img = $('img', card);
        img.src = complex.images[0];
        img.alt = complex.title;
        $('.ccard-screen', card).setAttribute('aria-label', `Открыть «${complex.title}» на весь экран`);
        const badge = $('.ccard-badge', card);
        badge.textContent = complex.images.length > 1 ? `1/${complex.images.length}` : MONTHS_SHORT[month];
        $('.ccard-cat', card).textContent = category ? `${category.icon} ${category.name}` : `Комплекс на ${MONTHS[month].toLowerCase()}`;
        $('.ccard-title', card).textContent = complex.title;
        const note = $('.ccard-note', card);
        note.textContent = complex.note || '';
        note.hidden = !complex.note;
        card.addEventListener('click', e => {
            const act = e.target.closest('[data-act]')?.dataset.act;
            if (act === 'view') { audio.blip(700); lightbox.open(complex); }
            if (act === 'go') { audio.powerUp(); workout.open(complex, category); }
        });
        els.complexes.appendChild(card);
    }
    const isNow = month === currentMonth;
    els.vinylNow.textContent = isNow ? 'СЕЙЧАС' : 'ПРЕВЬЮ';
    els.vinylNow.classList.toggle('preview', !isNow);
    if (!reduced) {
        els.complexes.classList.remove('swap');
        void els.complexes.offsetWidth;
        els.complexes.classList.add('swap');
    }
}

function categoryOf(complexId) {
    return GROUPS.III.categories.find(c => c.rotation.includes(complexId)) || null;
}

// Бит и режим бога
function setBeatUi(on) {
    els.btnBeat.setAttribute('aria-pressed', String(on));
    body.classList.toggle('beat-on', on);
}

function toggleBeat() {
    const on = audio.toggleBeat();
    setBeatUi(on);
    toast(on ? '♫ БИТ ВКЛЮЧЁН — 128 BPM' : 'бит выключен');
}

function toggleGod() {
    god = !god;
    body.classList.toggle('god', god);
    shader.setGod(god);
    setGodFx(god);
    audio.setBpm(god ? 160 : 128);
    if (god) {
        flash('РЕЖИМ БОГА', 'rainbow');
        confetti(260);
        audio.fanfare();
        toast('✦ РЕЖИМ БОГА. Konami ещё раз — выключить.');
        xp?.once('god', 39, 'нашёл режим бога');
    } else {
        toast('режим бога выключен');
    }
}

function kaliningrad() {
    flash('КАЛИНИНГРАД КАЧАЕТСЯ', 'amber');
    audio.powerUp();
    burst(innerWidth / 2, innerHeight / 2, { count: 70, speed: 16, colors: ['#ffe14d', '#ff9f1c', '#fff'] });
    xp?.once('39', 10, 'код 39 региона');
}

function closeOverlays() {
    palette?.close();
    workout?.close();
    lightbox?.close();
}

async function logout() {
    closeOverlays();
    toast('Пока! Мышцы будут скучать.');
    await auth?.logout();
}

let vinyl, palette, workout, lightbox;

function setupApp() {
    setupTitle();
    setupTagline();
    setupTicker();
    setupHeart();
    setupGroups();

    vinyl = createVinyl($('#vinyl'), {
        onChange: m => { month = m; audio.scratch(); renderComplexes(); },
        onTick: () => audio.tick(),
        onScratch: () => audio.scratch()
    });
    vinyl.set(month, { silent: true });
    $('#month-prev').addEventListener('click', () => vinyl.prev());
    $('#month-next').addEventListener('click', () => vinyl.next());
    $('#month-now').addEventListener('click', () => vinyl.set(currentMonth));

    lightbox = createLightbox($('#lightbox'), { onNav: () => audio.tick() });

    workout = createWorkout($('#workout'), {
        onStart: () => { if (audio.sfxOn && !audio.beatOn) { audio.startBeat(); setBeatUi(true); } },
        onFinish: minutes => xp?.finishWorkout(minutes),
        onOpenImage: (c, i) => lightbox.open(c, i)
    });

    palette = createPalette($('#palette'), { onOpen: () => audio.blip(990), onMove: () => audio.tick() });
    const tagsOf = cat => cat.rotation.map(id => COMPLEXES[id].tags).join(' ');
    palette.setItems([
        { label: 'II группа здоровья', hint: 'комплекс на каждый месяц', keywords: 'вторая 2 ii группа здоровья общая', icon: 'II', kind: 'группа', featured: true, action: () => selectGroup('II') },
        { label: 'III группа здоровья', hint: 'опора, сердце, зрение, дыхание', keywords: 'третья 3 iii группа здоровья хронические', icon: 'III', kind: 'группа', featured: true, action: () => selectGroup('III') },
        ...GROUPS.III.categories.map(c => ({
            label: c.name, hint: 'III группа', keywords: `${c.short} ${tagsOf(c)}`, icon: c.icon, kind: 'система', featured: true,
            action: () => {
                selectGroup('III', { scroll: false });
                const card = $(`.ccard[data-cat="${c.id}"]`);
                card?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
                card?.classList.add('ping');
                setTimeout(() => card?.classList.remove('ping'), 1600);
            }
        })),
        ...Object.values(COMPLEXES).map(c => ({
            label: c.title, hint: 'открыть и тренироваться', keywords: c.tags, icon: '💪', kind: 'комплекс',
            action: () => workout.open(c, categoryOf(c.id))
        })),
        ...MONTHS.map((m, i) => ({
            label: m, hint: 'комплекс месяца', keywords: `месяц ${MONTHS_SHORT[i].toLowerCase()}`, icon: '🗓️', kind: 'месяц',
            action: () => { selectGroup(group || 'II'); vinyl.set(i); }
        })),
        { label: 'Включить / выключить бит', hint: 'процедурное техно, 128 BPM', keywords: 'музыка звук бит техно рейв', icon: '♫', kind: 'команда', featured: true, action: toggleBeat },
        { label: 'Режим бога', hint: '???', keywords: 'бог god konami хаос радуга секрет', icon: '✦', kind: 'секрет', action: toggleGod },
        { label: 'Выйти из аккаунта', hint: 'до встречи', keywords: 'выход logout выйти', icon: '🚪', kind: 'команда', action: logout }
    ]);

    $('#btn-search').addEventListener('click', () => palette.open());
    $('#search-trigger').addEventListener('click', () => palette.open());
    els.btnBeat.addEventListener('click', toggleBeat);
    $('#btn-logout').addEventListener('click', logout);
    setBeatUi(audio.beatOn);

    setupEggs();
}

// ---------- Пасхалки ----------

function setupEggs() {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let kPos = 0;
    let digits = '';
    let idleTimer = null;

    const resetIdle = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (els.app.hidden || workout.isOpen || document.hidden) return resetIdle();
            toast('Ты там живой? 💤 Мышцы остывают.');
            audio.flatline();
        }, 90000);
    };
    ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, resetIdle, { passive: true }));
    resetIdle();

    addEventListener('keydown', e => {
        if (els.app.hidden) return;
        const typing = e.target.matches?.('input, textarea');

        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            e.preventDefault();
            if (!workout.isOpen && !lightbox.isOpen) palette.isOpen ? palette.close() : palette.open();
            return;
        }
        if (typing) return;
        if (e.key === '/' && !palette.isOpen && !workout.isOpen && !lightbox.isOpen) { e.preventDefault(); palette.open(); return; }

        kPos = e.code === KONAMI[kPos] ? kPos + 1 : (e.code === KONAMI[0] ? 1 : 0);
        if (kPos === KONAMI.length) { kPos = 0; toggleGod(); }

        if (/^\d$/.test(e.key)) {
            digits = (digits + e.key).slice(-2);
            if (digits === '39') { digits = ''; kaliningrad(); }
        }
    });

    const title = document.title;
    document.addEventListener('visibilitychange', () => {
        document.title = document.hidden ? '💔 вернись, мышцы остывают' : title;
    });
}

console.log('%cFITHEALTH39', 'font: 900 42px sans-serif; color: #ff0a78; text-shadow: 3px 3px 0 #00f0ff;');
console.log('%cЭй, хакер. Прежде чем лезть в код — 20 приседаний. Подсказка: ↑↑↓↓←→←→BA', 'color: #c6ff00; font-size: 13px;');

// ---------- Старт ----------

(async function start() {
    const authReady = initAuth().catch(err => { console.error('Firebase не загрузился:', err); return null; });
    const withSound = await runBoot();
    if (withSound) { audio.enable(); audio.startBeat(); }
    audio.blip(1320);
    shader.kick();
    await hideScreen(els.boot);

    auth = await authReady;
    if (!auth) {
        els.gate.hidden = false;
        els.gateSub.textContent = 'Сервер входа не отвечает. Проверь интернет и обнови страницу.';
        els.form.querySelectorAll('input, button').forEach(el => { el.disabled = true; });
        return;
    }
    auth.onChange(user => {
        if (user) showApp(user);
        else showGate();
    });
})();
