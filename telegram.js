// telegram.js - Интеграция с Telegram

let tg = window.Telegram.WebApp;

// Инициализация Telegram
function initTelegram() {
    console.log("Telegram WebApp инициализирован");
    
    // Показываем основную игру
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe.user;
    
    // Если пользователь авторизован в Telegram
    if (user) {
        console.log("Пользователь:", user);
        
        // Показываем имя пользователя
        const userName = user.first_name || "Игрок";
        document.getElementById('userName').textContent = userName;
        
        // Сохраняем ID пользователя для будущего использования
        window.userId = user.id;
        window.userName = userName;
        
        // Можно изменить имя питомца на имя пользователя
        // petState.name = userName + "чик";
        // document.getElementById('petName').textContent = petState.name;
    }
    
    // Расширяем на весь экран
    tg.expand();
    
    // Меняем цвет фона Telegram
    tg.setHeaderColor("#764ba2");
    tg.setBackgroundColor("#667eea");
    
    // Кнопка "Назад" в Telegram
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        tg.close(); // Закрываем мини-приложение
    });
}

// Функция для отправки данных в Telegram
function sendToTelegram(message) {
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify(message));
        return true;
    }
    return false;
}

// Ждем загрузки Telegram SDK
if (window.Telegram && window.Telegram.WebApp) {
    document.addEventListener('DOMContentLoaded', initTelegram);
} else {
    console.error("Telegram WebApp SDK не загружен");
    // Показываем игру даже вне Telegram (для тестирования)
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
}