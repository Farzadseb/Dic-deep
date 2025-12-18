// 🧠 سیستم لایتنر هوشمند Dic-deep
class LeitnerSystem {
    constructor() {
        // ۵ باکس لایتنر
        this.boxes = {
            1: [], // روزانه
            2: [], // هر ۲ روز
            3: [], // هر ۴ روز
            4: [], // هر هفته
            5: []  // هر ماه
        };
        
        this.schedule = {
            1: 1,   // روز بعد
            2: 2,   // ۲ روز بعد
            3: 4,   // ۴ روز بعد
            4: 7,   // ۷ روز بعد
            5: 30   // ۳۰ روز بعد
        };
        
        this.userProgress = {};
        this.loadProgress();
    }
    
    // 📊 اضافه کردن لغت به سیستم (وقتی کاربر اشتباه می‌کند)
    addWord(word, userId = 'default') {
        if (!this.userProgress[userId]) {
            this.userProgress[userId] = {
                words: {},
                stats: {
                    totalWords: 0,
                    mastered: 0,
                    dailyGoal: 10,
                    streak: 0
                }
            };
        }
        
        const userData = this.userProgress[userId];
        
        if (!userData.words[word]) {
            // لغت جدید - اضافه به باکس ۱
            userData.words[word] = {
                box: 1,
                addedDate: new Date().toISOString(),
                nextReview: this.calculateNextReview(1),
                correctCount: 0,
                wrongCount: 0,
                lastReviewed: null,
                difficulty: 0.5 // 0-1 (سختی)
            };
            
            userData.stats.totalWords++;
            
            // اضافه به باکس ۱
            if (!this.boxes[1].includes(word)) {
                this.boxes[1].push(word);
            }
            
            this.saveProgress();
            return true;
        }
        
        return false;
    }
    
    // 🔁 بررسی لغت (درست یا غلط)
    reviewWord(word, isCorrect, userId = 'default') {
        if (!this.userProgress[userId] || !this.userProgress[userId].words[word]) {
            return false;
        }
        
        const wordData = this.userProgress[userId].words[word];
        const currentBox = wordData.box;
        
        // آپدیت آمار
        if (isCorrect) {
            wordData.correctCount++;
            
            // انتقال به باکس بالاتر
            if (currentBox < 5) {
                wordData.box = currentBox + 1;
                
                // حذف از باکس قدیم
                const oldIndex = this.boxes[currentBox].indexOf(word);
                if (oldIndex > -1) {
                    this.boxes[currentBox].splice(oldIndex, 1);
                }
                
                // اضافه به باکس جدید
                this.boxes[wordData.box].push(word);
                
                // اگر به باکس ۵ رسید، تسلط کامل
                if (wordData.box === 5) {
                    this.userProgress[userId].stats.mastered++;
                }
            }
        } else {
            wordData.wrongCount++;
            
            // برگشت به باکس ۱
            if (currentBox > 1) {
                wordData.box = 1;
                
                // حذف از باکس قدیم
                const oldIndex = this.boxes[currentBox].indexOf(word);
                if (oldIndex > -1) {
                    this.boxes[currentBox].splice(oldIndex, 1);
                }
                
                // اضافه به باکس ۱
                if (!this.boxes[1].includes(word)) {
                    this.boxes[1].push(word);
                }
            }
            
            // افزایش سطح سختی
            wordData.difficulty = Math.min(1, wordData.difficulty + 0.1);
        }
        
        // آپدیت تاریخ‌ها
        wordData.lastReviewed = new Date().toISOString();
        wordData.nextReview = this.calculateNextReview(wordData.box);
        
        // آپدیت streak
        this.updateStreak(userId);
        
        this.saveProgress();
        return true;
    }
    
