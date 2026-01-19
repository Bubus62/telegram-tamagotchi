// game.js - Логика игры с Telegram интеграцией
// Версия 2.0 с Telegram поддержкой

// ==================== 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
// Состояние питомца (все данные об игре хранятся здесь)
let petState = {
    name: "Бобик",          // Имя питомца
    hunger: 70,             // Голод (0-100%)
    mood: 50,               // Настроение (0-100%)
    energy: 90,             // Энергия (0-100%)
    coins: 10,              // Монетки (валюта)
    level: 1,               // Уровень игрока
    xp: 0,                  // Опыт (0-100 для следующего уровня)
    userId: null,           // ID пользователя Telegram (будет заполнено позже)
    lastSave: null          // Время последнего сохранения
};

// ==================== 2. ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ====================
// Эта функция запускается при загрузке страницы
function initGame() {
    console.log("Игра инициализируется...");
    
    // Проверяем, есть ли Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        console.log("Telegram обнаружен!");
        const tg = window.Telegram.WebApp;
        
        // Если пользователь авторизован в Telegram
        if (tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            petState.userId = user.id;
            console.log("User ID установлен:", petState.userId);
            
            // Меняем имя питомца на имя пользователя
            const userName = user.first_name || "Игрок";
            petState.name = userName + "чик";
            document.getElementById('petName').textContent = petState.name;
        }
        
        // Загружаем сохранение
        loadGame();
    } else {
        console.log("Telegram не обнаружен, работаем в тестовом режиме");
        // Вне Telegram тоже загружаем сохранение (из localStorage)
        loadGame();
    }
    
    // Обновляем интерфейс
    updateUI();
    
    // Запускаем фоновые процессы
    startBackgroundProcesses();
}

// ==================== 3. СИСТЕМА СОХРАНЕНИЯ ====================
// Функция сохранения игры
function saveGame() {
    console.log("Сохранение игры...");
    
    // Добавляем время сохранения
    petState.lastSave = new Date().toISOString();
    
    // Способ 1: Если мы в Telegram, отправляем данные в бота
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        if (tg.sendData) {
            const saveData = {
                action: "save_game",
                userId: petState.userId,
                petState: petState,
                timestamp: Date.now()
            };
            
            // Отправляем данные в бота (будет обработано на сервере)
            tg.sendData(JSON.stringify(saveData));
            console.log("Данные отправлены в Telegram");
            showEffect('💾 Сохранено в облако!');
            return true;
        }
    }
    
    // Способ 2: Если не в Telegram, сохраняем в localStorage браузера
    try {
        localStorage.setItem('tamagotchi_save_v2', JSON.stringify(petState));
        console.log("Данные сохранены в localStorage");
        showEffect('💾 Сохранено локально');
        return true;
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        showEffect('❌ Ошибка сохранения');
        return false;
    }
}

// Функция загрузки игры
function loadGame() {
    console.log("Загрузка сохранения...");
    
    // Сначала пробуем загрузить из Telegram (если есть)
    if (window.Telegram && window.Telegram.WebApp) {
        // В реальном приложении здесь будет запрос к серверу
        // Сейчас просто показываем сообщение
        showEffect('📂 Загрузка из облака...');
    }
    
    // Пробуем загрузить из localStorage (для тестов и вне Telegram)
    try {
        const savedData = localStorage.getItem('tamagotchi_save_v2');
        if (savedData) {
            const loadedState = JSON.parse(savedData);
            
            // Проверяем, что сохранение соответствует текущему пользователю
            // (или если пользователь не авторизован, грузим любое сохранение)
            if (!petState.userId || loadedState.userId === petState.userId) {
                // Обновляем состояние, но сохраняем текущий userId
                const currentUserId = petState.userId;
                Object.assign(petState, loadedState);
                petState.userId = currentUserId || loadedState.userId;
                
                console.log("Игра загружена из localStorage");
                showEffect('✅ Загрузка завершена!');
                
                // Показываем когда было последнее сохранение
                if (petState.lastSave) {
                    const lastSaveDate = new Date(petState.lastSave);
                    console.log("Последнее сохранение:", lastSaveDate.toLocaleString());
                }
            }
        }
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        showEffect('❌ Ошибка загрузки');
    }
}

