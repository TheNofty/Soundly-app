// === 1. ИНИЦИАЛИЗАЦИЯ ===
const tg = window.Telegram.WebApp;
tg.expand(); 

// === 2. ДАННЫЕ ===
const user = tg.initDataUnsafe.user;

const headerAvatar = document.getElementById('user-avatar');
const creditsCount = document.getElementById('user-credits');
const profileBigAvatar = document.getElementById('profile-big-avatar');
const profileUsernameText = document.getElementById('profile-username');

const defaultCredits = 0; 

if (user) {
    if (user.photo_url) {
        headerAvatar.src = user.photo_url;
        profileBigAvatar.src = user.photo_url;
    }
    
    if (user.username) {
        profileUsernameText.innerText = '@' + user.username;
    } else {
        profileUsernameText.innerText = user.first_name;
    }

    loadUserCredits(user.id);
} else {
    // В браузере
    console.log("Browser mode");
    profileUsernameText.innerText = "@User";
    loadUserCredits("test_user_id");
}

function loadUserCredits(userId) {
    const storageKey = `credits_${userId}`;
    let currentCredits = localStorage.getItem(storageKey);
    if (currentCredits === null) {
        currentCredits = defaultCredits;
        localStorage.setItem(storageKey, currentCredits);
    }
    creditsCount.innerText = currentCredits;
}

// === 3. НАВИГАЦИЯ ===

function openPage(btnElement, pageId) {
    if (btnElement) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        btnElement.classList.add('active');
    } else {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    }

    const allPages = document.querySelectorAll('.content-frame');
    allPages.forEach(page => {
        page.style.display = 'none';
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
    }

    const player = document.querySelector('.bottom-player');
    if (pageId === 'page-home' || pageId === 'page-profile') {
        player.style.display = 'none';
    } else {
        player.style.display = 'flex';
    }
}

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
    volFill.style.width = percent + '%';
    volKnob.style.left = percent + '%';
}