// Data for exercise complexes
const complexesData = {
    II: {
        months: [
            { name: "Комплекс 1", fullName: "Полный комплекс упражнений для второй группы здоровья - Январь", description: "Описание упражнений для января: Выполняйте ежедневно по 10 минут." },
            { name: "Комплекс 2", fullName: "Полный комплекс упражнений для второй группы здоровья - Февраль", description: "Описание упражнений для февраля: Фокус на дыхании." },
            { name: "Комплекс 3", fullName: "Полный комплекс упражнений для второй группы здоровья - Март", description: "Описание упражнений для марта: Упражнения для гибкости." },
            { name: "Комплекс 4", fullName: "Полный комплекс упражнений для второй группы здоровья - Апрель", description: "Описание упражнений для апреля: Силовые упражнения." },
            { name: "Комплекс 5", fullName: "Полный комплекс упражнений для второй группы здоровья - Май", description: "Описание упражнений для мая: Кардио нагрузка." },
            { name: "Комплекс 6", fullName: "Полный комплекс упражнений для второй группы здоровья - Июнь", description: "Описание упражнений для июня: Упражнения на баланс." },
            { name: "Комплекс 7", fullName: "Полный комплекс упражнений для второй группы здоровья - Июль", description: "Описание упражнений для июля: Летние активные упражнения." },
            { name: "Комплекс 8", fullName: "Полный комплекс упражнений для второй группы здоровья - Август", description: "Описание упражнений для августа: Упражнения для укрепления мышц." },
            { name: "Комплекс 9", fullName: "Полный комплекс упражнений для второй группы здоровья - Сентябрь", description: "Описание упражнений для сентября: Осенние разминки." },
            { name: "Комплекс 10", fullName: "Полный комплекс упражнений для второй группы здоровья - Октябрь", description: "Описание упражнений для октября: Фокус на позвоночнике." },
            { name: "Комплекс 11", fullName: "Полный комплекс упражнений для второй группы здоровья - Ноябрь", description: "Описание упражнений для ноября: Зимняя подготовка." },
            { name: "Комплекс 12", fullName: "Полный комплекс упражнений для второй группы здоровья - Декабрь", description: "Описание упражнений для декабря: Новогодние упражнения." }
        ]
    },
    III: {
        "Заболевание опорно-двигательного аппарата": {
            months: [
                { name: "Комплекс ОДА 1", fullName: "Полный комплекс для опорно-двигательного аппарата - Январь", description: "Описание для ОДА января." },
                { name: "Комплекс ОДА 2", fullName: "Полный комплекс для опорно-двигательного аппарата - Февраль", description: "Описание для ОДА февраля." },
                { name: "Комплекс ОДА 3", fullName: "Полный комплекс для опорно-двигательного аппарата - Март", description: "Описание для ОДА марта." },
                { name: "Комплекс ОДА 4", fullName: "Полный комплекс для опорно-двигательного аппарата - Апрель", description: "Описание для ОДА апреля." },
                { name: "Комплекс ОДА 5", fullName: "Полный комплекс для опорно-двигательного аппарата - Май", description: "Описание для ОДА мая." },
                { name: "Комплекс ОДА 6", fullName: "Полный комплекс для опорно-двигательного аппарата - Июнь", description: "Описание для ОДА июня." },
                { name: "Комплекс ОДА 7", fullName: "Полный комплекс для опорно-двигательного аппарата - Июль", description: "Описание для ОДА июля." },
                { name: "Комплекс ОДА 8", fullName: "Полный комплекс для опорно-двигательного аппарата - Август", description: "Описание для ОДА августа." },
                { name: "Комплекс ОДА 9", fullName: "Полный комплекс для опорно-двигательного аппарата - Сентябрь", description: "Описание для ОДА сентября." },
                { name: "Комплекс ОДА 10", fullName: "Полный комплекс для опорно-двигательного аппарата - Октябрь", description: "Описание для ОДА октября." },
                { name: "Комплекс ОДА 11", fullName: "Полный комплекс для опорно-двигательного аппарата - Ноябрь", description: "Описание для ОДА ноября." },
                { name: "Комплекс ОДА 12", fullName: "Полный комплекс для опорно-двигательного аппарата - Декабрь", description: "Описание для ОДА декабря." }
            ]
        },
        "Заболевание сердечно-сосудистой системы": {
            months: [
                { name: "Комплекс ССС 1", fullName: "Полный комплекс для сердечно-сосудистой системы - Январь", description: "Описание для ССС января." },
                { name: "Комплекс ССС 2", fullName: "Полный комплекс для сердечно-сосудистой системы - Февраль", description: "Описание для ССС февраля." },
                { name: "Комплекс ССС 3", fullName: "Полный комплекс для сердечно-сосудистой системы - Март", description: "Описание для ССС марта." },
                { name: "Комплекс ССС 4", fullName: "Полный комплекс для сердечно-сосудистой системы - Апрель", description: "Описание для ССС апреля." },
                { name: "Комплекс ССС 5", fullName: "Полный комплекс для сердечно-сосудистой системы - Май", description: "Описание для ССС мая." },
                { name: "Комплекс ССС 6", fullName: "Полный комплекс для сердечно-сосудистой системы - Июнь", description: "Описание для ССС июня." },
                { name: "Комплекс ССС 7", fullName: "Полный комплекс для сердечно-сосудистой системы - Июль", description: "Описание для ССС июля." },
                { name: "Комплекс ССС 8", fullName: "Полный комплекс для сердечно-сосудистой системы - Август", description: "Описание для ССС августа." },
                { name: "Комплекс ССС 9", fullName: "Полный комплекс для сердечно-сосудистой системы - Сентябрь", description: "Описание для ССС сентября." },
                { name: "Комплекс ССС 10", fullName: "Полный комплекс для сердечно-сосудистой системы - Октябрь", description: "Описание для ССС октября." },
                { name: "Комплекс ССС 11", fullName: "Полный комплекс для сердечно-сосудистой системы - Ноябрь", description: "Описание для ССС ноября." },
                { name: "Комплекс ССС 12", fullName: "Полный комплекс для сердечно-сосудистой системы - Декабрь", description: "Описание для ССС декабря." }
            ]
        },
        "Заболевание зрительного аппарата": {
            months: [
                { name: "Комплекс ЗА 1", fullName: "Полный комплекс для зрительного аппарата - Январь", description: "Описание для ЗА января." },
                { name: "Комплекс ЗА 2", fullName: "Полный комплекс для зрительного аппарата - Февраль", description: "Описание для ЗА февраля." },
                { name: "Комплекс ЗА 3", fullName: "Полный комплекс для зрительного аппарата - Март", description: "Описание для ЗА марта." },
                { name: "Комплекс ЗА 4", fullName: "Полный комплекс для зрительного аппарата - Апрель", description: "Описание для ЗА апреля." },
                { name: "Комплекс ЗА 5", fullName: "Полный комплекс для зрительного аппарата - Май", description: "Описание для ЗА мая." },
                { name: "Комплекс ЗА 6", fullName: "Полный комплекс для зрительного аппарата - Июнь", description: "Описание для ЗА июня." },
                { name: "Комплекс ЗА 7", fullName: "Полный комплекс для зрительного аппарата - Июль", description: "Описание для ЗА июля." },
                { name: "Комплекс ЗА 8", fullName: "Полный комплекс для зрительного аппарата - Август", description: "Описание для ЗА августа." },
                { name: "Комплекс ЗА 9", fullName: "Полный комплекс для зрительного аппарата - Сентябрь", description: "Описание для ЗА сентября." },
                { name: "Комплекс ЗА 10", fullName: "Полный комплекс для зрительного аппарата - Октябрь", description: "Описание для ЗА октября." },
                { name: "Комплекс ЗА 11", fullName: "Полный комплекс для зрительного аппарата - Ноябрь", description: "Описание для ЗА ноября." },
                { name: "Комплекс ЗА 12", fullName: "Полный комплекс для зрительного аппарата - Декабрь", description: "Описание для ЗА декабря." }
            ]
        }
    }
};

