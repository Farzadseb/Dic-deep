// تنظیمات اصلی
const CONFIG = {
    TTS_SPEED: 0.7,
    TTS_VOICE: 'Google US English',
    DAILY_TEST_LIMIT: 10,
    TELEGRAM_CHAT_ID: "96991859",
    TELEGRAM_BOT_TOKEN: "8553224514:AAG0XXzA8da55jCGXnzStP-0IxHhnfkTPRw",
    FRED_PHONE: "09017708544"
};

// وضعیت برنامه
let appState = {
    currentTheme: 'day',
    soundEnabled: true,
    currentPage: 'dictionary',
    userStats: {
        stars: 0,
        testsToday: 0,
        wordsLearned: 0,
        competitionsWon: 0
    },
    leitnerWords: [],
    guestTests: 0
};

// راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    loadState();
    setupEventListeners();
    updateUI();
}

function loadState() {
    const saved = localStorage.getItem('dictionaryApp');
    if (saved) {
        appState = JSON.parse(saved);
    }
}

function saveState() {
    localStorage.setItem('dictionaryApp', JSON.stringify(appState));
}

function setupEventListeners() {
    // تغییر تم
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // کنترل صدا
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    
    // ناوبری
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchPage(this.dataset.page);
        });
    });
    
    // جستجوی لغت
    document.getElementById('wordSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchWord();
    });
    
    document.getElementById('searchBtn').addEventListener('click', searchWord);
    
    // پیشنهادات
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('wordSearch').value = this.dataset.word;
            searchWord();
        });
    });
    
    // تلگرام
    document.getElementById('sendToTelegram').addEventListener('click', sendToTelegram);
    
    // پیدا کردن حریف
    document.getElementById('findOpponent').addEventListener('click', findOpponent);
}

// تغییر تم
function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('#themeToggle i');
    
    if (appState.currentTheme === 'day') {
        body.classList.remove('day-mode');
        body.classList.add('night-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        appState.currentTheme = 'night';
    } else {
        body.classList.remove('night-mode');
        body.classList.add('day-mode');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        appState.currentTheme = 'day';
    }
    
    saveState();
}

// کنترل صدا
function toggleSound() {
    const btn = document.getElementById('soundToggle');
    const icon = btn.querySelector('i');
    
    appState.soundEnabled = !appState.soundEnabled;
    
    if (appState.soundEnabled) {
        btn.classList.remove('sound-off');
        btn.classList.add('sound-on');
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    } else {
        btn.classList.remove('sound-on');
        btn.classList.add('sound-off');
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    }
    
    saveState();
}

// تغییر صفحه
function switchPage(page) {
    // غیرفعال کردن همه صفحات
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // غیرفعال کردن همه دکمه‌ها
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // فعال کردن صفحه انتخاب شده
    document.getElementById(page + 'Section').classList.add('active');
    
    // فعال کردن دکمه مربوطه
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    appState.currentPage = page;
    updatePageContent(page);
}

// جستجوی لغت
async function searchWord() {
    const input = document.getElementById('wordSearch');
    const word = input.value.trim().toLowerCase();
    
    if (!word) return;
    
    // نمایش حالت لودینگ
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>در حال جستجوی "${word}"...</p>
        </div>
    `;
    
    try {
        // جستجو در دیتابیس لغات
        const wordData = await findWordInDatabase(word);
        
        if (wordData) {
            displayWordResults(wordData);
            
            // پخش صوت اگر فعال باشد
            if (appState.soundEnabled) {
                playTTS(word, CONFIG.TTS_SPEED);
            }
            
            // اضافه کردن به لایتنر
            addToLeitner(wordData);
            
            // افزایش تعداد جستجوها
            appState.userStats.wordsLearned++;
            
            // نمایش پیام موفقیت
            showNotification(`لغت "${word}" پیدا شد!`, 'success');
        } else {
            resultsDiv.innerHTML = `
                <div class="error-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>لغت یافت نشد!</h3>
                    <p>آیا املای "${word}" را درست وارد کرده‌اید؟</p>
                    <button onclick="suggestSimilar('${word}')" class="btn-primary">
                        <i class="fas fa-lightbulb"></i> پیشنهاد مشابه
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error searching word:', error);
        resultsDiv.innerHTML = `
            <div class="error-card">
                <i class="fas fa-exclamation-circle"></i>
                <h3>خطا در جستجو</h3>
                <p>لطفاً دوباره تلاش کنید یا اتصال اینترنت را بررسی کنید.</p>
            </div>
        `;
    }
    
    saveState();
}

