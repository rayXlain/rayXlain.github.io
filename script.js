// Data for exercise complexes
const complexesData = {
    II: {
        months: [
            { imageNumber: 1 },
            { imageNumber: 2 },
            { imageNumber: 3 },
            { imageNumber: 4 },
            { imageNumber: 5 },
            { imageNumber: 6 },
            { imageNumber: 7 },
            { imageNumber: 8 },
            { imageNumber: 9 },
            { imageNumber: 10 },
            { imageNumber: 11 },
            { imageNumber: 12 }
        ]
    },
    III: {
        "Заболевание опорно-двигательного аппарата": {
            months: [
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 },
                { imageNumber: 3 }
            ]
        },
        "Заболевание сердечно-сосудистой системы": {
            months: [
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 },
                { imageNumber: 13 }
            ]
        },
        "Заболевание зрительного аппарата": {
            months: [
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 },
                { imageNumber: 23 }
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
        const imageNumber = complex.imageNumber;
        const ext = imageNumber === 1 ? 'gif' : 'jpg';
        const complexDiv = document.createElement('div');
        complexDiv.innerHTML = `
            <img src="sep/${imageNumber}.${ext}" alt="Image ${imageNumber}" style="max-width:100%; height:auto; margin-bottom:10px;">
        `;
        container.appendChild(complexDiv);
    } else if (group === 'III') {
        for (const category in complexesData.III) {
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<h3>${category}</h3>`;
            const complex = complexesData.III[category].months[monthIndex];
            const imageNumber = complex.imageNumber;
            const ext = imageNumber === 1 ? 'gif' : 'jpg';
            categoryDiv.innerHTML += `
                <img src="sep/${imageNumber}.${ext}" alt="Image ${imageNumber}" style="max-width:100%; height:auto; margin-bottom:10px;">
            `;
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

// Reset search functionality on focus
searchInput.addEventListener('focus', function() {
    // Allow search to work again
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
        dropdown.remove();
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


