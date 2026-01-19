// ===== PIXEL TAMAGOTCHI GAME =====

let pet = {
    name: "Бобик",
    hunger: 83,
    mood: 54,
    energy: 89,
    coins: 90,
    crystals: 6,
    level: 1,
    xp: 30
};

let shopItems = [
    { id: 1, name: "Шляпа", icon: "🎩", price: 50, type: "clothes" },
    { id: 2, name: "Очки", icon: "👓", price: 80, type: "clothes" },
    { id: 3, name: "Торт", icon: "🍰", price: 30, type: "food" },
    { id: 4, name: "Мячик", icon: "⚽", price: 100, type: "toy" },
    { id: 5, name: "Кристалл", icon: "💎", price: 10, type: "premium" }
];

let inventory = [];
let isPetSleeping = false;

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initGame() {
    updateUI();
    initPetCharacter();
    initShop();
    startStatusDecay();
}

// ===== ПИТОМЕЦ =====
function initPetCharacter() {
    const petElement = document.getElementById('pet-character');
    if (!petElement) return;
    
    // Устанавливаем базовый спрайт
    updatePetAppearance();
    
    // Добавляем класс анимации
    petElement.classList.add('pet-idle');
}

function updatePetAppearance() {
    const petElement = document.getElementById('pet-character');
    if (!petElement) return;
    
    // Определяем эмоцию по состоянию
    let emotion = 'default';
    if (pet.hunger < 30) emotion = 'hungry';
    else if (pet.energy < 30) emotion = 'sleepy';
    else if (pet.mood < 30) emotion = 'sad';
    else if (pet.mood > 70) emotion = 'happy';
    
    // Генерируем SVG питомца с текущей эмоцией
    const svg = generatePetSVG(emotion);
    petElement.innerHTML = `<img src="${svg}" alt="${pet.name}" style="width: 100px; height: 100px;">`;
    
    // Добавляем одежду из инвентаря
    addClothingToPet();
}

