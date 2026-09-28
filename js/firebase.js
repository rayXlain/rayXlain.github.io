// Firebase Auth. Веб-ключ Firebase публичный по задумке — защищают его правила
// и список Authorized domains в консоли Firebase.

const SDK = 'https://www.gstatic.com/firebasejs/12.5.0';

const firebaseConfig = {
    apiKey: 'AIzaSyC_B3PV_kh09VxW9qjkaaN3rxYq2qZCI9Y',
    authDomain: 'fithealth-f4285.firebaseapp.com',
    projectId: 'fithealth-f4285',
    storageBucket: 'fithealth-f4285.firebasestorage.app',
    messagingSenderId: '943397255581',
    appId: '1:943397255581:web:a325d1af4172ac0dd15774'
};

export async function initAuth() {
    const [{ initializeApp }, fa] = await Promise.all([
        import(`${SDK}/firebase-app.js`),
        import(`${SDK}/firebase-auth.js`)
    ]);
    const auth = fa.getAuth(initializeApp(firebaseConfig));
    auth.languageCode = 'ru';

    return {
        onChange: cb => fa.onAuthStateChanged(auth, cb),
        login: (email, password) => fa.signInWithEmailAndPassword(auth, email, password),
        register: (email, password) => fa.createUserWithEmailAndPassword(auth, email, password),
        reset: email => fa.sendPasswordResetEmail(auth, email),
        logout: () => fa.signOut(auth)
    };
}

const ERRORS = {
    'auth/invalid-email': 'Кривой email. Проверь, где собака.',
    'auth/missing-email': 'Email забыл ввести.',
    'auth/missing-password': 'А пароль?',
    'auth/weak-password': 'Пароль слабее, чем пресс после Нового года. Минимум 6 символов.',
    'auth/email-already-in-use': 'Этот email уже качается с нами. Жми «Вход».',
    'auth/invalid-credential': 'Неверный email или пароль.',
    'auth/wrong-password': 'Неверный email или пароль.',
    'auth/user-not-found': 'Неверный email или пароль.',
    'auth/user-disabled': 'Аккаунт заблокирован.',
    'auth/too-many-requests': 'Слишком много попыток. Отдохни, как между подходами, и попробуй снова.',
    'auth/network-request-failed': 'Нет связи с сервером. Проверь интернет.'
};

export function authErrorText(err) {
    return ERRORS[err?.code] || `Что-то пошло не так (${err?.code || err?.message || 'неизвестно'}).`;
}