// نمایش نتایج
function displayWordResults(wordData) {
    const resultsDiv = document.getElementById('searchResults');
    
    resultsDiv.innerHTML = `
        <div class="word-card">
            <div class="word-header">
                <div class="word-title">
                    <h2 class="word-text">${wordData.word}</h2>
                    <span class="word-ipa">/${wordData.ipa}/</span>
                </div>
                <button onclick="playWordSound('${wordData.word}')" class="btn-icon">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            
            <div class="word-content">
                <!-- بخش‌های مختلف لغت -->
            </div>
            
            <div class="word-actions">
                <button onclick="addToFavorites('${wordData.word}')" class="btn-action">
                    <i class="far fa-star"></i> ذخیره
                </button>
                <button onclick="showMoreDetails('${wordData.word}')" class="btn-action">
                    <i class="fas fa-info-circle"></i> جزئیات بیشتر
                </button>
                <button onclick="shareWord('${wordData.word}')" class="btn-action">
                    <i class="fas fa-share-alt"></i> اشتراک
                </button>
            </div>
        </div>
    `;
}

// ارسال به تلگرام
async function sendToTelegram() {
    const report = generateDailyReport();
    
    const message = `
📊 *گزارش روزانه دیکشنری هوشمند*
      
✅ لغات یادگرفته: ${appState.userStats.wordsLearned}
🎯 تست‌های امروز: ${appState.userStats.testsToday}/10
⭐ ستاره‌ها: ${appState.userStats.stars}
🏆 مسابقات برده: ${appState.userStats.competitionsWon}
📅 تاریخ: ${new Date().toLocaleDateString('fa-IR')}
      
_با تشکر از استفاده شما از دیکشنری هوشمند_
    `;
    
    try {
        await sendTelegramMessage(message);
        showNotification('گزارش با موفقیت ارسال شد!', 'success');
    } catch (error) {
        showNotification('خطا در ارسال گزارش', 'error');
    }
}

// پیدا کردن حریف برای مسابقه
function findOpponent() {
    const container = document.getElementById('competitionContainer');
    
    container.innerHTML = `
        <div class="finding-opponent">
            <i class="fas fa-search fa-spin"></i>
            <h3>در حال پیدا کردن حریف...</h3>
            <p>۳۰ ثانیه فرصت دارید</p>
            <div class="timer">۳۰</div>
            <div class="competition-info">
                <p>اگر حریفی پیدا نشد، با هوش مصنوعی مسابقه خواهید داد</p>
                <button onclick="startAICompetition()" class="btn-primary">
                    مسابقه با هوش مصنوعی
                </button>
            </div>
        </div>
    `;
    
    // شروع تایمر
    startCompetitionTimer();
}

// مسابقه با AI
function startAICompetition() {
    // منطق مسابقه با AI
    showNotification('مسابقه با هوش مصنوعی شروع شد!', 'info');
    
    // بعد از مسابقه:
    appState.userStats.competitionsWon++;
    appState.userStats.stars += 3;
    
    showNotification('تبریک! شما برنده شدید! 🏆 +۳ ستاره', 'success');
    updateUI();
    saveState();
}

// به‌روزرسانی UI
function updateUI() {
    // آپدیت آمار
    document.getElementById('todayCount').textContent = appState.userStats.testsToday;
    document.getElementById('starCount').textContent = appState.userStats.stars;
    
    // آپدیت تم
    updateThemeUI();
}

function updateThemeUI() {
    // آپدیت آیکون‌ها بر اساس تم
}

// نوتیفیکیشن
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// استایل نوتیفیکیشن
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateX(150%);
    transition: transform 0.3s;
    z-index: 1000;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-right: 4px solid #48bb78;
    background: #f0fff4;
}

.notification.error {
    border-right: 4px solid #f56565;
    background: #fff5f5;
}

.notification.info {
    border-right: 4px solid #4299e1;
    background: #ebf8ff;
}

body.night-mode .notification {
    background: #2d3748;
}
`;
document.head.appendChild(notificationStyle);

// ایجاد فایل‌های دیگر هم به همین صورت ادامه می‌دهیم...
// words.js, tts.js, leitner.js, telegram.js, competition.js

console.log('📚 دیکشنری هوشمند آماده است!');