function generatePetSVG(emotion) {
    // Базовый SVG питомца
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`;
    
    // Фон
    svg += `<rect width="64" height="64" fill="#7aa2f7"/>`;
    
    // Тело
    svg += `<circle cx="32" cy="32" r="28" fill="#ff9e64"/>`;
    
    // Глаза
    let eyes = '';
    switch(emotion) {
        case 'happy':
            eyes = `<circle cx="22" cy="24" r="4" fill="#1a1b26"/>
                    <circle cx="42" cy="24" r="4" fill="#1a1b26"/>`;
            break;
        case 'sad':
            eyes = `<circle cx="22" cy="26" r="4" fill="#1a1b26"/>
                    <circle cx="42" cy="26" r="4" fill="#1a1b26"/>`;
            break;
        case 'hungry':
            eyes = `<circle cx="22" cy="24" r="3" fill="#1a1b26"/>
                    <circle cx="42" cy="24" r="3" fill="#1a1b26"/>
                    <circle cx="22" cy="24" r="1" fill="#ff6b6b"/>
                    <circle cx="42" cy="24" r="1" fill="#ff6b6b"/>`;
            break;
        case 'sleepy':
            eyes = `<line x1="18" y1="24" x2="26" y2="24" stroke="#1a1b26" stroke-width="3"/>
                    <line x1="38" y1="24" x2="46" y2="24" stroke="#1a1b26" stroke-width="3"/>`;
            break;
        default:
            eyes = `<circle cx="22" cy="24" r="4" fill="#1a1b26"/>
                    <circle cx="42" cy="24" r="4" fill="#1a1b26"/>`;
    }
    
    // Рот
    let mouth = '';
    switch(emotion) {
        case 'happy':
            mouth = `<path d="M24 38 Q32 48 40 38" stroke="#1a1b26" stroke-width="3" fill="none"/>`;
            break;
        case 'sad':
            mouth = `<path d="M24 42 Q32 32 40 42" stroke="#1a1b26" stroke-width="3" fill="none"/>`;
            break;
        case 'hungry':
            mouth = `<ellipse cx="32" cy="40" rx="8" ry="4" fill="#ff6b6b"/>`;
            break;
        case 'sleepy':
            mouth = `<line x1="26" y1="40" x2="38" y2="40" stroke="#1a1b26" stroke-width="3"/>`;
            break;
        default:
            mouth = `<path d="M24 38 Q32 42 40 38" stroke="#1a1b26" stroke-width="3" fill="none"/>`;
    }
    
    svg += eyes + mouth + `</svg>`;
    
    // Конвертируем SVG в Data URL
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function addClothingToPet() {
    // Добавляем одежду из инвентаря
    // В будущем можно реализовать наложение слоев
}

// ===== ОСНОВНЫЕ ДЕЙСТВИЯ =====
function feed() {
    if (pet.hunger >= 100) {
        showMessage("Бобик уже сыт!");
        return;
    }
    
    pet.hunger = Math.min(100, pet.hunger + 15);
    pet.energy = Math.max(0, pet.energy - 5);
    
    // Эффект кормления
    const petElement = document.getElementById('pet-character');
    petElement.classList.add('pulse');
    setTimeout(() => petElement.classList.remove('pulse'), 1000);
    
    updateUI();
    updatePetAppearance();
    saveGame();
}

function play() {
    if (pet.energy < 20) {
        showMessage("Бобик устал и хочет спать!");
        return;
    }
    
    pet.mood = Math.min(100, pet.mood + 20);
    pet.energy = Math.max(0, pet.energy - 15);
    pet.hunger = Math.max(0, pet.hunger - 5);
    
    // Эффект игры
    const petElement = document.getElementById('pet-character');
    petElement.classList.add('shake');
    setTimeout(() => petElement.classList.remove('shake'), 500);
    
    // Шанс получить монетку
    if (Math.random() > 0.7) {
        pet.coins += 5;
        showMessage("+5 монет за игру!");
    }
    
    updateUI();
    updatePetAppearance();
    saveGame();
}

function sleep() {
    if (isPetSleeping) {
        showMessage("Бобик уже спит!");
        return;
    }
    
    isPetSleeping = true;
    pet.energy = Math.min(100, pet.energy + 40);
    pet.mood = Math.max(0, pet.mood - 10);
    
    const petElement = document.getElementById('pet-character');
    petElement.classList.remove('pet-idle');
    petElement.classList.add('pulse');
    
    showMessage("Бобик спит...");
    
    setTimeout(() => {
        isPetSleeping = false;
        petElement.classList.add('pet-idle');
        petElement.classList.remove('pulse');
        updateUI();
        updatePetAppearance();
        saveGame();
    }, 5000);
}

// ===== МАГАЗИН =====
function initShop() {
    const shopContainer = document.getElementById('shopItems');
    if (!shopContainer) return;
    
    shopContainer.innerHTML = '';
    
    shopItems.forEach(item => {
        const canBuy = pet.coins >= item.price;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-price">${item.price} 💰</div>
            <button onclick="buyItem(${item.id})" 
                    class="buy-btn" 
                    ${!canBuy ? 'disabled' : ''}>
                ${canBuy ? 'КУПИТЬ' : 'НЕТ МОНЕТ'}
            </button>
        `;
        
        shopContainer.appendChild(itemElement);
    });
}

function openShop() {
    initShop(); // Обновляем доступность товаров
    document.getElementById('shopModal').style.display = 'flex';
}

function closeShop() {
    document.getElementById('shopModal').style.display = 'none';
}

function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (pet.coins >= item.price) {
        pet.coins -= item.price;
        inventory.push(item);
        
        showMessage(`Куплено: ${item.name}!`);
        
        // Эффекты от предметов
        switch(item.type) {
            case 'food':
                pet.hunger = Math.min(100, pet.hunger + 30);
                break;
            case 'toy':
                pet.mood = Math.min(100, pet.mood + 25);
                break;
            case 'clothes':
                showMessage(`${item.name} надето на Бобика!`);
                break;
            case 'premium':
                pet.crystals += 1;
                break;
        }
        
        updateUI();
        updatePetAppearance();
        initShop(); // Обновляем магазин
        saveGame();
    } else {
        showMessage("Недостаточно монет!");
    }
}

// ===== ЕЖЕДНЕВНАЯ НАГРАДА =====
function openDaily() {
    document.getElementById('dailyModal').style.display = 'flex';
}

