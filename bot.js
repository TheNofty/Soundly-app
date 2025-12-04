const TelegramBot = require('node-telegram-bot-api');

// Твой токен (ВНИМАНИЕ: Если создаешь серьезный проект, потом перегенерируй его, так как ты засветил его здесь)
const token = '8445261976:AAGF5B_f9BpE58oTUc9j0MpkQJiqpzZG9IQ';

// Включаем бота с поллингом (проверкой сообщений)
const bot = new TelegramBot(token, {polling: true});

console.log("======================================");
console.log("Бот запускается... Ждем сообщений.");
console.log("======================================");

// 1. Слушаем команду /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;

  console.log(`Получена команда /start от: ${firstName} (ID: ${chatId})`);

  // Отправляем кнопку
  bot.sendMessage(chatId, `Привет, ${firstName}! Запусти приложение Soundly:`, {
    reply_markup: {
      inline_keyboard: [
        [
          // Кнопка Web App
          { text: "🎵 Открыть Soundly", web_app: { url: 'https://thenofty.github.io/Soundly-app/' } }
        ]
      ]
    }
  }).then(() => {
    console.log("Кнопка успешно отправлена.");
  }).catch((error) => {
    console.error("Ошибка при отправке сообщения:", error);
  });
});

// 2. Слушаем ошибки (ВАЖНО: без этого бот молчит при проблемах)
bot.on('polling_error', (error) => {
  console.log("ОШИБКА СОЕДИНЕНИЯ (Polling Error):");
  console.log(error.code);  // Часто бывает ETIMEDOUT или EFATAL
  console.log(error.message);
});