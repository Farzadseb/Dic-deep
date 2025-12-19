// برنامه اصلی Dic-deep
class DicDeepApp {
    constructor() {
        this.currentPage = 'dictionary';
        this.currentTheme = 'day';
        this.soundEnabled = true;
        this.userData = this.loadUserData();
        this.modules = {};
        this.init();
    }
    
    // مقداردهی اولیه
    async init() {
        console.log('🚀 Dic-deep App Initializing...');
        
        // بارگذاری ماژول‌ها
        await this.loadModules();
        
        // مخفی کردن صفحه لودینگ
        this.hideLoading();
        
        // تنظیم رویدادها
        this.setupEventListeners();
        
        // بارگذاری وضعیت
        this.loadState();
        
        // به‌روزرسانی UI
        this.updateUI();
        
        // بررسی مهمان بودن
        this.checkGuestStatus();
        
        console.log('✅ Dic-deep App Ready!');
    }
    
    // بارگذاری ماژول‌ها
    async loadModules() {
        // بارگذاری ماژول‌ها (در حالت real باید import شوند)
        this.modules = {
            dictionary: new DictionaryModule(this),
            leitner: new LeitnerModule(this),
            practice: new PracticeModule(this),
            competition: new CompetitionModule(this),
            reports: new ReportsModule(this),
            ui: new UIModule(this)
        };
    }
    
