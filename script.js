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

// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
    const auth = window.firebaseAuth;
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    const searchContainer = document.querySelector('.search-container');
    const complexContainer = document.getElementById('complex-container');

    // Show login form
    document.getElementById('show-login').addEventListener('click', function() {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    // Show register form
    document.getElementById('show-register').addEventListener('click', function() {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Login
    document.getElementById('login-btn').addEventListener('click', function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        window.signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Logged in:', userCredential.user);
                loginForm.style.display = 'none';
                logoutBtn.style.display = 'block';
                searchContainer.style.display = 'block';
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Ошибка входа: ' + error.message);
            });
    });

    // Register
    document.getElementById('register-btn').addEventListener('click', function() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        window.createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log('Registered:', userCredential.user);
                registerForm.style.display = 'none';
                logoutBtn.style.display = 'block';
                searchContainer.style.display = 'block';
            })
            .catch((error) => {
                console.error('Register error:', error);
                alert('Ошибка регистрации: ' + error.message);
            });
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        window.signOut(auth).then(() => {
            console.log('Logged out');
            logoutBtn.style.display = 'none';
            searchContainer.style.display = 'none';
            complexContainer.innerHTML = '';
            loginForm.style.display = 'block';
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    });

    // Auth state observer
    window.onAuthStateChanged(auth, (user) => {
        const blurOverlay = document.querySelector('.blur-overlay');
        if (user) {
            blurOverlay.classList.add('hidden');
            logoutBtn.style.display = 'block';
            searchContainer.style.display = 'block';
        } else {
            blurOverlay.classList.remove('hidden');
            logoutBtn.style.display = 'none';
            searchContainer.style.display = 'none';
            complexContainer.innerHTML = '';
        }
    });
});

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