// ==================== 4. ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ====================
// Функция кормления питомца
function feed() {
    console.log("Кормление питомца...");
    
    // Проверяем, можно ли покормить
    if (petState.hunger < 100) {
        // Увеличиваем голод, уменьшаем энергию
        petState.hunger += 20;
        petState.energy -= 5;
        
        // Не даем выйти за пределы 0-100
        if (petState.hunger > 100) petState.hunger = 100;
        if (petState.energy < 0) petState.energy = 0;
        
        // Добавляем опыт
        addXP(3);
        
        // Обновляем интерфейс
        updateUI();
        
        // Показываем эффект
        showEffect('🍗 +20 к голоду, +3 XP');
        
        // Автосохранение
        saveGame();
        
        return true;
    } else {
        showEffect('😋 Питомец уже сыт!');
        return false;
    }
}

// Функция игры с питомцем
function play() {
    console.log("Игра с питомцем...");
    
    // Проверяем, достаточно ли энергии
    if (petState.energy > 20) {
        // Улучшаем настроение, тратим энергию и голод
        petState.mood += 25;
        petState.energy -= 15;
        petState.hunger -= 10;
        
        // Не даем выйти за пределы
        if (petState.mood > 100) petState.mood = 100;
        if (petState.energy < 0) petState.energy = 0;
        if (petState.hunger < 0) petState.hunger = 0;
        
        // Добавляем опыт и монетки
        addXP(5);
        earnCoins(2);
        
        // Обновляем интерфейс
        updateUI();
        
        // Показываем эффект
        showEffect('🎮 +25 к настроению, +5 XP, +2 монеты');
        
        // Автосохранение
        saveGame();
        
        return true;
    } else {
        showEffect('😴 Питомец слишком устал!');
        return false;
    }
}

// Функция сна (восстановление энергии)
function sleep() {
    console.log("Питомец спит...");
    
    // Восстанавливаем энергию, уменьшаем голод и настроение
    petState.energy += 40;
    petState.hunger -= 15;
    petState.mood -= 5;
    
    // Не даем выйти за пределы
    if (petState.energy > 100) petState.energy = 100;
    if (petState.hunger < 0) petState.hunger = 0;
    if (petState.mood < 0) petState.mood = 0;
    
    // Добавляем опыт
    addXP(2);
    
    // Обновляем интерфейс
    updateUI();
    
    // Показываем эффект
    showEffect('💤 +40 к энергии, +2 XP');
    
    // Автосохранение
    saveGame();
    
    return true;
}

// ==================== 5. СИСТЕМА ПРОГРЕССА ====================
// Добавление опыта
function addXP(amount) {
    petState.xp += amount;
    
    // Проверяем, достигли ли нового уровня
    while (petState.xp >= 100) {
        petState.level += 1;
        petState.xp -= 100;
        
        // Награда за уровень
        const coinsReward = petState.level * 10;
        petState.coins += coinsReward;
        
        // Показываем сообщение о новом уровне
        showLevelUpMessage(petState.level, coinsReward);
        
        console.log(`Новый уровень: ${petState.level}, награда: ${coinsReward} монет`);
    }
}