function closeDaily() {
    document.getElementById('dailyModal').style.display = 'none';
}

function claimDaily() {
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem('lastDailyClaim');
    
    if (lastClaim === today) {
        showMessage("Вы уже получили награду сегодня!");
        return;
    }
    
    // Награда
    pet.coins += 50;
    pet.crystals += 1;
    
    localStorage.setItem('lastDailyClaim', today);
    
    showMessage("🎉 +50 монет и +1 кристалл!");
    updateUI();
    closeDaily();
    saveGame();
}

// ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ =====
function openMiniGame() {
    showMessage("Мини-игра скоро будет доступна!");
}

function openRanking() {
    showMessage("Рейтинг скоро будет доступен!");
}

function visitFriend() {
    showMessage("Функция посещения друга в разработке!");
}

function saveGame() {
    const gameData = {
        ...pet,
        inventory: inventory,
        timestamp: Date.now()
    };
    
    localStorage.setItem('tamagotchiSave', JSON.stringify(gameData));
    
    // Временно показываем сообщение
    const status = document.getElementById('telegramStatus');
    if (status) {
        status.textContent = 'Игра сохранена!';
        setTimeout(() => status.textContent = '', 2000);
    }
}

function loadGame() {
    const saved = localStorage.getItem('tamagotchiSave');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(pet, data);
        inventory = data.inventory || [];
        
        // Проверяем не устарели ли сохранения (больше 7 дней)
        const daysPassed = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
        if (daysPassed > 7) {
            // Немного ухудшаем состояние
            pet.hunger = Math.max(0, pet.hunger - 30);
            pet.mood = Math.max(0, pet.mood - 20);
            pet.energy = Math.max(0, pet.energy - 40);
        }
    }
}

// ===== СИСТЕМА УХУДШЕНИЯ СОСТОЯНИЙ =====
function startStatusDecay() {
    setInterval(() => {
        if (isPetSleeping) return;
        
        // Медленно ухудшаем состояние
        pet.hunger = Math.max(0, pet.hunger - 0.5);
        pet.mood = Math.max(0, pet.mood - 0.3);
        pet.energy = Math.max(0, pet.energy - 0.2);
        
        updateUI();
        updatePetAppearance();
        
        // Автосохранение каждые 30 секунд
        saveGame();
    }, 30000); // Каждые 30 секунд
}

// ===== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА =====
function updateUI() {
    // Статусы
    document.getElementById('hungerText').textContent = Math.round(pet.hunger) + '%';
    document.getElementById('hungerBar').style.width = pet.hunger + '%';
    
    document.getElementById('moodText').textContent = Math.round(pet.mood) + '%';
    document.getElementById('moodBar').style.width = pet.mood + '%';
    
    document.getElementById('energyText').textContent = Math.round(pet.energy) + '%';
    document.getElementById('energyBar').style.width = pet.energy + '%';
    
    // Ресурсы
    document.getElementById('coins').textContent = pet.coins;
    document.getElementById('crystals').textContent = pet.crystals;
    
    // Уровень
    document.getElementById('level').textContent = pet.level;
    document.getElementById('xpBar').style.width = pet.xp + '%';
    
    // Имя питомца
    document.getElementById('pet-name').textContent = pet.name.toUpperCase();
}

function showMessage(text) {
    // Можно реализовать красивую систему сообщений
    alert(text);
}

// ===== TELEGRAM ИНТЕГРАЦИЯ =====
function testTelegram() {
    const status = document.getElementById('telegramStatus');
    
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        status.innerHTML = `
            ✅ Telegram WebApp доступен<br>
            Версия: ${Telegram.WebApp.version}<br>
            Платформа: ${Telegram.WebApp.platform}
        `;
        
        // Можем использовать Telegram функции
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    } else {
        status.textContent = "❌ Telegram WebApp не обнаружен (работаем в браузере)";
    }
}

// ===== ЗАПУСК ИГРЫ =====
window.onload = function() {
    // Скрываем загрузку
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
    }, 1000);
    
    // Загружаем сохранение
    loadGame();
    
    // Инициализируем игру
    initGame();
};