// Function to get current month (0-11)
function getCurrentMonth() {
    return new Date().getMonth();
}

// Function to display complexes
function displayComplexes(group) {
    const container = document.getElementById('complex-container');
    container.innerHTML = ''; // Clear previous content
    container.style.display = 'block'; // Show the container

    const monthIndex = getCurrentMonth();

    if (group === 'II') {
        const complex = complexesData.II.months[monthIndex];
        const complexDiv = document.createElement('div');
        complexDiv.innerHTML = `<p><a href="#" class="complex-link" data-fullname="${complex.fullName}" data-description="${complex.description}">${complex.name}</a></p>`;
        container.appendChild(complexDiv);
    } else if (group === 'III') {
        for (const category in complexesData.III) {
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<h3>${category}</h3>`;
            const complex = complexesData.III[category].months[monthIndex];
            categoryDiv.innerHTML += `<p><a href="#" class="complex-link" data-fullname="${complex.fullName}" data-description="${complex.description}">${complex.name}</a></p>`;
            container.appendChild(categoryDiv);
        }
    }
}

// Handle search input with Fuse.js
const searchInput = document.querySelector('.search-input');
const complexContainer = document.getElementById('complex-container');

// List of searchable terms
const searchTerms = ['группа здоровья'];

// Fuse options
const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Adjust for fuzziness (lower = stricter)
    keys: []
};

// Create Fuse instance
const fuse = new Fuse(searchTerms, fuseOptions);

searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    if (query) {
        const results = fuse.search(query);
        if (results.length > 0) {
            showGroupDropdown();
        } else {
            hideGroupDropdown();
            complexContainer.innerHTML = '';
        }
    } else {
        hideGroupDropdown();
        complexContainer.innerHTML = '';
    }
});

function showGroupDropdown() {
    let dropdown = document.querySelector('.search-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.innerHTML = `
            <a href="#" class="group-option" data-group="II">II - Вторая группа здоровья</a>
            <a href="#" class="group-option" data-group="III">III - Третья группа здоровья</a>
        `;
        searchInput.parentNode.appendChild(dropdown);
    }
    dropdown.classList.add('show');
}

function hideGroupDropdown() {
    const dropdown = document.querySelector('.search-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        // Delay hiding to allow animation to complete
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 300);
    }
}

// Event listeners for group selection
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('group-option')) {
        e.preventDefault();
        const group = e.target.getAttribute('data-group');
        displayComplexes(group);
        hideGroupDropdown();
        searchInput.value = '';
    } else if (!searchInput.contains(e.target)) {
        hideGroupDropdown();
    }
});

// Event delegation for complex links
document.getElementById('complex-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('complex-link')) {
        e.preventDefault();
        const fullName = e.target.getAttribute('data-fullname');
        const description = e.target.getAttribute('data-description');

        // Replace link with full name
        e.target.innerHTML = fullName;
        e.target.classList.remove('complex-link');
        e.target.classList.add('full-name-link');
        e.target.setAttribute('data-description', description);
    } else if (e.target.classList.contains('full-name-link')) {
        e.preventDefault();
        const description = e.target.getAttribute('data-description');

        // Check if description is already shown
        const existingDesc = e.target.parentNode.querySelector('.description');
        if (existingDesc) {
            // Toggle visibility
            existingDesc.style.display = existingDesc.style.display === 'none' ? 'block' : 'none';
        } else {
            // Show description below
            const descDiv = document.createElement('div');
            descDiv.className = 'description';
            descDiv.innerHTML = `<p>${description}</p>`;
            e.target.parentNode.appendChild(descDiv);
        }
    }
});
