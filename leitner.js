class LeitnerModule {
    constructor(app) {
        this.app = app;
        this.reviewSession = null;
    }
    
    init() {
        console.log('📦 Leitner Module Initialized');
        this.loadBoxes();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // شروع مرور لایتنر
        const reviewBtn = document.getElementById('reviewNowBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.startReview());
        }
    }
    
    loadBoxes() {
        const container = document.getElementById('leitnerContainer');
        if (!container) return;
        
        const boxes = [
            { level: 1, name: 'روز اول', color: '#ef4444', interval: 'هر روز' },
            { level: 2, name: 'روز دوم', color: '#f97316', interval: 'هر ۲ روز' },
            { level: 3, name: 'هفته اول', color: '#f59e0b', interval: 'هر ۷ روز' },
            { level: 4, name: 'هفته دوم', color: '#10b981', interval: 'هر ۱۴ روز' },
            { level: 5, name: 'ماه اول', color: '#06b6d4', interval: 'هر ۳۰ روز' },
            { level: 6, name: 'ماه دوم', color: '#3b82f6', interval: 'هر ۶۰ روز' },
            { level: 7, name: 'تسلط', color: '#8b5cf6', interval: 'تسلط یافته' }
        ];
        
        // ... کد بارگذاری باکس‌ها
    }
    
    addWord(wordData) {
        if (!wordData) return;
        
        const wordToSave = {
            word: wordData.word || wordData.found?.word,
            persian: wordData.persian || wordData.found?.persian,
            english: wordData.english || wordData.found?.english,
            level: 1,
            addedDate: new Date().toISOString(),
            lastReview: null,
            reviewCount: 0,
            correctCount: 0
        };
        
        const exists = this.app.userData.leitnerWords.some(w => w.word === wordToSave.word);
        if (exists) {
            this.app.modules.ui.showNotification('این لغت قبلاً ذخیره شده است', 'info');
            return;
        }
        
        this.app.userData.leitnerWords.push(wordToSave);
        this.app.saveUserData();
        
        if (this.app.currentPage === 'leitner') {
            this.loadBoxes();
        }
        
        this.app.modules.ui.showNotification(`"${wordToSave.word}" به لایتنر اضافه شد`, 'success');
    }
    
    startReview() {
        const wordsToReview = this.getWordsForReview();
        
        if (wordsToReview.length === 0) {
            this.app.modules.ui.showNotification('✅ امروز لغتی برای مرور ندارید! فردا دوباره تلاش کنید.', 'success');
            return;
        }
        
        this.showReviewModal(wordsToReview);
    }
    
    getWordsForReview() {
        const now = new Date();
        return this.app.userData.leitnerWords.filter(word => {
            const lastReview = word.lastReview ? new Date(word.lastReview) : new Date(0);
            const daysSinceReview = (now - lastReview) / (1000 * 60 * 60 * 24);
            
            const reviewIntervals = [1, 2, 7, 14, 30, 60, 90];
            const interval = reviewIntervals[word.level - 1] || 1;
            
            return daysSinceReview >= interval;
        });
    }
    
    showReviewModal(words) {
        // ... کد نمایش مدال مرور
    }
    
    updateStats() {
        const totalElement = document.getElementById('leitnerTotal');
        const masteredElement = document.getElementById('leitnerMastered');
        
        if (totalElement) {
            totalElement.textContent = this.app.userData.leitnerWords.length;
        }
        
        if (masteredElement) {
            const mastered = this.app.userData.leitnerWords.filter(w => w.level >= 7).length;
            masteredElement.textContent = mastered;
        }
    }
}
