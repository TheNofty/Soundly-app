const TelegramBot = require('node-telegram-bot-api');

// В кавычки ниже нужно будет вставить ваш Токен от BotFather
const token = '8445261976:AAGF5B_f9BpE58oTUc9j0MpkQJiqpzZG9IQ';

// Включаем бота
const bot = new TelegramBot(token, {polling: true});

// Когда бот получает сообщение /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Бот отправляет сообщение с кнопкой
  bot.sendMessage(chatId, 'Привет! Запусти мое приложение:', {
    reply_markup: {
      inline_keyboard: [
        [
          // Здесь мы создаем кнопку Web App
          // ПОКА вставим просто сайт Telegram, чтобы проверить кнопку
          // Позже заменим это на ваше приложение
          { text: "Открыть окно", web_app: { url: 'https://thenofty.github.io/Soundly-app/' } }
        ]
      ]
    }
  });
});

console.log("Бот запущен...");