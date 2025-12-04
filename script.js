// === 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP ===
const tg = window.Telegram.WebApp;

// Сообщаем телеграму, что приложение готово и разворачиваем его на весь экран
tg.expand(); 

// === 2. РАБОТА С АВАТАРКОЙ И ID ===
// Получаем данные пользователя из Telegram (initDataUnsafe)
const user = tg.initDataUnsafe.user;

// Элементы интерфейса
const avatarImg = document.getElementById('user-avatar');
const creditsCount = document.getElementById('user-credits');

// БАЗА ДАННЫХ (Симуляция)
// Мы будем хранить кредиты привязанными к ID пользователя
const defaultCredits = 0; // Начинаем с нуля

if (user) {
    // 2.1 АВАТАРКА
    // Проверяем, есть ли у пользователя фото в профиле
    if (user.photo_url) {
        avatarImg.src = user.photo_url;
    } else {
        // Если фото нет, ставим дефолтную или генерируем
        // (Сейчас у тебя там уже стоит дефолтная в HTML)
        console.log("У пользователя нет аватарки");
    }

    // 2.2 КРЕДИТЫ ПО ID
    // Вызываем функцию загрузки кредитов для ЭТОГО конкретного ID
    loadUserCredits(user.id);
    
} else {
    // Если мы открыли сайт просто в браузере (не через телеграм)
    console.log("Запущено не в Telegram. Используем тестовые данные.");
    loadUserCredits("test_user_id");
}


// ФУНКЦИЯ: Загрузка/Создание базы кредитов
function loadUserCredits(userId) {
    // Ключ для хранения в памяти: например "credits_12345678"
    const storageKey = `credits_${userId}`;
    
    // Пытаемся достать данные из локальной базы
    let currentCredits = localStorage.getItem(storageKey);
    
    // Если данных нет (пользователь первый раз зашел) -> создаем запись = 0
    if (currentCredits === null) {
        currentCredits = defaultCredits;
        localStorage.setItem(storageKey, currentCredits);
    }
    
    // Обновляем число на экране
    creditsCount.innerText = currentCredits;
    console.log(`User ID: ${userId}, Credits: ${currentCredits}`);
}


// === 3. ИНТЕРФЕЙС (Клики, Громкость) ===

function selectItem(element) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
}

// Громкость
const volContainer = document.getElementById('vol-container');
const volKnob = document.getElementById('vol-knob');
const volFill = document.getElementById('vol-fill');
let isDragging = false;

volContainer.addEventListener('mousedown', function(e) { isDragging = true; updateVolume(e); });
document.addEventListener('mousemove', function(e) { 
    if (isDragging) { updateVolume(e); e.preventDefault(); }
});
document.addEventListener('mouseup', function() { isDragging = false; });

function updateVolume(e) {
    const rect = volContainer.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    
    const percent = (offsetX / rect.width) * 100;
    volFill.style.width = percent + '%';
    volKnob.style.left = percent + '%';
}