    // مخفی کردن صفحه لودینگ
    hideLoading() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }
    
    // بارگذاری داده کاربر
    loadUserData() {
        const saved = localStorage.getItem('dicdeep_user');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // کاربر جدید
        return {
            isGuest: true,
            testsCompleted: 0,
            wordsLearned: 0,
            stars: 0,
            streak: 0,
            lastLogin: null,
            leitnerWords: [],
            competitionWins: 0,
            contactModalShown: false
        };
    }
    
    // ذخیره داده کاربر
    saveUserData() {
        localStorage.setItem('dicdeep_user', JSON.stringify(this.userData));
    }
    
    // بارگذاری وضعیت
    loadState() {
        // تم
        const savedTheme = localStorage.getItem('dicdeep_theme') || 'day';
        this.setTheme(savedTheme);
        
        // صدا
        const savedSound = localStorage.getItem('dicdeep_sound');
        if (savedSound !== null) {
            this.soundEnabled = savedSound === 'true';
            if (window.TTSSystem) {
                window.TTSSystem.isEnabled = this.soundEnabled;
                window.TTSSystem.updateToggleButton();
            }
        }
    }
    
    // ذخیره وضعیت
    saveState() {
        localStorage.setItem('dicdeep_theme', this.currentTheme);
        localStorage.setItem('dicdeep_sound', this.soundEnabled);
    }
    
    // تنظیم رویدادها
    setupEventListeners() {
        // دکمه تغییر تم
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
        
        // دکمه صدا
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => this.toggleSound());
        }
        
        // ناوبری
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.switchPage(page);
            });
        });
        
        // کلیدهای میانبر
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K برای جستجو
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('wordInput')?.focus();
            }
            
            // Escape برای بستن مدال‌ها
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // پروفایل
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.modules.ui.showProfile());
        }
    }
    
    // تغییر تم
    toggleTheme() {
        const newTheme = this.currentTheme === 'day' ? 'night' : 'day';
        this.setTheme(newTheme);
        
        // آپدیت آیکون
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'day' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        this.modules.ui.showNotification(`تم ${newTheme === 'day' ? 'روز' : 'شب'} فعال شد`, 'info');
    }
    
    // تنظیم تم
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = theme + '-mode';
        this.saveState();
    }
    
    // تغییر صدا
    toggleSound() {
        if (window.TTSSystem) {
            this.soundEnabled = window.TTSSystem.toggle();
            this.saveState();
            
            const status = this.soundEnabled ? 'روشن' : 'خاموش';
            this.modules.ui.showNotification(`صدا ${status} شد`, 'info');
        }
    }
    
    // تغییر صفحه
    switchPage(page) {
        if (this.currentPage === page) return;
        
        // بستن مدال‌ها
        this.closeAllModals();
        
        // غیرفعال کردن همه صفحات
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // غیرفعال کردن همه دکمه‌ها
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // فعال کردن صفحه جدید
        const pageElement = document.getElementById(page + 'Section');
        const navButton = document.querySelector(`[data-page="${page}"]`);
        
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        if (navButton) {
            navButton.classList.add('active');
        }
        
        this.currentPage = page;
        
        // بارگذاری محتوای صفحه
        this.loadPageContent(page);
        
        // اسکرول به بالا
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // بارگذاری محتوای صفحه
    loadPageContent(page) {
        if (!this.modules[page]) return;
        
        switch(page) {
            case 'dictionary':
                this.modules.dictionary.init();
                break;
                
            case 'practice':
                this.modules.practice.init();
                break;
                
            case 'leitner':
                this.modules.leitner.init();
                break;
                
            case 'competition':
                this.modules.competition.init();
                break;
                
            case 'reports':
                this.modules.reports.init();
                break;
        }
    }
    
    // بستن همه مدال‌ها
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
    }
    
    // بررسی وضعیت مهمان
    checkGuestStatus() {
        if (this.userData.isGuest) {
            setTimeout(() => {
                this.modules.ui.showNotification('👋 به Dic-deep خوش آمدید! برای ذخیره پیشرفت ثبت‌نام کنید.', 'info', 5000);
            }, 2000);
            
            if (this.userData.testsCompleted >= 5 && !this.userData.contactModalShown) {
                setTimeout(() => {
                    this.modules.ui.showContactModal();
                }, 3000);
            }
        }
    }
    
    // آپدیت UI کلی
    updateUI() {
        // آپدیت ستاره‌ها
        const starElement = document.getElementById('starCount');
        if (starElement) {
            starElement.textContent = this.userData.stars;
        }
        
        // آپدیت streak
        const streakElement = document.getElementById('streakCount');
        if (streakElement) {
            streakElement.textContent = this.userData.streak;
        }
        
        // آپدیت تعداد لغات
        const wordElement = document.getElementById('totalWords');
        if (wordElement) {
            wordElement.textContent = this.userData.wordsLearned;
        }
        
        // آپدیت وضعیت مهمان در پاورقی
        const guestStatus = document.getElementById('guestStatus');
        if (guestStatus) {
            guestStatus.textContent = this.userData.isGuest ? 'حساب مهمان' : 'حساب ویژه';
        }
    }
    
    // مدیریت Streak
    updateStreak() {
        const today = new Date().toDateString();
        const lastLogin = this.userData.lastLogin ? new Date(this.userData.lastLogin).toDateString() : null;
        
        if (lastLogin !== today) {
            if (lastLogin) {
                const lastLoginDate = new Date(this.userData.lastLogin);
                const daysDiff = Math.floor((new Date() - lastLoginDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    this.userData.streak++;
                } else if (daysDiff > 1) {
                    this.userData.streak = 1;
                }
            } else {
                this.userData.streak = 1;
            }
            
            this.userData.lastLogin = new Date().toISOString();
            this.saveUserData();
            this.updateUI();
            
            // پاداش Streak
            if (this.userData.streak % 7 === 0) {
                this.userData.stars += 10;
                this.modules.ui.showNotification(`🎉 رکورد ${this.userData.streak} روزه! +۱۰ ستاره پاداش`, 'success');
            } else if (this.userData.streak % 3 === 0) {
                this.userData.stars += 3;
                this.modules.ui.showNotification(`🔥 ${this.userData.streak} روز متوالی! +۳ ستاره`, 'success');
            }
        }
    }
    
    // اجرای برنامه
    run() {
        console.log('🚀 Dic-deep App Running...');
        
        // بارگذاری اولیه
        this.updateStreak();
        this.setupAutoSave();
        
        // نمایش آمار اولیه
        this.updateUI();
        
        // تنظیم تایمر برای بررسی روزانه
        setInterval(() => {
            this.updateStreak();
        }, 1000 * 60 * 60);
        
        // اضافه کردن به global object
        window.app = this;
        
        console.log('✅ Dic-deep App Fully Loaded!');
    }
    
    // ذخیره خودکار لغات جستجو شده
    setupAutoSave() {
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) {
            const isChecked = localStorage.getItem('dicdeep_autoSave') === 'true';
            autoSaveCheckbox.checked = isChecked;
            
            autoSaveCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('dicdeep_autoSave', e.target.checked);
            });
        }
    }
}

// راه‌اندازی برنامه
document.addEventListener('DOMContentLoaded', () => {
    const app = new DicDeepApp();
    app.run();
});

window.DicDeepApp = DicDeepApp;
