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

// === 2. ПОМОЩНИКИ ===
function startAnimationAndGo() {
    isManualTransition = true;
    const loader = document.getElementById('simple-loader');
    if (loader) loader.style.display = 'flex';
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

// === 3. РЕГИСТРАЦИЯ (СЛУШАТЕЛЬ УСПЕХА — ОЖИДАНИЕ КЛИКА В ПОЧТЕ) ===
function registerUser() {
    const regBtn = document.querySelector('.auth-btn.outline');
    if (regBtn.disabled) return;
    regBtn.disabled = true;
    regBtn.style.opacity = "0.5";

    const nick = document.getElementById('reg-nick').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;

    if (nick.length < 4 || nick.length > 15) return resetRegBtn("Username: 4-15 chars");
    if (!email.includes("@")) return resetRegBtn("Invalid Email");
    if (pass.length < 6) return resetRegBtn("Password: min 6 chars");

    showStatus("Please confirm the link in your email...", "white");

    // "МАГИЯ" — Эта страница сама залогинит юзера, когда он подтвердит почту в телефоне
    const unsub = db.collection("users").where("email", "==", email).onSnapshot((snap) => {
        if (!snap.empty) {
            unsub(); 
            showStatus("Email confirmed! Logging in...", "white");
            // Автозаполнение и вход
            setTimeout(() => {
                document.getElementById('login-email').value = email;
                document.getElementById('login-pass').value = pass;
                loginUser();
            }, 1000);
        }
    });

    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const botURL = "https://script.google.com/macros/s/AKfycbxGlkrNJNEKggZ1-o03-X2_DlIALy15XSm0mw4flgSVG-TAX2Yt-5Ila28c0u21lkFdOw/exec";

    db.collection("pending_registrations").doc(token).set({
        nick: nick, email: email, pass: pass, time: Date.now()
    }).then(() => {
        fetch(`${botURL}?email=${email}&nick=${nick}&token=${token}`, { mode: 'no-cors' });
    }).catch(() => resetRegBtn("Database Error"));
}

// Хелпер сброса кнопки
function resetRegBtn(msg) {
    const regBtn = document.querySelector('.auth-btn.outline');
    showStatus(msg, "white");
    regBtn.disabled = false;
    regBtn.style.opacity = "1";
}

function resetRegBtn(msg) {
    const regBtn = document.querySelector('.auth-btn.outline');
    showStatus(msg, "white");
    regBtn.disabled = false;
    regBtn.style.opacity = "1";
}

// === 4. ВХОД (БЕЗ ПРОВЕРКИ EMAIL_VERIFIED) ===
async function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return showStatus("Enter email and password", "white");
    
    showStatus("Authorizing...", "white");
    
    try {
        const cred = await auth.signInWithEmailAndPassword(email, pass);
        const currentUser = cred.user;

        // Если вошел — проверяем наличие карточки в БД
        const doc = await db.collection("users").doc(currentUser.uid).get();

        if (doc.exists) {
            showStatus("Success!", "white");
            startAnimationAndGo(); 
        } else {
            // Если в Auth есть, а в базе нет — значит косяк регистрации
            showStatus("Profile not found. Support required.", "red");
        }
    } catch(e) {
        showStatus("Invalid Login or Password", "white");
        console.error("Login Error:", e.message);
    }
}

// СТАРТ: Включаем вкладку входа
switchTab('login');