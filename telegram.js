// telegram.js - минимальная версия
console.log("Telegram SDK загружается...");

let tg = window.Telegram?.WebApp;

function initTelegram() {
    if (tg) {
        console.log("Telegram найден");
        tg.expand();
        
        if (tg.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            console.log("Пользователь:", user.first_name);
        }
    }
    
    // Показываем игру
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // Запускаем игру
    if (typeof initGame === 'function') {
        setTimeout(initGame, 100);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initTelegram, 100);
});