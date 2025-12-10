// ===============================================
// 1. ИНИЦИАЛИЗАЦИЯ + МГНОВЕННАЯ АВАТАРКА
// ===============================================
const firebaseConfig = {
  apiKey: "AIzaSyBDPN0hk9ZZbOdeHirFz2z_M8XGmNMpPVk",
  authDomain: "soundly-e318d.firebaseapp.com",
  projectId: "soundly-e318d",
  storageBucket: "soundly-e318d.firebasestorage.app",
  messagingSenderId: "452438627644",
  appId: "1:452438627644:web:62bdebcad4b145e3883a39",
  measurementId: "G-WCWCY793Z9"
};

try { firebase.initializeApp(firebaseConfig); } catch (e) {}

const auth = firebase.auth();
const db = firebase.firestore();

// ПУТЬ К КАРТИНКАМ
const AVATAR_PATH_FIX = "Interface/Icons/Profile/Avatar/Avatar"; 

// === ФУНКЦИЯ УСТАНОВКИ КАРТИНКИ (Чтобы не дублировать код) ===
function setAvatarOnPage(id) {
    if (!id) return;
    const finalSrc = `${AVATAR_PATH_FIX}${id}.png`;
    
    // Меняем в шапке
    const hImg = document.getElementById('user-avatar');
    if (hImg) hImg.src = finalSrc;

    // Меняем в профиле
    const pImg = document.getElementById('profile-big-avatar');
    if (pImg) pImg.src = finalSrc;
}

// === 🚀 1. МГНОВЕННАЯ ЗАГРУЗКА ИЗ ПАМЯТИ (ДО ИНТЕРНЕТА) ===
// Это убирает задержку. Браузер сразу ставит последнюю известную аватарку.
const cachedAva = localStorage.getItem('soundly_my_avatar_id');
if (cachedAva) {
    setAvatarOnPage(cachedAva);
}


// === 2. ФУНКЦИЯ "ПИНОК" ===
function goLogin() {
    console.log("Доступ закрыт. Выход...");
    auth.signOut().then(() => {
        window.location.href = "Soundly_Auth/auth.html";
    });
}

// === 3. ПОЛНАЯ ЗАГРУЗКА ИЗ БАЗЫ (СИНХРОНИЗАЦИЯ) ===
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection("users").doc(user.uid).onSnapshot(
            (doc) => {
                if (doc.exists) {
                    const data = doc.data();

                    // 1. ТЕКСТЫ (Кредиты / Ник)
                    const crLabel = document.getElementById('user-credits');
                    const niLabel = document.getElementById('profile-username');
                    
                    if (crLabel) crLabel.innerText = data.credits || 0;
                    if (niLabel) niLabel.innerText = data.nickname ? "@" + data.nickname : "@User";

                    // 2. АВАТАРКА (С обновлением памяти)
                    const serverId = data.avatar_id || 1;
                    
                    // Если то, что в базе отличается от памяти — обновляем и память
                    if (serverId != cachedAva) {
                        localStorage.setItem('soundly_my_avatar_id', serverId);
                        setAvatarOnPage(serverId);
                    }
                
                } else {
                    goLogin(); // Нет дока — удален
                }
            },
            (error) => {
                goLogin(); // Ошибка доступа — удален
            }
        );
    } else {
        goLogin(); // Гость — выход
    }
});

// Функция пинка
function goLogin() {
    auth.signOut().then(() => {
        window.location.href = "Soundly_Auth/auth.html";
    });
}

// ===============================================

// === 0. НАСТРОЙКА ЦЕН И СКИДОК ===
const APP_CONFIG = {
    // Впиши сюда цену за 1 месяц (например 990)
    Prices: {
        'Starter': 590, 
        'Pro': 990, 
        'Elite': 1990 
    },
    
    // Скидка в процентах (20)
    DiscountPercent: 20, 
    
    // Валюта (с пробелом)
    Currency: ' ₽',

    // Тексты
    ModalTitle: 'Период оплаты',  
    TxtYearSave: 'экономия'       
};


// === 1. ИНИЦИАЛИЗАЦИЯ ===
const tg = window.Telegram.WebApp;
tg.expand(); 

// === 2. ДАННЫЕ ЮЗЕРА ===
const user = tg.initDataUnsafe.user;
// Строку с const avatarImg... можно оставить или удалить, она тут больше не нужна
const creditsCount = document.getElementById('user-credits');
const profileUsernameText = document.getElementById('profile-username');
const defaultCredits = 0; 

if (user) {
    // !!! ВОТ ТУТ МЫ УДАЛИЛИ БЛОК user.photo_url !!!
    // Потому что теперь аватаркой управляет только твой Firebase скрипт выше.
    
    // Имя пользователя оставляем (это полезно)
    if(profileUsernameText) {
        if (user.username) profileUsernameText.innerText = '@' + user.username;
        else profileUsernameText.innerText = user.first_name;
    }

    loadUserCredits(user.id);
} else {
    // Тест (Browser mode)
    console.log("Browser mode");
    // Тут тоже имя ставится нашим скриптом Firebase, так что эту заглушку можно не трогать, она не мешает.
    loadUserCredits("test_user_id");
}

// Запускаем обновление цен на странице Plans
updatePlanPricesOnPage();

function loadUserCredits(userId) {
    const storageKey = `credits_${userId}`;
    let currentCredits = localStorage.getItem(storageKey);
    if (currentCredits === null) {
        currentCredits = defaultCredits;
        localStorage.setItem(storageKey, currentCredits);
    }
    if(creditsCount) creditsCount.innerText = currentCredits;
}