// Сообщение о повышении уровня
function showLevelUpMessage(level, coins) {
    // Создаем красивый popup
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            border-radius: 20px;
            z-index: 9999;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: bounce 0.5s;
            max-width: 80%;
        ">
            <h2 style="margin: 0 0 15px 0; font-size: 28px;">🎉 УРОВЕНЬ ${level}! 🎉</h2>
            <p style="font-size: 18px; margin-bottom: 20px;">Поздравляем с достижением!</p>
            <div style="font-size: 24px; font-weight: bold;">
                🪙 +${coins} монет
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 10px 25px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
            ">Отлично!</button>
        </div>
    `;
    
    // Добавляем стиль для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            70% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    // Автоматически убираем через 5 секунд
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}

// Заработок монеток
function earnCoins(amount) {
    const oldCoins = petState.coins;
    petState.coins += amount;
    console.log(`Монеты: ${oldCoins} -> ${petState.coins} (+${amount})`);
}

// ==================== 6. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ====================
// Главная функция обновления интерфейса
function updateUI() {
    console.log("Обновление интерфейса...");
    
    // 1. Обновляем шкалы (бары)
    document.getElementById('hungerBar').style.width = petState.hunger + '%';
    document.getElementById('moodBar').style.width = petState.mood + '%';
    document.getElementById('energyBar').style.width = petState.energy + '%';
    
    // 2. Обновляем текстовые значения
    document.getElementById('hungerText').textContent = petState.hunger + '%';
    document.getElementById('moodText').textContent = petState.mood + '%';
    document.getElementById('energyText').textContent = petState.energy + '%';
    document.getElementById('coins').textContent = petState.coins;
    document.getElementById('level').textContent = petState.level;
    document.getElementById('xp').textContent = petState.xp;
    
    // 3. Обновляем эмоцию питомца в зависимости от состояния
    updatePetEmotion();
    
    // 4. Обновляем цвет шкал в зависимости от значений
    updateBarColors();
}

// Обновление эмоции питомца
function updatePetEmotion() {
    const petElement = document.getElementById('pet');
    
    if (petState.hunger < 20) {
        petElement.textContent = '😫'; // Очень голоден
    } else if (petState.mood < 20) {
        petElement.textContent = '😠'; // Плохое настроение
    } else if (petState.energy < 20) {
        petElement.textContent = '😴'; // Очень устал
    } else if (petState.hunger > 80 && petState.mood > 80 && petState.energy > 80) {
        petElement.textContent = '🤩'; // Идеальное состояние
    } else if (petState.mood > 70) {
        petElement.textContent = '😁'; // Хорошее настроение
    } else if (petState.hunger > 70) {
        petElement.textContent = '😋'; // Сытый
    } else {
        petElement.textContent = '😊'; // Нормальное состояние
    }
}

// Обновление цветов шкал
function updateBarColors() {
    const hungerBar = document.getElementById('hungerBar');
    const moodBar = document.getElementById('moodBar');
    const energyBar = document.getElementById('energyBar');
    
    // Голод: зеленый -> желтый -> красный
    if (petState.hunger > 50) hungerBar.style.background = '#4CAF50'; // Зеленый
    else if (petState.hunger > 20) hungerBar.style.background = '#FFC107'; // Желтый
    else hungerBar.style.background = '#F44336'; // Красный
    
    // Настроение: синий -> фиолетовый -> розовый
    if (petState.mood > 50) moodBar.style.background = '#2196F3'; // Синий
    else if (petState.mood > 20) moodBar.style.background = '#9C27B0'; // Фиолетовый
    else moodBar.style.background = '#E91E63'; // Розовый
    
    // Энергия: оранжевый -> желтый -> зеленый
    if (petState.energy > 50) energyBar.style.background = '#FF9800'; // Оранжевый
    else if (petState.energy > 20) energyBar.style.background = '#FFEB3B'; // Желтый
    else energyBar.style.background = '#8BC34A'; // Зеленый
}

// ==================== 7. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
// Показать эффект (всплывающее сообщение)
function showEffect(text) {
    const effect = document.createElement('div');
    effect.textContent = text;
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        z-index: 1000;
        font-weight: bold;
        font-size: 18px;
        text-align: center;
        animation: floatUp 1s ease-out forwards;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            20% { opacity: 1; transform: translate(-50%, -50px); }
            80% { opacity: 1; transform: translate(-50%, -80px); }
            100% { opacity: 0; transform: translate(-50%, -100px); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(effect);
    
    // Удаляем через 1 секунду
    setTimeout(() => {
        if (effect.parentElement) {
            effect.remove();
        }
        if (style.parentElement) {
            style.remove();
        }
    }, 1000);
}

// Запуск фоновых процессов
function startBackgroundProcesses() {
    console.log("Запуск фоновых процессов...");
    
    // Процесс 1: Постепенное уменьшение показателей (каждые 30 секунд)
    setInterval(() => {
        petState.hunger -= 2;
        petState.mood -= 1;
        petState.energy -= 1;
        
        // Не даем упасть ниже 0
        if (petState.hunger < 0) petState.hunger = 0;
        if (petState.mood < 0) petState.mood = 0;
        if (petState.energy < 0) petState.energy = 0;
        
        updateUI();
        
        // Автосохранение каждую минуту
        if (Math.random() < 0.3) { // 30% шанс на автосохранение
            saveGame();
        }
    }, 30000); // 30 секунд
    
    // Процесс 2: Периодические уведомления
    setInterval(() => {
        if (petState.hunger < 30) {
            showEffect('⚠️ Питомец голоден!');
        }
        if (petState.mood < 30) {
            showEffect('⚠️ Питомцу скучно!');
        }
        if (petState.energy < 30) {
            showEffect('⚠️ Питомец устал!');
        }
    }, 60000); // 1 минута
    
    console.log("Фоновые процессы запущены");
}

// ==================== 8. ТЕСТИРОВАНИЕ TELEGRAM ====================
// Функция для тестирования Telegram интеграции
function testTelegram() {
    const statusElement = document.getElementById('telegramStatus');
    
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe.user;
        
        let statusHTML = '<strong>✅ Telegram WebApp подключен!</strong><br>';
        statusHTML += `Платформа: <code>${tg.platform}</code><br>`;
        statusHTML += `Версия: <code>${tg.version}</code><br>`;
        
        if (user) {
            statusHTML += `<hr>`;
            statusHTML += `👤 <strong>Пользователь:</strong><br>`;
            statusHTML += `ID: <code>${user.id}</code><br>`;
            statusHTML += `Имя: ${user.first_name || 'Не указано'}<br>`;
            if (user.username) statusHTML += `@${user.username}<br>`;
            if (user.language_code) statusHTML += `Язык: ${user.language_code}<br>`;
        } else {
            statusHTML += `<hr>`;
            statusHTML += `👤 <strong>Пользователь не авторизован</strong><br>`;
            statusHTML += `(Откройте игру через бота в Telegram)`;
        }
        
        statusHTML += `<hr>`;
        statusHTML += `<button onclick="sendTestData()" style="
            padding: 8px 15px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">📨 Отправить тестовые данные</button>`;
        
        statusElement.innerHTML = statusHTML;
        
        // Пробуем вибрацию (если поддерживается)
        if (tg.HapticFeedback) {
            try {
                tg.HapticFeedback.impactOccurred('light');
            } catch (e) {
                console.log("Вибрация не поддерживается");
            }
        }
        
    } else {
        statusElement.innerHTML = `
            <strong>❌ Telegram не обнаружен</strong><br>
            <em>Вы находитесь в тестовом режиме. В реальном Telegram здесь будет информация о пользователе.</em>
        `;
    }
}

// Отправка тестовых данных в Telegram
function sendTestData() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        const testData = {
            action: "test",
            message: "Тестовые данные из игры",
            petState: petState,
            timestamp: Date.now()
        };
        
        if (tg.sendData) {
            tg.sendData(JSON.stringify(testData));
            showEffect('📨 Данные отправлены в бота!');
        } else {
            showEffect('❌ Функция sendData не доступна');
        }
    }
}

// ==================== 9. ЗАПУСК ИГРЫ ====================
// Ждем полной загрузки страницы и запускаем игру
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM загружен, запускаем игру...");
    
    // Даем время на инициализацию Telegram (если есть)
    setTimeout(() => {
        initGame();
        console.log("Игра успешно запущена!");
        showEffect('🎮 Игра загружена!');
    }, 100);
});

// Делаем функции доступными глобально (для HTML кнопок)
window.feed = feed;
window.play = play;
window.sleep = sleep;
window.saveGame = saveGame;
window.testTelegram = testTelegram;
window.sendTestData = sendTestData;