// سیستم ارتباط با تلگرام برای Dic-deep
class TelegramBot {
    constructor() {
        this.botToken = "8553224514:AAG0XXzA8da55jCGXnzStP-0IxHhnfkTPRw";
        this.chatId = "96991859";
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
        this.isConnected = false;
        this.queue = []; // صف برای ذخیره پیام‌های ناموفق
        this.init();
    }

    // مقداردهی اولیه
    async init() {
        console.log('📱 Telegram Bot Initializing...');
        await this.testConnection();
        this.processQueue();
    }

    // تست اتصال به تلگرام
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/getMe`);
            const data = await response.json();
            
            if (data.ok) {
                this.isConnected = true;
                console.log(`✅ Connected to Telegram Bot: @${data.result.username}`);
                this.sendWelcomeMessage();
                return true;
            } else {
                console.warn('⚠️ Telegram bot connection failed:', data.description);
                this.isConnected = false;
                return false;
            }
        } catch (error) {
            console.error('📵 Telegram connection error:', error);
            this.isConnected = false;
            return false;
        }
    }

    // ارسال پیام خوش‌آمد
    async sendWelcomeMessage() {
        const message = `🚀 *Dic-deep Bot Activated!*
        
📅 تاریخ: ${new Date().toLocaleDateString('fa-IR')}
⏰ زمان: ${new Date().toLocaleTimeString('fa-IR')}

🤖 ربات آماده دریافت گزارش‌هاست
📊 سیستم گزارش‌گیری فعال شد

🔗 آدرس: https://farzadseb.github.io/Dic-deep`;
        
