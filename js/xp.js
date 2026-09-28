// Опыт, уровни и серия дней. Живёт в localStorage этого браузера.

export const LEVELS = [
    { xp: 0,    title: 'Диванный кадет' },
    { xp: 40,   title: 'Разминочный стажёр' },
    { xp: 120,  title: 'Повелитель коврика' },
    { xp: 250,  title: 'Гроза турников' },
    { xp: 450,  title: 'Протеиновый паладин' },
    { xp: 700,  title: 'Хранитель позвоночника' },
    { xp: 1000, title: 'Гигачад 39 региона' },
    { xp: 1500, title: 'БОГ ЛФК' }
];

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };

function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
}
function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* приватный режим — живём без сохранений */ }
}

export function levelOf(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
    const cur = LEVELS[i];
    const next = LEVELS[i + 1];
    return {
        index: i,
        title: cur.title,
        progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1,
        toNext: next ? next.xp - xp : 0
    };
}

export function createXP(uid) {
    const key = `fh39:xp:${uid}`;
    const state = Object.assign({ xp: 0, streak: 0, lastWorkoutDay: null, lastVisitDay: null, workouts: 0, minutes: 0 }, read(key));
    const listeners = new Set();

    function commit(event) {
        write(key, state);
        listeners.forEach(fn => fn(state, event));
    }

    return {
        state,
        level: () => levelOf(state.xp),
        onChange(fn) { listeners.add(fn); },

        add(amount, reason) {
            const before = levelOf(state.xp).index;
            state.xp += amount;
            const after = levelOf(state.xp).index;
            commit({ amount, reason, levelUp: after > before ? LEVELS[after] : null });
        },

        // +XP за первый заход сегодня. Возвращает true, если начислено.
        dailyVisit() {
            const today = dayKey();
            if (state.lastVisitDay === today) return false;
            state.lastVisitDay = today;
            this.add(5, 'ежедневный заход');
            return true;
        },

        finishWorkout(minutes) {
            const today = dayKey();
            if (state.lastWorkoutDay !== today) {
                state.streak = state.lastWorkoutDay === yesterdayKey() ? state.streak + 1 : 1;
                state.lastWorkoutDay = today;
            }
            state.workouts += 1;
            state.minutes += minutes;
            this.add(Math.max(5, Math.round(minutes * 10)), 'тренировка');
        },

        // Разовая награда (пасхалки). Возвращает true, если начислено впервые.
        once(id, amount, reason) {
            state.found ||= {};
            if (state.found[id]) return false;
            state.found[id] = true;
            this.add(amount, reason);
            return true;
        },

        // Серия сгорает, если вчера не тренировался
        currentStreak() {
            const d = state.lastWorkoutDay;
            return d === dayKey() || d === yesterdayKey() ? state.streak : 0;
        }
    };
}
