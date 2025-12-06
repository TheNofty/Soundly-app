// === СКРИПТ БЛОКИРОВКИ МОБИЛЬНЫХ ===
(function() {
    // Получаем данные от Телеграма
    const tg = window.Telegram.WebApp;
    const platform = tg.platform; // ios, android, tdesktop, weba и т.д.

    console.log("Current platform:", platform);

    // Список платформ, которые мы БЛОКИРУЕМ
    const blockedPlatforms = ['android', 'android_x', 'ios'];

    // Если текущая платформа в черном списке
    if (blockedPlatforms.includes(platform)) {
        
        // 1. Создаем экран блокировки
        const blocker = document.createElement('div');
        blocker.style.position = 'fixed';
        blocker.style.top = '0';
        blocker.style.left = '0';
        blocker.style.width = '100%';
        blocker.style.height = '100%';
        blocker.style.backgroundColor = '#000000'; // Черный фон
        blocker.style.color = '#FFFFFF';
        blocker.style.zIndex = '999999'; // Поверх всего вообще
        blocker.style.display = 'flex';
        blocker.style.flexDirection = 'column';
        blocker.style.alignItems = 'center';
        blocker.style.justifyContent = 'center';
        blocker.style.fontFamily = 'sans-serif';
        
        // 2. Добавляем текст и иконку
        blocker.innerHTML = `
            <div style="font-size: 50px; margin-bottom: 20px;">🖥️</div>
            <h2 style="margin: 0 0 10px 0;">Desktop Only</h2>
            <p style="color: #888; text-align: center;">This app is designed for PC.<br>Please open it on your computer.</p>
        `;

        // 3. Добавляем в тело страницы (перекрывая всё)
        document.body.appendChild(blocker);
        
        // На всякий случай останавливаем прокрутку
        document.body.style.overflow = 'hidden';
    }
})();