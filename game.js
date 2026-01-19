// game.js - рабочая версия с магазином
console.log("Игра загружается...");

// Состояние игры
let petState = {
    name: "Бобик",
    hunger: 70,
    mood: 50,
    energy: 90,
    coins: 100, // Больше монет для теста магазина
    crystals: 5,
    level: 1,
    inventory: []
};

// Магазин товаров
const shopItems = [
    { id: 1, name: "👒 Шляпа", price: 50, type: "clothes", emoji: "👒" },
    { id: 2, name: "👓 Очки", price: 80, type: "clothes", emoji: "👓" },
    { id: 3, name: "🍰 Торт", price: 30, type: "food", emoji: "🍰" },
    { id: 4, name: "🎾 Мячик", price: 100, type: "toy", emoji: "🎾" },
    { id: 5, name: "💎 Кристалл", price: 10, type: "premium", emoji: "💎", premium: true }
];

// Основные функции игры
function updateUI() {
    console.log("Обновление UI...");
    
    // Обновляем шкалы
    document.getElementById('hungerBar').style.width = petState.hunger + '%';
    document.getElementById('moodBar').style.width = petState.mood + '%';
    document.getElementById('energyBar').style.width = petState.energy + '%';
    
    // Обновляем текст
    document.getElementById('hungerText').textContent = petState.hunger + '%';
    document.getElementById('moodText').textContent = petState.mood + '%';
    document.getElementById('energyText').textContent = petState.energy + '%';
    document.getElementById('coins').textContent = petState.coins;
    document.getElementById('crystals').textContent = petState.crystals;
    document.getElementById('level').textContent = petState.level;
}

function feed() {
    if (petState.hunger < 100) {
        petState.hunger = Math.min(100, petState.hunger + 20);
        petState.energy = Math.max(0, petState.energy - 5);
        updateUI();
        showEffect('🍗 +20 голод');
    }
}

function play() {
    if (petState.energy > 20) {
        petState.mood = Math.min(100, petState.mood + 25);
        petState.energy = Math.max(0, petState.energy - 15);
        petState.hunger = Math.max(0, petState.hunger - 10);
        petState.coins += 5;
        updateUI();
        showEffect('🎮 +25 настроение, +5 монет');
    } else {
        alert('Питомец слишком устал! 😴');
    }
}

function sleep() {
    petState.energy = Math.min(100, petState.energy + 40);
    petState.hunger = Math.max(0, petState.hunger - 15);
    petState.mood = Math.max(0, petState.mood - 5);
    updateUI();
    showEffect('💤 +40 энергии');
}

function saveGame() {
    localStorage.setItem('tamagotchi_save', JSON.stringify(petState));
    showEffect('💾 Сохранено!');
}

function showEffect(text) {
    const effect = document.createElement('div');
    effect.textContent = text;
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        z-index: 1000;
        font-weight: bold;
    `;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

// ФУНКЦИИ МАГАЗИНА
function openShop() {
    console.log("Открытие магазина...");
    updateShopUI();
    document.getElementById('shopModal').style.display = 'flex';
}

function closeShop() {
    document.getElementById('shopModal').style.display = 'none';
}

function updateShopUI() {
    const shopContainer = document.getElementById('shopItems');
    shopContainer.innerHTML = '';
    
    shopItems.forEach(item => {
        const canAfford = item.premium ? petState.crystals >= item.price : petState.coins >= item.price;
        
        const itemElement = document.createElement('div');
        itemElement.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: ${canAfford ? '#f8f9fa' : '#e9ecef'};
            border-radius: 10px;
            border: 1px solid #dee2e6;
        `;
        
        itemElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">${item.emoji}</span>
                <div>
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="font-size: 12px; color: #666;">${item.type}</div>
                </div>
            </div>
            <div>
                <div style="font-weight: bold; color: ${item.premium ? '#FFD700' : '#667eea'};">
                    ${item.price} ${item.premium ? '💎' : '🪙'}
                </div>
                <button onclick="buyItem(${item.id})" 
                        style="
                            padding: 5px 10px;
                            margin-top: 5px;
                            background: ${canAfford ? (item.premium ? '#FFD700' : '#667eea') : '#ccc'};
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                        "
                        ${!canAfford ? 'disabled' : ''}>
                    Купить
                </button>
            </div>
        `;
        
        shopContainer.appendChild(itemElement);
    });
}

function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.premium && petState.crystals < item.price) {
        showEffect('❌ Недостаточно кристаллов!');
        return;
    }
    
    if (!item.premium && petState.coins < item.price) {
        showEffect('❌ Недостаточно монет!');
        return;
    }
    
    // Списание валюты
    if (item.premium) {
        petState.crystals -= item.price;
    } else {
        petState.coins -= item.price;
    }
    
    // Добавление в инвентарь
    petState.inventory.push(item);
    
    // Применение эффекта
    switch(item.type) {
        case 'food':
            petState.hunger = Math.min(100, petState.hunger + 50);
            showEffect(`✅ ${item.name} съеден! +50 голод`);
            break;
        case 'toy':
            petState.mood = Math.min(100, petState.mood + 20);
            showEffect(`✅ ${item.name} куплен! +20 настроение`);
            break;
        default:
            showEffect(`✅ Куплено: ${item.name}`);
    }
    
    // Обновление UI
    updateUI();
    updateShopUI();
    saveGame();
}

// Telegram тест
function testTelegram() {
    const status = document.getElementById('telegramStatus');
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        status.innerHTML = `✅ Telegram работает!<br>Платформа: ${tg.platform}`;
    } else {
        status.innerHTML = '❌ Не в Telegram (тестовый режим)';
    }
}

// Инициализация игры
function initGame() {
    console.log("Инициализация игры...");
    
    // Загрузка сохранения
    const saved = localStorage.getItem('tamagotchi_save');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(petState, loaded);
            console.log("Сохранение загружено");
        } catch (e) {
            console.error("Ошибка загрузки:", e);
        }
    }
    
    updateUI();
    
    // Авто-уменьшение параметров
    setInterval(() => {
        petState.hunger = Math.max(0, petState.hunger - 2);
        petState.mood = Math.max(0, petState.mood - 1);
        petState.energy = Math.max(0, petState.energy - 1);
        updateUI();
    }, 30000);
}

// Делаем функции глобальными
window.feed = feed;
window.play = play;
window.sleep = sleep;
window.saveGame = saveGame;
window.openShop = openShop;
window.closeShop = closeShop;
window.buyItem = buyItem;
window.testTelegram = testTelegram;
window.initGame = initGame;

// Запуск при полной загрузке
window.addEventListener('load', () => {
    console.log("Страница загружена");
});