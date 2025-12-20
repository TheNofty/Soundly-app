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

// === ФУНКЦИЯ УСТАНОВКИ КАРТИНКИ (СТАБИЛЬНАЯ) ===
function setAvatarOnPage(id) {
    if (!id) return;
    const finalSrc = `Interface/Icons/Profile/Avatar/Avatar${id}.png`;
    
    const hImg = document.getElementById('user-avatar');
    const pImg = document.getElementById('profile-big-avatar');

    // Если картинка уже стоит такая же — не трогаем (защита от моргания)
    if (hImg && hImg.getAttribute('src') !== finalSrc) hImg.src = finalSrc;
    if (pImg && pImg.getAttribute('src') !== finalSrc) pImg.src = finalSrc;
}

// === 🚀 1. МГНОВЕННАЯ ЗАГРУЗКА ИЗ ПАМЯТИ ===
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

// === 3. УМНЫЙ СТАРТ: ПРОВЕРКА АККАУНТА + ШРИФТОВ ===
auth.onAuthStateChanged((user) => {
    if (!user) return goLogin();

    // 🚀 СИНХРОННО ЖДЕМ ДАННЫЕ И ШРИФТЫ
    Promise.all([
        db.collection("users").doc(user.uid).get(), 
        document.fonts.ready
    ]).then(([doc]) => {
        if (!doc.exists) return console.log("Soundly: Waiting profile...");
        const data = doc.data();
        
        // 1. ВСТАВЛЯЕМ ДАННЫЕ (Пока всё еще невидимо)
        const crLabel = document.getElementById('user-credits');
        const niLabel = document.getElementById('profile-username');
        if (crLabel) crLabel.innerText = data.credits || 0;
        if (niLabel) niLabel.innerText = data.nickname ? "@" + data.nickname : "@User";
        setAvatarOnPage(data.avatar_id || 1);

        // 2. ОТКРЫВАЕМ «ЗАБОР» (Свет + Клик)
        const header = document.querySelector('.top-header');
        const container = document.querySelector('.middle-container');
        
        if (header && container) {
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto'; // РАЗРЕШИТЬ КЛИКАТЬ
            
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto'; // РАЗРЕШИТЬ КЛИКАТЬ
        }

        openPage(null, 'page-home');

        // 3. ТИХИЙ СЛУШАТЕЛЬ БАНА (Для фона)
        db.collection("users").doc(user.uid).onSnapshot(s => {
            const upd = s.data();
            if(!upd) return;
            if (upd.subscription === "banned") {
                document.getElementById('ban-screen-overlay').style.display = 'flex';
                document.getElementById('ban-date-text').innerText = "до " + (upd.ban_expires || "...");
            } else {
                if (crLabel) crLabel.innerText = upd.credits || 0;
            }
        });
    }).catch(() => goLogin());
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

    // === 5. БЛОКИРОВКА ЛОГОТИПА ===
    const logoDiv = document.getElementById('home-logo');
    
    if (logoDiv) {
        if (pageId === 'page-home') {
            // Если мы на главной — вешаем замок
            logoDiv.classList.add('locked');
        } else {
            // Если ушли с главной — снимаем замок
            logoDiv.classList.remove('locked');
        }
    }

    // === ЛОГИКА ЛОГОТИПА (Вставь это в конец openPage) ===
    const logoBtn = document.getElementById('header-logo-btn');
    if (logoBtn) {
        if (pageId === 'page-home') {
            logoBtn.classList.add('locked'); // Если мы на Home -> Блочим
        } else {
            logoBtn.classList.remove('locked'); // Иначе -> Разблочим
        }
    }

} // <--- Это конец функции openPage


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

// === ПЕРЕХОД НА ОПЛАТУ (УСКОРЕННАЯ - QR УЖЕ В HTML) ===
function goToCheckoutPage() {
    closeModal(); 
    
    // 1. БЕРЕМ ДАННЫЕ
    const activeCard = document.querySelector('.pay-option-card.active');
    const planNameText = document.getElementById('modal-title-text').innerText;
    const currentNick = document.getElementById('profile-username').innerText;

    let priceText = "0 ₽";
    let periodText = "мес";
    
    if (activeCard) {
        priceText = activeCard.querySelector('.pay-price').innerText;
        periodText = activeCard.querySelector('.pay-period').innerText;
    }
    
    // 2. ВСТАВЛЯЕМ В ЧЕК
    document.getElementById('chk-plan-name').innerText = planNameText;
    document.getElementById('chk-sum').innerText = priceText;
    document.getElementById('chk-period').innerText = "/ " + periodText;
    
    // 3. ВСТАВЛЯЕМ В ИНСТРУКЦИЮ
    document.getElementById('inst-sum').innerText = priceText; 
    document.getElementById('inst-nick').innerText = currentNick;
    
    // ПУНКТ С ГЕНЕРАЦИЕЙ QR УДАЛЕН.
    // ОН ТЕПЕРЬ СТОИТ В HTML И ГРУЗИТСЯ МГНОВЕННО ПРИ ВХОДЕ.

    // 4. ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
    document.querySelectorAll('.content-frame').forEach(p => p.style.display = 'none');
    const pl = document.querySelector('.bottom-player'); 
    if(pl) pl.style.display = 'none';
    
    const chkPage = document.getElementById('page-checkout');
    if (chkPage) chkPage.style.display = 'flex';
}

// === 6. УНИВЕРСАЛЬНАЯ ЛОГИКА КНОПОК ЛОГОТИПА (БЕЗ ПЕРЕЗАГРУЗКИ) ===
function initLogoButtons() {
    const allLogos = document.querySelectorAll('.logo-click-zone');
    
    allLogos.forEach(button => {
        button.onclick = function() {
            // МЕНЯЕМ reload НА ПЛАВНЫЙ ПЕРЕХОД ДОМОЙ
            openPage(null, 'page-home');
        };
    });
}

// Запускаем функцию поиска кнопок
initLogoButtons();

// === АВТОСТАРТ (Загружаем Главную и убираем выделение кнопок) ===
openPage(null, 'page-home');

// === ЛОГИКА АВАТАРОК ===
const avatarOverlay = document.getElementById('avatar-overlay');

function openAvatarModal() { if(avatarOverlay) avatarOverlay.style.display = 'flex'; }
function closeAvatarModal() { if(avatarOverlay) avatarOverlay.style.display = 'none'; }

// === ОБНОВЛЕННАЯ ФУНКЦИЯ СМЕНЫ (С ПРИНУДИТЕЛЬНЫМ ОБНОВЛЕНИЕМ) ===
function changeMyAvatar(id) {
    closeAvatarModal();

    // 🚀 ОПТИМИСТИЧНЫЙ UI: Сначала меняем на экране, потом в базе
    setAvatarOnPage(id); 
    localStorage.setItem('soundly_my_avatar_id', id);

    const u = auth.currentUser;
    if(u) {
        // База обновляется в фоне, юзер не ждет ответа от серверов Google
        db.collection("users").doc(u.uid).update({ avatar_id: id })
        .catch(err => console.error("Ошибка сохранения:", err));
    }
}

// === ПОМОЩНИК: СКРЫТИЕ/ПОКАЗ САЙТА (ЗАЩИТА ОТ МИГАНИЯ) ===
function toggleSiteContent(show) {
    const mainUI = document.querySelector('.middle-container');
    const headUI = document.querySelector('.top-header');
    
    // Если true -> flex, иначе -> none (скрыть)
    const displayVal = show ? 'flex' : 'none'; 
    
    if(mainUI) mainUI.style.display = displayVal;
    if(headUI) headUI.style.display = displayVal;
    
    // Плеер отдельно, так как у него может быть свой стиль
    const playUI = document.querySelector('.bottom-player');
    if (playUI) playUI.style.display = show ? 'flex' : 'none';
}

// === ПОМОЩНИК: ПРОВЕРКА ДАТЫ (ИСТЕК ЛИ БАН?) ===
function checkBanExpired(dateStr) {
    if (!dateStr || dateStr === "PERMANENT") return false; 
    try {
        // Парсим твою дату: "15.12.2025 18:58"
        // RegExp достает цифры: [15, 12, 2025, 18, 58]
        let p = dateStr.match(/\d+/g); 
        if(!p || p.length < 5) return false;
        
        // Месяц в JS с нуля (0-11), поэтому p[1]-1
        const banEnd = new Date(p[2], p[1]-1, p[0], p[3], p[4]);
        const now = new Date();

        // Если текущее время больше даты бана -> TRUE (бан истек)
        return now > banEnd; 
    } catch(e) { return false; }
}