        await this.sendMessage(message);
    }

    // ارسال پیام
    async sendMessage(text, parseMode = 'Markdown') {
        const messageData = {
            chat_id: this.chatId,
            text: text,
            parse_mode: parseMode
        };

        try {
            // اگر آفلاین هستیم، در صف ذخیره کن
            if (!navigator.onLine) {
                this.queue.push(messageData);
                console.log('📭 Message queued (offline)');
                return false;
            }

            const response = await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            const data = await response.json();

            if (data.ok) {
                console.log('📤 Message sent successfully to Telegram');
                return true;
            } else {
                console.error('❌ Failed to send message:', data.description);
                // اگر خطای خاصی داشت، در صف ذخیره کن
                if (!data.description.includes('blocked') && !data.description.includes('invalid')) {
                    this.queue.push(messageData);
                }
                return false;
            }
        } catch (error) {
            console.error('🌐 Network error, queuing message:', error);
            this.queue.push(messageData);
            return false;
        }
    }

    // پردازش صف پیام‌ها
    async processQueue() {
        if (this.queue.length > 0 && this.isConnected) {
            console.log(`📬 Processing ${this.queue.length} queued messages...`);
            
            for (let i = 0; i < this.queue.length; i++) {
                const message = this.queue[i];
                try {
                    const response = await fetch(`${this.baseUrl}/sendMessage`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(message)
                    });
                    
                    const data = await response.json();
                    if (data.ok) {
                        this.queue.splice(i, 1);
                        i--;
                        console.log('✅ Queued message sent');
                    }
                } catch (error) {
                    console.error('❌ Failed to send queued message:', error);
                }
                
                // تأخیر بین ارسال پیام‌ها
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // چک مجدد هر 30 ثانیه
        setTimeout(() => this.processQueue(), 30000);
    }

    // ارسال گزارش روزانه
    async sendDailyReport(userData = {}) {
        const report = this.generateDailyReport(userData);
        const success = await this.sendMessage(report);
        
        if (success) {
            this.sendEncouragement(userData);
        }
        
        return success;
    }

    // ساخت گزارش روزانه
    generateDailyReport(userData) {
        const date = new Date().toLocaleDateString('fa-IR');
        const time = new Date().toLocaleTimeString('fa-IR');
        const username = userData.name || 'کاربر ناشناس';
        const userType = userData.isGuest ? '👤 مهمان' : '✅ ثبت‌نام شده';

        return `
📊 *گزارش روزانه Dic-deep*
━━━━━━━━━━━━━━━━━━━━
📅 ${date} - ⏰ ${time}

${userType}
👨‍🎓 نام: ${username}

📈 *آمار یادگیری*
├ 🧠 لغات یادگرفته: ${userData.wordsLearned || 0}
├ 📝 تست‌های انجام شده: ${userData.testsCompleted || 0}
├ ⭐ ستاره‌های کسب شده: ${userData.stars || 0}
├ 🔥 روزهای متوالی: ${userData.streak || 0}
└ 🏆 مسابقات برده: ${userData.competitionWins || 0}

📚 *سیستم لایتنر*
├ 📦 لغات ذخیره شده: ${userData.leitnerWords?.length || 0}
├ 📖 نیاز به مرور امروز: ${userData.todayReviews || 0}
└ ✅ لغات تسلط یافته: ${userData.masteredWords || 0}

🎯 *توصیه امروز*
${this.getDailySuggestion(userData)}

━━━━━━━━━━━━━━━━━━━━
_با تشکر از تلاش شما 💪_
🔗 dic-deep.ir
        `;
    }

    // دریافت پیشنهاد روزانه
    getDailySuggestion(userData) {
        const suggestions = [
            "• سعی کنید ۵ لغت جدید امروز یاد بگیرید",
            "• تست روزانه را کامل کنید تا ۳ ستاره بگیرید",
            "• در مسابقه شرکت کنید و مهارت خود را بسنجید",
            "• لغات دیروز را مرور کنید تا فراموش نشوند",
            "• با دوستان خود مسابقه بدهید و هیجان ایجاد کنید"
        ];
        
        const today = new Date().getDay();
        return suggestions[today % suggestions.length];
    }

    // ارسال گزارش مسابقه
    async sendCompetitionReport(competitionData) {
        const winner = competitionData.winner === 'player' ? '🎉 شما' : 
                      competitionData.winner === 'opponent' ? '😞 حریف' : '🤝 مساوی';
        
        const opponentType = competitionData.opponent?.isAI ? '🤖 هوش مصنوعی' : '👤 کاربر واقعی';
        
        const report = `
🏆 *نتیجه مسابقه*
━━━━━━━━━━━━━━━━━━━━
⏰ ${new Date().toLocaleTimeString('fa-IR')}

🎯 *برنده:* ${winner}

📊 *امتیاز نهایی*
├ شما: ${competitionData.scores?.player || 0}
└ حریف: ${competitionData.scores?.opponent || 0}

👥 *مشخصات حریف*
├ نام: ${competitionData.opponent?.name || 'ناشناس'}
├ نوع: ${opponentType}
└ سطح: ${competitionData.opponent?.level || 'نامشخص'}

⭐ *جایزه کسب شده:* ${competitionData.starsEarned || 0} ستاره

💬 *نظر سیستم:* ${this.getCompetitionComment(competitionData.winner)}
━━━━━━━━━━━━━━━━━━━━
_باز هم مسابقه بدهید و قوی‌تر شوید! 💪_
        `;
        
        return await this.sendMessage(report);
    }

    // نظر برای مسابقه
    getCompetitionComment(winner) {
        const comments = {
            player: "عالی بود! مهارت شما قابل تحسین است 🎯",
            opponent: "نگران نباشید، دفعه بعد حتماً برنده می‌شوید 💪",
            draw: "مسابقه نزدیکی بود، هر دو خوب عمل کردید 🤝"
        };
        return comments[winner] || "مسابقه خوبی بود!";
    }

    // ارسال گزارش لایتنر
    async sendLeitnerReport(leitnerData) {
        const report = `
🧠 *گزارش سیستم لایتنر*
━━━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleDateString('fa-IR')}

📊 *آمار کلی*
├ کل لغات: ${leitnerData.totalWords || 0}
├ تسلط یافته: ${leitnerData.masteredWords || 0}
├ درصد پیشرفت: ${leitnerData.completionRate || 0}%
└ مرور امروز: ${leitnerData.todaysReviews || 0}

📦 *وضعیت باکس‌ها*
${this.formatBoxes(leitnerData.boxStats)}

🎯 *لغات نیازمند توجه*
${this.getProblemWords(leitnerData.problemWords)}

✅ *ادامه دهید! مرور منظم رمز موفقیت است*
━━━━━━━━━━━━━━━━━━━━
        `;
        
        return await this.sendMessage(report);
    }

    // فرمت‌بندی باکس‌های لایتنر
    formatBoxes(boxStats) {
        if (!boxStats) return "├ هنوز لغتی اضافه نکرده‌اید";
        
        let result = '';
        for (let i = 1; i <= 7; i++) {
            const count = boxStats[i] || 0;
            if (count > 0) {
                const boxName = this.getBoxName(i);
                result += `├ ${boxName}: ${count} لغت\n`;
            }
        }
        return result || "├ هنوز لغتی اضافه نکرده‌اید";
    }

    // نام باکس‌های لایتنر
    getBoxName(boxNumber) {
        const names = {
            1: "📥 باکس ۱ (هر روز)",
            2: "📤 باکس ۲ (هر ۲ روز)",
            3: "🔄 باکس ۳ (هر هفته)",
            4: "📈 باکس ۴ (هر ۲ هفته)",
            5: "🎯 باکس ۵ (هر ماه)",
            6: "⭐ باکس ۶ (هر ۲ ماه)",
            7: "🏆 باکس ۷ (تسلط کامل)"
        };
        return names[boxNumber] || `باکس ${boxNumber}`;
    }

    // دریافت لغات مشکل‌دار
    getProblemWords(problemWords) {
        if (!problemWords || problemWords.length === 0) {
            return "├ همه لغات خوب یادگرفته شده‌اند ✅";
        }
        
        let result = '';
        problemWords.slice(0, 3).forEach((word, index) => {
            result += `├ ${index + 1}. ${word.word} (${word.wrongCount || 0} بار اشتباه)\n`;
        });
        
        if (problemWords.length > 3) {
            result += `└ و ${problemWords.length - 3} لغت دیگر\n`;
        }
        
        return result;
    }

    // ارسال پیام تشویقی
    async sendEncouragement(userData) {
        const encouragements = [
            { text: "🎉 عالی کار می‌کنید! استمرار داشته باشید.", emoji: "🎯" },
            { text: "🚀 پیشرفت شما چشمگیر است، ادامه دهید!", emoji: "⭐" },
            { text: "🧠 حافظه قوی دارید، همینطور ادامه دهید!", emoji: "💪" },
            { text: "📚 دانش شما روز به روز بیشتر می‌شود!", emoji: "🎓" },
            { text: "🔥 اشتیاق شما برای یادگیری قابل تحسین است!", emoji: "❤️" }
        ];
        
        const random = encouragements[Math.floor(Math.random() * encouragements.length)];
        const stars = userData.stars || 0;
        
        const message = `
${random.emoji} *پیام تشویقی*
━━━━━━━━━━━━━━━━━━━━

${random.text}

📊 *آمار فعلی شما*
├ ⭐ ستاره‌ها: ${stars}
├ 🧠 لغات: ${userData.wordsLearned || 0}
├ 📝 تست‌ها: ${userData.testsCompleted || 0}
└ 🏆 بردها: ${userData.competitionWins || 0}

💡 *نکته امروز:* ${this.getDailyTip()}
━━━━━━━━━━━━━━━━━━━━
_فردا بهتر از امروز خواهید بود! 🌟_
        `;
        
        return await this.sendMessage(message);
    }

    // نکته روزانه
    getDailyTip() {
        const tips = [
            "هر روز ۱۵ دقیقه انگلیسی گوش دهید",
            "لغات جدید را در جمله استفاده کنید",
            "با خودتان انگلیسی صحبت کنید",
            "فیلم انگلیسی با زیرنویس ببینید",
            "هر لغت را ۷ بار در روزهای مختلف مرور کنید"
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // ارسال یادآوری
    async sendReminder(userData) {
        if (!userData.lastLogin) return false;
        
        const lastLogin = new Date(userData.lastLogin);
        const today = new Date();
        const daysSince = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 2) {
            const message = `
🔔 *یادآوری Dic-deep*
━━━━━━━━━━━━━━━━━━━━

📅 ${daysSince} روز است که وارد Dic-deep نشده‌اید!

📚 ${userData.leitnerWords?.length || 0} لغت منتظر مرور هستند
🏆 مسابقات جدید منتظر شما هستند
⭐ ${userData.todaysReviews || 0} ستاره امروز از دست رفته

💡 *پیشنهاد:* همین الان وارد شوید و یادگیری را ادامه دهید!

🔗 https://farzadseb.github.io/Dic-deep
━━━━━━━━━━━━━━━━━━━━
_یادگیری زبان یک سفر است، توقف نکنید! 🚶‍♂️➡️_
            `;
            
            return await this.sendMessage(message);
        }
        
        return false;
    }

    // ارسال دعوت به تماس (برای مهمانان)
    async sendContactInvitation(userData) {
        if (!userData.isGuest || (userData.testsCompleted || 0) < 5) {
            return false;
        }
        
        const message = `
📞 *دعوت به مشاوره تخصصی*
━━━━━━━━━━━━━━━━━━━━

🎯 *تبریک!* شما ۵ تست رایگان را کامل کردید.

👨‍🏫 **استاد Fred** آماده کمک به شماست:

✅ ۱۰ سال سابقه تدریس زبان انگلیسی
✅ روش‌های نوین و شخصی‌سازی شده
✅ برنامه‌ریزی متناسب با سطح شما
✅ پشتیبانی مستمر و پیگیری پیشرفت

📱 *راه‌های ارتباط:*
├ 📞 تماس: ۰۹۰۱۷۷۰۸۵۴۴
├ 💬 واتساپ: همین شماره
├ ✈️ تلگرام: @fred_teacher
└ 📧 ایمیل: fred.english.teacher@gmail.com

🎁 *مشاوره اولیه رایگان*
💡 برای پیشرفت سریع‌تر و دسترسی به تمام امکانات Dic-deep
━━━━━━━━━━━━━━━━━━━━
_یادگیری اصولی، سرمایه‌گذاری برای آینده است! 🎓_
        `;
        
        return await this.sendMessage(message);
    }

    // ارسال گزارش خطا
    async sendErrorReport(error, context) {
        const message = `
🚨 *گزارش خطا - Dic-deep*
━━━━━━━━━━━━━━━━━━━━
⏰ ${new Date().toLocaleTimeString('fa-IR')}

🔧 *خطا:* ${error.message || error.toString().slice(0, 200)}
📁 *محیط:* ${context}

🌐 *مرورگر:* ${navigator.userAgent.slice(0, 100)}
📱 *سیستم:* ${navigator.platform}
🌍 *آنلاین:* ${navigator.onLine ? '✅ بله' : '❌ خیر'}

🔄 *لطفاً این گزارش را برای توسعه‌دهنده ارسال کنید*
━━━━━━━━━━━━━━━━━━━━
        `;
        
        return await this.sendMessage(message);
    }

    // ارسال گزارش مدیریتی (فقط برای مدیر)
    async sendAdminReport() {
        // این تابع فقط توسط مدیر قابل استفاده است
        const stats = this.getSystemStats();
        
        const message = `
👨‍💼 *گزارش مدیریتی Dic-deep*
━━━━━━━━━━━━━━━━━━━━
📅 ${new Date().toLocaleDateString('fa-IR')}

👥 *آمار کاربران*
├ فعال امروز: ${stats.activeUsers}
├ مهمان: ${stats.guestUsers}
├ ثبت‌نام شده: ${stats.registeredUsers}
└ کل کاربران: ${stats.totalUsers}

📚 *فعالیت امروز*
├ جستجو: ${stats.searchesToday}
├ تست: ${stats.testsToday}
├ مسابقه: ${stats.competitionsToday}
└ گزارش: ${stats.reportsToday}

💰 *وضعیت مالی*
├ مشاوره فعال: ${stats.activeConsultations}
├ درآمد امروز: ${stats.todayIncome} تومان
├ درآمد ماه: ${stats.monthlyIncome} تومان
└ رشد: ${stats.growthRate}%

🔔 *اعلان‌ها*
${stats.notifications || '• همه چیز نرمال است'}
━━━━━━━━━━━━━━━━━━━━
_گزارش خودکار سیستم 🖥️_
        `;
        
        return await this.sendMessage(message);
    }

    // دریافت آمار سیستم (شبیه‌سازی)
    getSystemStats() {
        return {
            activeUsers: Math.floor(Math.random() * 50) + 20,
            guestUsers: Math.floor(Math.random() * 30) + 10,
            registeredUsers: Math.floor(Math.random() * 20) + 5,
            totalUsers: Math.floor(Math.random() * 100) + 50,
            searchesToday: Math.floor(Math.random() * 200) + 100,
            testsToday: Math.floor(Math.random() * 50) + 20,
            competitionsToday: Math.floor(Math.random() * 30) + 10,
            reportsToday: Math.floor(Math.random() * 40) + 15,
            activeConsultations: Math.floor(Math.random() * 10) + 3,
            todayIncome: (Math.floor(Math.random() * 500) + 100) * 1000,
            monthlyIncome: (Math.floor(Math.random() * 10000) + 5000) * 1000,
            growthRate: Math.floor(Math.random() * 30) + 5,
            notifications: '• نیاز به به‌روزرسانی دیتابیس لغات\n• سرور در وضعیت مطلوب\n• تعداد کاربران در حال رشد'
        };
    }

    // دریافت وضعیت ربات
    getBotStatus() {
        return {
            connected: this.isConnected,
            botToken: this.botToken ? '✅ تنظیم شده' : '❌ تنظیم نشده',
            chatId: this.chatId ? '✅ تنظیم شده' : '❌ تنظیم نشده',
            queueLength: this.queue.length,
            lastActivity: new Date().toLocaleTimeString('fa-IR')
        };
    }
}

// ایجاد نمونه ربات تلگرام
window.TelegramBot = new TelegramBot();

// توابع عمومی برای استفاده در سایر فایل‌ها
async function sendToTelegram(reportType, data) {
    const bot = window.TelegramBot;
    
    switch(reportType) {
        case 'daily':
            return await bot.sendDailyReport(data);
        case 'competition':
            return await bot.sendCompetitionReport(data);
        case 'leitner':
            return await bot.sendLeitnerReport(data);
        case 'error':
            return await bot.sendErrorReport(data.error, data.context);
        case 'encouragement':
            return await bot.sendEncouragement(data);
        case 'reminder':
            return await bot.sendReminder(data);
        case 'contact':
            return await bot.sendContactInvitation(data);
        case 'admin':
            return await bot.sendAdminReport();
        default:
            return await bot.sendMessage(data);
    }
}

function getTelegramStatus() {
    return window.TelegramBot?.getBotStatus() || { connected: false };
}

// تست خودکار اتصال هر ۵ دقیقه
setInterval(() => {
    if (window.TelegramBot) {
        window.TelegramBot.testConnection();
    }
}, 5 * 60 * 1000);

// رویداد آنلاین/آفلاین شدن
window.addEventListener('online', () => {
    console.log('🌐 Device is online, processing Telegram queue...');
    if (window.TelegramBot) {
        window.TelegramBot.processQueue();
    }
});

console.log('📱 Telegram Bot System loaded!');
console.log('Available: sendToTelegram("daily", userData)');
console.log('Bot Token:', window.TelegramBot.botToken ? '✅ Set' : '❌ Not set');
console.log('Chat ID:', window.TelegramBot.chatId ? '✅ Set' : '❌ Not set');