// === 3. НАВИГАЦИЯ ===
function openPage(btnElement, pageId) {
    // 1. Управление подсветкой кнопок
    if (btnElement) {
        // Если нажали на Кнопку меню -> Сбрасываем старую, подсвечиваем новую
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        btnElement.classList.add('active');
    } else {
        // Если нажали Логотип (btnElement == null) -> УБИРАЕМ подсветку со всех кнопок
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    }

    // 2. Скрываем все страницы
    const allPages = document.querySelectorAll('.content-frame');
    allPages.forEach(page => { page.style.display = 'none'; });

    // 3. Открываем нужную
    const targetPage = document.getElementById(pageId);
    if (targetPage) { targetPage.style.display = 'block'; }

    // 4. Логика плеера (Скрываем на главной)
    const player = document.querySelector('.bottom-player');
    if (player) {
        if (pageId === 'page-home' || pageId === 'page-profile' || pageId === 'page-plans') {
            player.style.display = 'none';
        } else {
            player.style.display = 'flex';
        }
    }
}


// === 4. КАЛЬКУЛЯТОР МОДАЛЬНОГО ОКНА ===
const modalOverlay = document.getElementById('payment-overlay');

function fmtPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + APP_CONFIG.Currency;
}

// Обновление карточек тарифов (на самой странице)
function updatePlanPricesOnPage() {
    for (let plan in APP_CONFIG.Prices) {
        const priceEl = document.getElementById(`price-${plan}`);
        if (priceEl) {
            let cost = APP_CONFIG.Prices[plan];
            priceEl.innerHTML = `${fmtPrice(cost)}<span class="plan-period">/MO</span>`;
        }
    }
}

// Открытие модалки с пересчетом
function openCheckout(planName) {
    const titleEl = document.getElementById('modal-title-text');
    const subtitleEl = document.getElementById('modal-subtitle-text');
    const priceMonthEl = document.getElementById('price-val-month');
    const priceYearEl = document.getElementById('price-val-year');
    const saveTextEl = document.getElementById('save-val-year');

    if (!modalOverlay) return;

    // 1. Считаем
    let pMonth = APP_CONFIG.Prices[planName] || 0;
    
    let pYearRaw = pMonth * 12;
    let pYearDisc = pYearRaw - (pYearRaw * (APP_CONFIG.DiscountPercent / 100));
    let savings = pYearRaw - pYearDisc;

    pYearDisc = Math.round(pYearDisc);
    savings = Math.round(savings);

    // 2. Пишем в HTML
    if (titleEl) titleEl.innerText = planName; 
    if (subtitleEl) subtitleEl.innerText = APP_CONFIG.ModalTitle; 
    
    if (priceMonthEl) priceMonthEl.innerText = fmtPrice(pMonth);
    if (priceYearEl) priceYearEl.innerText = fmtPrice(pYearDisc);
    if (saveTextEl) saveTextEl.innerText = APP_CONFIG.TxtYearSave + " " + fmtPrice(savings);

    // 3. Показываем
    modalOverlay.style.display = 'flex';
    
    // Сброс активного выбора
    document.querySelectorAll('.pay-option-card').forEach(el => el.classList.remove('active'));
    document.querySelector('.pay-option-card').classList.add('active'); // 1-я карта по дефолту
}

function closeModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
}

function selectPay(element) {
    document.querySelectorAll('.pay-option-card').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
}


// === 5. ПЛЕЕР ===
const volContainer = document.getElementById('vol-container');
const volKnob = document.getElementById('vol-knob');
const volFill = document.getElementById('vol-fill');
let isDragging = false;

if (volContainer) {
    volContainer.addEventListener('mousedown', function(e) { isDragging = true; updateVolume(e); });
    document.addEventListener('mousemove', function(e) { 
        if (isDragging) { updateVolume(e); e.preventDefault(); }
    });
    document.addEventListener('mouseup', function() { isDragging = false; });
}

function updateVolume(e) {
    const rect = volContainer.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    const percent = (offsetX / rect.width) * 100;
    if(volFill) volFill.style.width = percent + '%';
    if(volKnob) volKnob.style.left = percent + '%';
}

// Переход на страницу оплаты
function goToCheckoutPage() {
    // 1. Закрываем окно выбора
    const modal = document.getElementById('payment-overlay');
    if (modal) modal.style.display = 'none';

    // 2. Открываем белую страницу
    const checkoutPage = document.getElementById('page-checkout');
    if (checkoutPage) {
        checkoutPage.style.display = 'flex';
    }
}

// === 6. УНИВЕРСАЛЬНАЯ ЛОГИКА КНОПОК ЛОГОТИПА (Аналог GetDescendants) ===
// Этот код находит ВСЕ кнопки логотипа на любой странице и заставляет их работать
function initLogoButtons() {
    // Находим все элементы с классом зоны клика
    const allLogos = document.querySelectorAll('.logo-click-zone');
    
    // Проходимся по каждому найденному (foreach)
    allLogos.forEach(button => {
        // Вешаем событие "клик"
        button.onclick = function() {
            // Действие: Полная перезагрузка приложения (Вернуться в начало)
            window.location.reload();
        };
    });
}

// Запускаем функцию поиска кнопок
initLogoButtons();

// === АВТОСТАРТ (Загружаем Главную и убираем выделение кнопок) ===
openPage(null, 'page-home');