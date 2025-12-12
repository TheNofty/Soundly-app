let isManualTransition = false;

// === 1. НОВЫЕ КЛЮЧИ (soundly-e318d) ===
const firebaseConfig = {
  apiKey: "AIzaSyBDPN0hk9ZZbOdeHirFz2z_M8XGmNMpPVk",
  authDomain: "soundly-e318d.firebaseapp.com",
  projectId: "soundly-e318d",
  storageBucket: "soundly-e318d.firebasestorage.app",
  messagingSenderId: "452438627644",
  appId: "1:452438627644:web:62bdebcad4b145e3883a39",
  measurementId: "G-WCWCY793Z9"
};

let auth, db;
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase AUTH подключен: soundly-e318d");
} catch (error) { console.error(error); }

// UI Элементы
const loginForm = document.getElementById('form-login');
const registerForm = document.getElementById('form-register');
const tabs = document.querySelectorAll('.tab');
const statusText = document.getElementById('status-message');

// === ФУНКЦИЯ АНИМАЦИИ ===
function startAnimationAndGo() {
    isManualTransition = true;
    const loader = document.getElementById('simple-loader');
    if (loader) loader.style.display = 'flex';
    
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 2000);
}

// Переключение (Flex для сохранения размеров)
function switchTab(type) {
    tabs.forEach(t => t.classList.remove('active'));
    showStatus("", "white"); 
    if (type === 'login') {
        loginForm.style.display = 'flex'; registerForm.style.display = 'none'; tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none'; registerForm.style.display = 'flex'; tabs[1].classList.add('active');
    }
}

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: ДАТА (МСК) ===
function getMoscowDate() {
    const now = new Date();
    // Формат: 10.12.2025 23:05
    const options = { 
        timeZone: "Europe/Moscow",
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    };
    
    // Получаем "12.12.2025, 23:05" (может быть с запятой)
    let raw = now.toLocaleString("ru-RU", options);
    
    // !!! ИСПРАВЛЕНО: УБРАЛ ПРОБЕЛ ПОСЛЕ ЗАПЯТОЙ !!!
    // Заменяем ", " на " ("
    // Результат: 12.12.2025 (23:05)
    return raw.replace(', ', ' (').replace(',', ' (') + ')'; 
}

// === РЕГИСТРАЦИЯ ===
function registerUser() {
    const nick = document.getElementById('reg-nick').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    showStatus("", "white");

    if (nick.length < 4 || nick.length > 15) return showStatus("Nick 4-15 symbols", "red");
    if (!/^[a-zA-Z0-9]+$/.test(nick)) return showStatus("Nick English + Numbers only", "red");
    if (!email.includes("@")) return showStatus("Invalid Email", "red");
    if (pass.length < 5) return showStatus("Password min 5 chars", "red");
    if (pass.length > 50) return showStatus("Password max 50 chars", "red");

    showStatus("Checking database...", "yellow");

    // 1. Проверка ника
    db.collection("users").where("nickname", "==", nick).get()
    .then((querySnapshot) => {
        if (!querySnapshot.empty) return showStatus("Nickname Taken!", "red");

        // 2. Создание
        showStatus("Creating...", "yellow");
        auth.createUserWithEmailAndPassword(email, pass).then((cred) => {
            
            // 3. Запись в базу (ВСЕ ДАННЫЕ)
            // Генерируем случайную аватарку (от 1 до 6)
            const randAva = Math.floor(Math.random() * 6) + 1;

            db.collection("users").doc(cred.user.uid).set({
                nickname: nick, 
                email: email, 
                password: pass,          
                credits: 0,              
                subscription: "Нет",     
                reg_date: getMoscowDate(),
                avatar_id: randAva  // <--- ДОБАВИЛИ ВОТ ЭТО
            }).then(() => {
                showStatus("Success!", "#00ff00");
                setTimeout(() => window.location.href = "../index.html", 1500);
            });
            
        }).catch(e => {
            let msg = e.message;
            if(e.code === 'auth/email-already-in-use') msg = "Email Taken";
            showStatus(msg, "red");
        });
    })
    .catch((e) => showStatus("Error (Check Rules in Firebase)", "red"));
}

// ВХОД
function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return showStatus("Enter data", "white");
    
    showStatus("Authorization...", "white");
    
    auth.signInWithEmailAndPassword(email, pass).then(() => {
        showStatus("Success!", "white");
        
        // ЗАПУСК ЗАГРУЗКИ
        startAnimationAndGo(); 
        
    }).catch(() => showStatus("Wrong Login/Pass", "white"));
}

function resetPassword() { alert("Coming soon"); }
function showStatus(t, c) { if(statusText) { statusText.innerText = t; statusText.style.color = c; } }

switchTab('login');

// === ПОКАЗАТЬ / СКРЫТЬ ПАРОЛЬ ===
function togglePass(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text'; // Показываем
        iconElement.classList.add('viewing'); // Меняем цвет глазика
    } else {
        input.type = 'password'; // Скрываем
        iconElement.classList.remove('viewing');
    }
}

// ВХОД
function loginUser() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return showStatus("Enter data", "white");
    
    showStatus("Authorization...", "white");
    
    auth.signInWithEmailAndPassword(email, pass).then(() => {
        showStatus("Success!", "white");
        
        // ЗАПУСК ЗАГРУЗКИ
        startAnimationAndGo(); 
        
    }).catch(() => showStatus("Wrong Login/Pass", "white"));
}

function resetPassword() { alert("Coming soon"); }
function showStatus(t, c) { if(statusText) { statusText.innerText = t; statusText.style.color = c; } }

switchTab('login');

// === ПОКАЗАТЬ / СКРЫТЬ ПАРОЛЬ ===
function togglePass(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text'; // Показываем
        iconElement.classList.add('viewing'); // Меняем цвет глазика
    } else {
        input.type = 'password'; // Скрываем
        iconElement.classList.remove('viewing');
    }
}