let isManualTransition = false;

// === 1. ИНИЦИАЛИЗАЦИЯ ===
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
} catch (error) { console.error("Firebase Init Error"); }

const loginForm = document.getElementById('form-login');
const registerForm = document.getElementById('form-register');
const tabs = document.querySelectorAll('.tab');
const statusText = document.getElementById('status-message');

// --- ЛОГИКА: ЧТО ПРОИСХОДИТ ПОСЛЕ КЛИКА ИЗ ПИСЬМА ---
const urlParams = new URLSearchParams(window.location.search);
const activeToken = urlParams.get('token');

if (activeToken) {
    showStatus("Confirming... Wait for it!", "white");
    
    db.collection("pending_registrations").doc(activeToken).get().then(async (doc) => {
        if (doc.exists) {
            const data = doc.data();
            try {
                // ЮЗЕР РОЖДАЕТСЯ В AUTH (Firebase Authentication)
                const cred = await auth.createUserWithEmailAndPassword(data.email, data.pass);
                
                // ЮЗЕР РОЖДАЕТСЯ В БД (Админка Users Base)
                await db.collection("users").doc(cred.user.uid).set({
                    nickname: data.nick,
                    email: data.email,
                    credits: 0,
                    subscription: "Нет",
                    reg_date: getMoscowDate(),
                    avatar_id: Math.floor(Math.random() * 6) + 1
                });

                // Удаляем временную заявку из очереди
                await db.collection("pending_registrations").doc(activeToken).delete();
                
                showStatus("Ready! You can log in now.", "white");
                // Убираем "?token=..." из адреса
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) { showStatus("Error: Token expired or used.", "red"); }
        }
    });
}

// === 2. ПОМОЩНИКИ ===
function startAnimationAndGo() {
    isManualTransition = true;
    const loader = document.getElementById('simple-loader');
    if (loader) loader.style.display = 'flex';
    setTimeout(() => { window.location.href = "../index.html"; }, 2000);
}

function switchTab(type) {
    tabs.forEach(t => t.classList.remove('active'));
    showStatus("", "white"); 
    if (type === 'login') {
        loginForm.style.display = 'flex'; registerForm.style.display = 'none'; tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none'; registerForm.style.display = 'flex'; tabs[1].classList.add('active');
    }
}

function getMoscowDate() {
    const now = new Date();
    const options = { 
        timeZone: "Europe/Moscow",
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    };
    let raw = now.toLocaleString("ru-RU", options);
    return raw.replace(', ', ' (').replace(',', ' (') + ')'; 
}

function showStatus(t, c) { if(statusText) { statusText.innerText = t; statusText.style.color = c; } }

function resetPassword() { alert("Check email for reset link (Soon)"); }

function togglePass(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    iconElement.classList.toggle('viewing', isPass);
}

// === 3. РЕГИСТРАЦИЯ (СИСТЕМА PENDING — БЕЗ БЛОКИРОВКИ AUTH) ===
function registerUser() {
    const nick = document.getElementById('reg-nick').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;

    showStatus("", "white");
    
    // Валидация (Минимум лирики, только факты)
    if (nick.length < 4 || nick.length > 15) return showStatus("Username: 4-15 chars", "white");
    if (!email.includes("@")) return showStatus("Invalid Email", "white");
    if (pass.length < 6) return showStatus("Password: min 6 chars", "white");

    showStatus("Sending email link...", "white");

    // Генерируем уникальный токен
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    // ТВОЯ_ССЫЛКА_ИЗ_DEPLOY_В_SCRIPT_GOOGLE_COM (Вставь свою!)
    const botURL = "https://script.google.com/macros/s/AKfycbzV5M_6RWVF2yCc74adLlJr6IWSTI7dJDNRI-MqmotdW9eyKkWDU3BrB6zETgVa2fToOg/exec";

    // ШАГ 1: Запись в Firestore (pending_registrations)
    // В Authentication в это время ПУСТО.
    db.collection("pending_registrations").doc(token).set({
        nick: nick,
        email: email,
        pass: pass,
        created_at: Date.now()
    }).then(() => {
        fetch(`${botURL}?email=${email}&nick=${nick}&token=${token}`, { mode: 'no-cors' })
            .then(() => {
                console.log("ЗАПРОС УШЕЛ УСПЕШНО. ТОКЕН:", token);
                showStatus("Link sent! Check your inbox.", "white");
            })
            .catch(err => console.log("КОСЯК С ФЕТЧЕМ:", err));

        // Очистка полей (сетка 2000ms = 2 сек)
        setTimeout(() => {
            document.getElementById('reg-nick').value = "";
            document.getElementById('reg-email').value = "";
            document.getElementById('reg-pass').value = "";
        }, 2000);

    }).catch((error) => {
        console.error(error);
        showStatus("Database error. Try later.", "red");
    });
}

// === 4. ВХОД ===
async function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return showStatus("Enter data", "white");
    
    showStatus("Authorizing...", "white");
    
    try {
        const cred = await auth.signInWithEmailAndPassword(email, pass);
        // 🚀 ВАЖНЫЙ МОМЕНТ:
        // Перезагружаем данные пользователя с серверов Google
        await cred.user.reload();
        
        // Берем актуальное состояние ПОСЛЕ перезагрузки
        const currentUser = auth.currentUser;

        if (currentUser.emailVerified) {
            // Кнопка нажата. Идем в базу.
            const doc = await db.collection("users").doc(currentUser.uid).get();

            if (!doc.exists) {
                // ПЕРВЫЙ УСПЕШНЫЙ ВХОД -> Создаем запись для Админки
                const randAva = Math.floor(Math.random() * 6) + 1;
                
                await db.collection("users").doc(currentUser.uid).set({
                    nickname: currentUser.displayName || "NewUser",
                    email: currentUser.email, 
                    credits: 0,              
                    subscription: "Нет",     
                    reg_date: getMoscowDate(), 
                    avatar_id: randAva
                });
            }

            showStatus("Success!", "white");
            startAnimationAndGo(); 
        } else {
            showStatus("Verify email via button first!", "yellow");
            auth.signOut(); // Выкидываем, пока не подтвердит
        }
    } catch(e) {
        showStatus("Invalid Login or Password", "white");
        console.error("Login Error:", e.message);
    }
}

// СТАРТ: Включаем вкладку входа
switchTab('login');