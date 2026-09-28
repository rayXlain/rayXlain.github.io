// Каталог комплексов и расписание по группам здоровья

export const MONTHS = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const MONTHS_SHORT = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

// kind влияет на фразы в режиме тренировки: body | yoga | eyes | breath
export const COMPLEXES = {
    morning:     { title: 'Утренняя гимнастика',               images: ['sep/1.gif'],  kind: 'breath', tags: 'утро зарядка дыхание потягивание приседания бокс' },
    posture:     { title: '10 упражнений для осанки',          images: ['sep/2.jpg'],  kind: 'body',   tags: 'осанка спина сколиоз сутулость' },
    feet:        { title: 'Гимнастика для стоп',               images: ['sep/3.jpg'],  kind: 'body',   tags: 'стопы ноги плоскостопие голеностоп' },
    core:        { title: 'Мышцы живота и спины',              images: ['sep/4.jpg'],  kind: 'body',   tags: 'пресс живот спина кор поясница' },
    kidsYoga:    { title: 'Йога: 24 позы',                     images: ['sep/5.jpg'],  kind: 'yoga',   tags: 'йога растяжка позы гибкость' },
    back:        { title: 'Тренировка мышц спины',             images: ['sep/6.jpg'],  kind: 'body',   tags: 'спина позвоночник валик', note: 'Рекомендуемая продолжительность — 15 минут ежедневно.' },
    spineSeries: { title: 'ЛФК для позвоночника: серия лёжа',  images: ['sep/6.1.jpg', 'sep/6.2.jpg', 'sep/6.3.jpg'], kind: 'body', tags: 'позвоночник поясница лфк лёжа кушетка грыжа' },
    stretch:     { title: '12 поз утренней растяжки',          images: ['sep/24.jpg'], kind: 'yoga',   tags: 'растяжка утро йога планка воин' },
    asanas:      { title: 'Асаны йоги',                        images: ['sep/15.jpg'], kind: 'yoga',   tags: 'йога асаны шавасана растяжка' },
    spineLfk:    { title: 'Комплекс ЛФК для позвоночника',     images: ['sep/9.jpg'],  kind: 'body',   tags: 'позвоночник лфк спина шведская стенка' },
    lungs:       { title: 'Гимнастика при заболеваниях лёгких', images: ['sep/10.jpg'], kind: 'breath', tags: 'лёгкие легкие дыхание бронхи астма обруч палка' },
    sleepYoga:   { title: 'Йога для хорошего сна',             images: ['sep/11.jpg'], kind: 'yoga',   tags: 'йога сон бессонница расслабление вечер' },
    general:     { title: 'Общеразвивающие упражнения',        images: ['sep/12.jpg'], kind: 'breath', tags: 'общая гимнастика наклоны отжимания' },
    hypertension:{ title: 'ЛФК при гипертонической болезни',   images: ['sep/13.jpg'], kind: 'breath', tags: 'сердце давление гипертония сосуды' },
    eyes:        { title: 'Гимнастика для глаз',               images: ['sep/23.jpg'], kind: 'eyes',   tags: 'глаза зрение моргание' },
    eyesBasic:   { title: 'Восстановление зрения',             images: ['sep/19.jpg'], kind: 'eyes',   tags: 'глаза зрение пальминг восьмёрка' },
    eyesSharp:   { title: 'Гимнастика для остроты зрения',     images: ['sep/25.jpg'], kind: 'eyes',   tags: 'глаза зрение острота близорукость' }
};

for (const id in COMPLEXES) COMPLEXES[id].id = id;

export const GROUPS = {
    II: {
        id: 'II',
        name: 'Вторая группа здоровья',
        short: 'II группа',
        desc: 'В целом здоров, но есть небольшие отклонения. Каждый месяц — новый комплекс.',
        // Индекс = месяц (0 — январь)
        schedule: ['morning', 'posture', 'feet', 'core', 'kidsYoga', 'back',
                   'stretch', 'asanas', 'spineLfk', 'lungs', 'sleepYoga', 'general']
    },
    III: {
        id: 'III',
        name: 'Третья группа здоровья',
        short: 'III группа',
        desc: 'Хронические заболевания в стадии компенсации. Комплекс под конкретную систему организма.',
        categories: [
            { id: 'musculo', name: 'Заболевания опорно-двигательного аппарата', short: 'Опорно-двигательный', icon: '🦴',
              rotation: ['feet', 'spineSeries', 'back', 'posture', 'spineLfk', 'core'] },
            { id: 'cardio', name: 'Заболевания сердечно-сосудистой системы', short: 'Сердце и сосуды', icon: '🫀',
              rotation: ['hypertension'] },
            { id: 'eyes', name: 'Заболевания зрительного аппарата', short: 'Зрение', icon: '👁️',
              rotation: ['eyes', 'eyesBasic', 'eyesSharp'] },
            { id: 'breath', name: 'Заболевания органов дыхания', short: 'Дыхание', icon: '🫁',
              rotation: ['lungs'] }
        ]
    }
};

// Что показывать для группы в конкретный месяц: [{ category?, complex }]
export function complexesFor(groupId, month) {
    const group = GROUPS[groupId];
    if (!group) return [];
    if (group.schedule) {
        return [{ category: null, complex: COMPLEXES[group.schedule[month]] }];
    }
    return group.categories.map(category => ({
        category,
        complex: COMPLEXES[category.rotation[month % category.rotation.length]]
    }));
}

// Фразы для режима тренировки
export const HYPE = {
    common: [
        'ДЫШИ!', 'ТЫ МАШИНА!', 'ЕЩЁ ЧУТЬ-ЧУТЬ!', 'НЕ СДАВАЙСЯ!', 'ТЕЛО СКАЖЕТ СПАСИБО',
        'КАЛИНИНГРАД ГОРДИТСЯ', 'ЛЕГЕНДА!', 'ДИВАН ПЛАЧЕТ', 'МЕДЛЕННО И ПРАВИЛЬНО',
        'БЕЗ ФАНАТИЗМА, НО С ДУШОЙ'
    ],
    body: ['СПИНА РОВНО!', 'ПОЗВОНОЧНИК КАЙФУЕТ', 'КОНТРОЛИРУЙ ДВИЖЕНИЕ', 'НЕ ГОРБИСЬ!', 'ПРЕСС ВКЛЮЧЁН'],
    yoga: ['ТЫ ДЕРЕВО', 'ТЯНИСЬ К КОСМОСУ', 'ДЗЕН ЗАГРУЖАЕТСЯ...', 'ОМММММ', 'ГИБКОСТЬ +1'],
    eyes: ['НЕ МОРГАЙ... ШУЧУ, МОРГАЙ', 'ГЛАЗА — ТОЖЕ МЫШЦЫ', 'ВОСЬМЁРКУ ГЛАЗАМИ!', 'ПАЛЬМИНГ ЗАСЛУЖЕН', 'СМОТРИ ВДАЛЬ'],
    breath: ['ВДОХ... ВЫДОХ...', 'ЛЁГКИЕ НА МАКСИМУМ', 'ДЫШИ ЖИВОТОМ', 'КИСЛОРОД ЗАКАЧАН', 'РИТМ! ДЫХАНИЕ!']
};
