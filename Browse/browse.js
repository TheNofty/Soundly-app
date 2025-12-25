// КОНФИГ ПРОВЕРКИ (Добавляй сюда новые папки)
const FOLDER_WHITELIST = ['kicks', 'snares', 'claps', 'hats', 'percs', 'basses', 'loops', 'samples', 'fx'];

async function scanPacks() {
    const packsPath = './Browse/Packs/';
    const grid = document.getElementById('browse-grid');
    
    // В Electron используем fs для чтения папок
    const fs = require('fs');
    const path = require('path');

    const albums = fs.readdirSync(packsPath).filter(file => {
        return fs.statSync(path.join(packsPath, file)).isDirectory();
    });

    grid.innerHTML = ''; // Чистим перед загрузкой

    albums.forEach(albumDir => {
        const fullPath = path.join(packsPath, albumDir);
        const subfolders = fs.readdirSync(fullPath);

        // ПРОВЕРКА: Есть ли хоть одна папка из белого списка?
        const isValid = subfolders.some(folder => FOLDER_WHITELIST.includes(folder.toLowerCase()));

        if (isValid) {
            const bannerPath = path.join(fullPath, 'Banner.png');
            const hasBanner = fs.existsSync(bannerPath);

            // Создаем темплейт карточки
            const card = document.createElement('div');
            card.className = 'pack-card';
            card.innerHTML = `
                <div class="pack-banner" style="background-image: url('${hasBanner ? bannerPath : '../Interface/Icons/default_cover.png'}')"></div>
                <div class="pack-title">${albumDir}</div>
                <div class="pack-author">Soundly Exclusive</div>
            `;
            
            card.onclick = () => openAlbum(albumDir);
            grid.appendChild(card);
        }
    });
}

// Вызов при загрузке страницы
scanPacks();