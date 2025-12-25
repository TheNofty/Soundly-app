// КОНФИГ ПРОВЕРКИ (Добавляй сюда новые папки)
const FOLDER_WHITELIST = ['kicks', 'snares', 'claps', 'hats', 'percs', 'basses', 'loops', 'samples', 'fx'];

async function scanPacks() {
    const fs = require('fs');
    const path = require('path');
    
    // Скрипт в папке Browse, значит Packs — это его «сосед»
    // Ссылка из корня (index.html) в папку Browse/Packs
    const packsPath = path.join(__dirname, 'Browse', 'Packs');
    const grid = document.getElementById('browse-grid');

    console.log("[DEBUG] Сканирую папку:", packsPath);

    if (!fs.existsSync(packsPath)) {
        console.error("[CRITICAL] Папка Packs не найдена по пути:", packsPath);
        return;
    }

    const albums = fs.readdirSync(packsPath).filter(file => {
        return fs.statSync(path.join(packsPath, file)).isDirectory();
    });
    // ... и так далее до конца функции ...
}

// Вызов при загрузке страницы
scanPacks();