    // 📅 محاسبه مرور بعدی
    calculateNextReview(boxNumber) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + this.schedule[boxNumber]);
        return nextDate.toISOString();
    }
    
    // 🎯 دریافت لغات امروز برای مرور
    getTodayReview(userId = 'default') {
        if (!this.userProgress[userId]) {
            return [];
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const wordsToReview = [];
        
        for (const [word, data] of Object.entries(this.userProgress[userId].words)) {
            const nextReview = new Date(data.nextReview);
            nextReview.setHours(0, 0, 0, 0);
            
            // اگر امروز یا گذشته است
            if (nextReview <= today) {
                wordsToReview.push({
                    word: word,
                    box: data.box,
                    difficulty: data.difficulty,
                    correctCount: data.correctCount,
                    wrongCount: data.wrongCount
                });
            }
        }
        
        // مرتب کردن بر اساس سختی (لغات سخت‌تر اول)
        wordsToReview.sort((a, b) => b.difficulty - a.difficulty);
        
        // محدود کردن به هدف روزانه
        const dailyGoal = this.userProgress[userId].stats.dailyGoal || 10;
        return wordsToReview.slice(0, dailyGoal);
    }
    
    // 📊 گرفتن آمار کاربر
    getUserStats(userId = 'default') {
        if (!this.userProgress[userId]) {
            return null;
        }
        
        const userData = this.userProgress[userId];
        const todayReview = this.getTodayReview(userId);
        
        // محاسبه درصد تسلط
        let masteryPercent = 0;
        if (userData.stats.totalWords > 0) {
            masteryPercent = Math.round(
                (userData.stats.mastered / userData.stats.totalWords) * 100
            );
        }
        
        return {
            totalWords: userData.stats.totalWords,
            mastered: userData.stats.mastered,
            masteryPercent: masteryPercent,
            todayReviewCount: todayReview.length,
            dailyGoal: userData.stats.dailyGoal,
            streak: userData.stats.streak,
            boxDistribution: this.getBoxDistribution(userId)
        };
    }
    
    // 📦 توزیع لغات در باکس‌ها
    getBoxDistribution(userId = 'default') {
        if (!this.userProgress[userId]) {
            return {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        }
        
        const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        
        for (const wordData of Object.values(this.userProgress[userId].words)) {
            distribution[wordData.box]++;
        }
        
        return distribution;
    }
    
    // 🔥 آپدیت streak (روزهای متوالی تمرین)
    updateStreak(userId = 'default') {
        if (!this.userProgress[userId]) return;
        
        const userData = this.userProgress[userId];
        const today = new Date().toDateString();
        const lastPractice = userData.stats.lastPracticeDate;
        
        if (lastPractice === today) {
            // امروز قبلاً تمرین کرده
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPractice === yesterday.toDateString()) {
            // دیروز تمرین کرده - افزایش streak
            userData.stats.streak++;
        } else if (lastPractice && lastPractice !== today) {
            // شکستن streak
            userData.stats.streak = 1;
        } else {
            // اولین تمرین
            userData.stats.streak = 1;
        }
        
        userData.stats.lastPracticeDate = today;
        this.saveProgress();
    }
    
    // 💾 ذخیره پیشرفت در localStorage
    saveProgress() {
        try {
            const data = {
                boxes: this.boxes,
                userProgress: this.userProgress,
                lastSave: new Date().toISOString()
            };
            localStorage.setItem('dicdeep-leitner', JSON.stringify(data));
        } catch (error) {
            console.error('خطا در ذخیره پیشرفت:', error);
        }
    }
    
    // 📂 بارگذاری پیشرفت
    loadProgress() {
        try {
            const saved = localStorage.getItem('dicdeep-leitner');
            if (saved) {
                const data = JSON.parse(saved);
                this.boxes = data.boxes || this.boxes;
                this.userProgress = data.userProgress || {};
            }
        } catch (error) {
            console.error('خطا در بارگذاری پیشرفت:', error);
        }
    }
    
    // 🗑️ ریست پیشرفت (برای تست)
    resetProgress(userId = 'default') {
        if (userId === 'all') {
            this.userProgress = {};
            this.boxes = {1: [], 2: [], 3: [], 4: [], 5: []};
        } else if (this.userProgress[userId]) {
            delete this.userProgress[userId];
        }
        
        this.saveProgress();
    }
}

// ایجاد نمونه جهانی
window.leitnerSystem = new LeitnerSystem();
