// برنامه اصلی Dic-deep
class DicDeepApp {
    constructor() {
        this.currentPage = 'dictionary';
        this.currentTheme = 'day';
        this.soundEnabled = true;
        this.userData = this.loadUserData();
        this.init();
    }
    
    // مقداردهی اولیه
    init() {
        console.log('🚀 Dic-deep App Initializing...');
        
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
            competitionWins: 0
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
            window.TTSSystem.isEnabled = this.soundEnabled;
            window.TTSSystem.updateToggleButton();
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
        
        // جستجو
        const searchBtn = document.getElementById('searchBtn');
        const wordInput = document.getElementById('wordInput');
        
        if (searchBtn && wordInput) {
            searchBtn.addEventListener('click', () => this.searchWord());
            
            wordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchWord();
                }
            });
            
            // پیشنهادات سریع
            document.querySelectorAll('.suggestion-tag').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const word = e.currentTarget.dataset.word;
                    wordInput.value = word;
                    this.searchWord();
                });
            });
        }
        
        // دکمه ارسال به تلگرام
        const telegramBtn = document.getElementById('sendTelegramReport');
        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => this.sendTelegramReport());
        }
        
        // مسابقه با AI
        const aiBtn = document.getElementById('aiCompetitionBtn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.startAICompetition());
        }
        
        // پیدا کردن حریف
        const findBtn = document.getElementById('findPlayerBtn');
        if (findBtn) {
            findBtn.addEventListener('click', () => this.findOpponent());
        }
        
        // شروع مرور لایتنر
        const reviewBtn = document.getElementById('reviewNowBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.startLeitnerReview());
        }
        
        // پروفایل
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfile());
        }
        
        // کلیدهای میانبر
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K برای جستجو
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                wordInput?.focus();
            }
            
            // Escape برای بستن مدال‌ها
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
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
        
        this.showNotification(`تم ${newTheme === 'day' ? 'روز' : 'شب'} فعال شد`, 'info');
    }
    
    // تنظیم تم
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.className = theme + '-mode';
        this.saveState();
    }
    
    // تغییر صدا
    toggleSound() {
        this.soundEnabled = window.TTSSystem.toggle();
        this.saveState();
        
        const status = this.soundEnabled ? 'روشن' : 'خاموش';
        this.showNotification(`صدا ${status} شد`, 'info');
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
        switch(page) {
            case 'dictionary':
                this.updateDictionaryStats();
                break;
                
            case 'practice':
                this.loadDailyTests();
                break;
                
            case 'leitner':
                this.loadLeitnerBoxes();
                break;
                
            case 'competition':
                this.updateCompetitionStatus();
                break;
                
            case 'reports':
                this.loadReports();
                break;
        }
    }
    
    // جستجوی لغت
    async searchWord() {
        const input = document.getElementById('wordInput');
        const word = input.value.trim();
        
        if (!word) {
            this.showNotification('لطفاً یک لغت وارد کنید', 'error');
            input.focus();
            return;
        }
        
        // نمایش حالت لودینگ
        this.showLoadingState('در حال جستجو...');
        
        try {
            // جستجو در دیتابیس
            const result = window.DictionaryDB.searchWord(word);
            
            if (!result) {
                this.showNoResults(word);
                return;
            }
            
            // نمایش نتایج
            this.displayWordResult(result);
            
            // پخش صوت
            if (this.soundEnabled) {
                window.TTSSystem.speakWord(word);
            }
            
            // اضافه کردن به لایتنر
            if (document.getElementById('autoSave')?.checked) {
                this.addToLeitner(result);
            }
            
            // افزایش آمار
            this.userData.wordsLearned++;
            this.saveUserData();
            this.updateDictionaryStats();
            
            this.showNotification(`لغت "${word}" پیدا شد!`, 'success');
            
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('خطا در جستجو، لطفاً دوباره تلاش کنید', 'error');
        }
    }
    
    // نمایش حالت لودینگ
    showLoadingState(message = 'در حال بارگذاری...') {
        const resultsArea = document.getElementById('resultsArea');
        if (!resultsArea) return;
        
        resultsArea.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    // نمایش نتایج
    displayWordResult(wordData) {
        const resultsArea = document.getElementById('resultsArea');
        if (!resultsArea) return;
        
        // اگر لغت پیدا نشده اما پیشنهاد دارد
        if (wordData.suggestions) {
            let suggestionsHtml = wordData.suggestions.map(s => `
                <div class="suggestion-item" onclick="app.selectSuggestion('${s.word}')">
                    <strong>${s.word}</strong>
                    <span>${s.meaning}</span>
                    <i class="fas fa-arrow-left"></i>
                </div>
            `).join('');
            
            resultsArea.innerHTML = `
                <div class="suggestions-container">
                    <h3>${wordData.message}</h3>
                    <div class="suggestions-list">
                        ${suggestionsHtml}
                    </div>
                </div>
            `;
            return;
        }
        
        // نمایش کامل لغت
        const word = wordData.word;
        const phonetic = wordData.phonetic || '';
        const meanings = wordData.meanings || [];
        const collocations = wordData.collocations || [];
        const phrasalVerbs = wordData.phrasalVerbs || [];
        
        // ساخت HTML معانی
        let meaningsHtml = '';
        meanings.forEach((meaning, index) => {
            let examplesHtml = '';
            if (meaning.examples && meaning.examples.length > 0) {
                examplesHtml = meaning.examples.map(ex => `
                    <div class="example-item">
                        <div class="example-en">${ex.english}</div>
                        <div class="example-fa">${ex.persian}</div>
                        <button class="play-example-btn" onclick="playExampleSound('${ex.english.replace(/'/g, "\\'")}')">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                `).join('');
            }
            
            meaningsHtml += `
                <div class="meaning-card">
                    <div class="meaning-header">
                        <span class="part-of-speech">${meaning.partOfSpeech}</span>
                        <span class="meaning-persian">${meaning.persian}</span>
                    </div>
                    <div class="meaning-definition">
                        <strong>تعریف:</strong> ${meaning.english}
                    </div>
                    ${examplesHtml ? `
                    <div class="examples">
                        <strong>مثال‌ها:</strong>
                        <div class="examples-list">${examplesHtml}</div>
                    </div>` : ''}
                </div>
            `;
        });
        
        // ساخت HTML کالوکیشن‌ها
        let collocationsHtml = '';
        if (collocations.length > 0) {
            collocationsHtml = `
                <div class="collocations">
                    <h4><i class="fas fa-link"></i> کالوکیشن‌ها</h4>
                    <div class="tags">
                        ${collocations.map(coll => `
                            <span class="tag" onclick="app.searchCollocation('${coll}')">${coll}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // ساخت HTML افعال مرکب
        let phrasalVerbsHtml = '';
        if (phrasalVerbs.length > 0) {
            phrasalVerbsHtml = `
                <div class="phrasal-verbs">
                    <h4><i class="fas fa-random"></i> افعال مرکب</h4>
                    ${phrasalVerbs.map(pv => `
                        <div class="phrasal-verb-item">
                            <strong>${pv.verb}</strong>
                            <span>${pv.persian}</span>
                            <div class="example">مثال: ${pv.example}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // HTML نهایی
        resultsArea.innerHTML = `
            <div class="word-result-card">
                <div class="word-header">
                    <div class="word-title">
                        <h2 class="word">${word}</h2>
                        <span class="phonetic">${phonetic}</span>
                    </div>
                    <div class="word-actions">
                        <button class="play-btn" onclick="playWordSound('${word}')">
                            <i class="fas fa-volume-up"></i> پخش تلفظ
                        </button>
                        <button class="save-btn" onclick="app.addToFavorites('${word}')">
                            <i class="far fa-star"></i> ذخیره
                        </button>
                    </div>
                </div>
                
                <div class="word-details">
                    <div class="meanings-section">
                        <h3><i class="fas fa-book"></i> معانی</h3>
                        ${meaningsHtml}
                    </div>
                    
                    ${collocationsHtml}
                    ${phrasalVerbsHtml}
                    
                    <div class="word-footer">
                        <span class="word-level">سطح: ${wordData.level || 'A1'}</span>
                        <span class="word-frequency">تکرار: ${wordData.frequency || 5}/10</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // جستجوی کالوکیشن
    searchCollocation(collocation) {
        const input = document.getElementById('wordInput');
        input.value = collocation.split(' ')[0];
        this.searchWord();
    }
    
    // انتخاب پیشنهاد
    selectSuggestion(word) {
        const input = document.getElementById('wordInput');
        input.value = word;
        this.searchWord();
    }
    
    // نمایش خطای عدم یافتن
    showNoResults(word) {
        const resultsArea = document.getElementById('resultsArea');
        if (!resultsArea) return;
        
        resultsArea.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>لغت "${word}" یافت نشد</h3>
                <p>مطمئن هستید که املای آن درست است؟</p>
                <button class="btn-primary" onclick="app.showContactModal()">
                    <i class="fas fa-question-circle"></i> نیاز به کمک دارید؟
                </button>
            </div>
        `;
    }
    
    // آپدیت آمار دیکشنری
    updateDictionaryStats() {
        const wordCount = window.DictionaryDB.getTotalWordCount();
        const countElement = document.getElementById('wordCount');
        if (countElement) {
            countElement.textContent = `${wordCount}+`;
        }
    }
    
    // ارسال گزارش به تلگرام
    async sendTelegramReport() {
        // ساخت گزارش
        const report = this.generateReport();
        
        // نمایش لودینگ
        this.showNotification('در حال ارسال گزارش به تلگرام...', 'info');
        
        // ارسال با Telegram API
        try {
            await window.TelegramBot.sendReport(report);
            this.showNotification('گزارش با موفقیت ارسال شد!', 'success');
        } catch (error) {
            console.error('Telegram error:', error);
            this.showNotification('خطا در ارسال گزارش', 'error');
        }
    }
    
    // ساخت گزارش
    generateReport() {
        const date = new Date().toLocaleDateString('fa-IR');
        const time = new Date().toLocaleTimeString('fa-IR');
        
        return `
📊 *گزارش پیشرفت Dic-deep*
👤 کاربر: ${this.userData.isGuest ? 'مهمان' : 'ثبت‌نام شده'}
📅 تاریخ: ${date} - ${time}

📚 آمار یادگیری:
├ لغات یادگرفته: ${this.userData.wordsLearned}
├ تست‌های انجام شده: ${this.userData.testsCompleted}
├ ستاره‌های کسب شده: ${this.userData.stars}
├ روزهای متوالی: ${this.userData.streak}
└ مسابقات برده: ${this.userData.competitionWins}

🎯 سیستم لایتنر:
├ لغات در حال یادگیری: ${this.userData.leitnerWords.length}
├ مرور امروز: ${this.getTodayReviews().length}
└ لغات تسلط یافته: ${this.getMasteredWords().length}

🏆 عملکرد امروز:
${this.getTodayPerformance()}

_با تشکر از استفاده شما از Dic-deep_
`;
    }
    
    // دریافت لغات مرور امروز
    getTodayReviews() {
        return this.userData.leitnerWords.filter(word => 
            this.needsReviewToday(word)
        );
    }
    
    // دریافت لغات تسلط یافته
    getMasteredWords() {
        return this.userData.leitnerWords.filter(word => 
            word.level >= 7
        );
    }
    
    // بررسی نیاز مرور امروز
    needsReviewToday(wordItem) {
        const today = new Date().toDateString();
        return wordItem.nextReview <= today;
    }
    
    // دریافت عملکرد امروز
    getTodayPerformance() {
        const today = new Date().toDateString();
        const lastLogin = new Date(this.userData.lastLogin).toDateString();
        
        if (lastLogin === today) {
            return '✅ امروز وارد شده‌اید';
        } else if (this.userData.lastLogin) {
            return '📝 از آخرین ورود شما زمان زیادی گذشته';
        } else {
            return '🎉 اولین روز شما در Dic-deep';
        }
    }
    
    // شروع مسابقه با AI
    startAICompetition() {
        this.switchPage('competition');
        
        // شبیه‌سازی مسابقه با AI
        setTimeout(() => {
            // نمایش سوالات
            this.showCompetitionQuestions();
            
            // نتیجه‌گیری
            setTimeout(() => {
                this.userData.stars += 3;
                this.userData.competitionWins++;
                this.saveUserData();
                this.updateUI();
                
                this.showNotification('تبریک! شما برنده شدید! 🏆 +۳ ستاره', 'success');
            }, 3000);
        }, 1000);
    }
    
    // پیدا کردن حریف
    findOpponent() {
        this.showNotification('در حال پیدا کردن حریف...', 'info');
        
        // تایمر ۳۰ ثانیه
        let timeLeft = 30;
        const timerInterval = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                this.showNotification('حریفی پیدا نشد، شروع مسابقه با AI', 'info');
                this.startAICompetition();
            }
        }, 1000);
    }
    
    // نمایش سوالات مسابقه
    showCompetitionQuestions() {
        const container = document.getElementById('competitionContainer');
        if (!container) return;
        
        const questions = window.DictionaryDB.getRandomWords(5);
        
        let html = `
            <div class="competition-questions">
                <h3><i class="fas fa-brain"></i> مسابقه با هوش مصنوعی</h3>
                <div class="timer">⏱️ 60 ثانیه</div>
        `;
        
        questions.forEach((q, index) => {
            html += `
                <div class="question-card">
                    <div class="question-header">
                        <span class="question-number">سوال ${index + 1}</span>
                        <span class="question-points">۲ امتیاز</span>
                    </div>
                    <div class="question-text">
                        معنی "<strong>${q.word}</strong>" چیست؟
                    </div>
                    <div class="options">
                        <button class="option-btn">${q.meaning}</button>
                        <button class="option-btn">${this.getRandomMeaning(q.meaning)}</button>
                        <button class="option-btn">${this.getRandomMeaning(q.meaning)}</button>
                        <button class="option-btn">${this.getRandomMeaning(q.meaning)}</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        container.innerHTML = html;
    }
    
    // دریافت معنی تصادفی برای تست
    getRandomMeaning(exclude) {
        const allWords = window.DictionaryDB.getAllWords();
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        return randomWord.meaning !== exclude ? randomWord.meaning : this.getRandomMeaning(exclude);
    }
    
    // بارگذاری تست‌های روزانه
    loadDailyTests() {
        const container = document.getElementById('practiceContainer');
        if (!container) return;
        
        // بررسی محدودیت مهمان
        if (this.userData.isGuest && this.userData.testsCompleted >= 5) {
            this.showContactModal();
            return;
        }
        
        // دریافت لغات تصادفی برای تست
        const testWords = window.DictionaryDB.getRandomWords(10);
        
        let html = `
            <div class="daily-test">
                <div class="test-header">
                    <h3><i class="fas fa-calendar-check"></i> تست روزانه</h3>
                    <div class="test-info">
                        <span><i class="fas fa-clock"></i> ۱۰ دقیقه</span>
                        <span><i class="fas fa-star"></i> ۱۰ ستاره جایزه</span>
                    </div>
                </div>
        `;
        
        testWords.forEach((word, index) => {
            const options = this.generateTestOptions(word, testWords);
            
            html += `
                <div class="test-question" data-word="${word.word}">
                    <div class="question-number">${index + 1}. ${word.word}</div>
                    <div class="question-text">معنی این لغت چیست؟</div>
                    <div class="options">
                        ${options.map(opt => `
                            <label class="option-label">
                                <input type="radio" name="q${index}" value="${opt}">
                                <span class="option-text">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += `
                <div class="test-footer">
                    <button class="btn-primary" onclick="app.submitTest()">
                        <i class="fas fa-paper-plane"></i> ارسال پاسخ‌ها
                    </button>
                    <button class="btn-secondary" onclick="app.resetTest()">
                        <i class="fas fa-redo"></i> شروع مجدد
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    // تولید گزینه‌های تست
    generateTestOptions(correctWord, allWords) {
        const options = [correctWord.meaning];
        
        // اضافه کردن ۳ گزینه اشتباه تصادفی
        while (options.length < 4) {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!options.includes(randomWord.meaning) && randomWord.word !== correctWord.word) {
                options.push(randomWord.meaning);
            }
        }
        
        // مخلوط کردن گزینه‌ها
        return this.shuffleArray(options);
    }
    
    // مخلوط کردن آرایه
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // ارسال تست
    submitTest() {
        const questions = document.querySelectorAll('.test-question');
        let correctCount = 0;
        let totalQuestions = questions.length;
        
        questions.forEach((q, index) => {
            const word = q.dataset.word;
            const correctMeaning = window.DictionaryDB.searchWord(word).meanings[0].persian;
            const selectedOption = q.querySelector('input[type="radio"]:checked');
            
            if (selectedOption && selectedOption.value === correctMeaning) {
                correctCount++;
                q.classList.add('correct');
            } else {
                q.classList.add('incorrect');
            }
        });
        
        // محاسبه امتیاز
        const score = Math.round((correctCount / totalQuestions) * 100);
        const starsEarned = Math.floor(correctCount / 2);
        
        // آپدیت داده کاربر
        this.userData.testsCompleted++;
        this.userData.stars += starsEarned;
        this.saveUserData();
        
        // نمایش نتیجه
        this.showTestResult(score, correctCount, totalQuestions, starsEarned);
        
        // نمایش مدال تماس برای مهمان بعد از ۵ تست
        if (this.userData.isGuest && this.userData.testsCompleted >= 5) {
            setTimeout(() => {
                this.showContactModal();
            }, 2000);
        }
    }
    
    // نمایش نتیجه تست
    showTestResult(score, correct, total, stars) {
        const container = document.getElementById('practiceContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="test-result">
                <div class="result-icon">
                    ${score >= 70 ? '🏆' : score >= 50 ? '⭐' : '📝'}
                </div>
                <h3>نتیجه تست روزانه</h3>
                
                <div class="result-stats">
                    <div class="stat-item">
                        <div class="stat-value">${score}%</div>
                        <div class="stat-label">درصد موفقیت</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${correct}/${total}</div>
                        <div class="stat-label">پاسخ صحیح</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">+${stars}</div>
                        <div class="stat-label">ستاره کسب شده</div>
                    </div>
                </div>
                
                ${score >= 80 ? `
                <div class="encouragement">
                    <i class="fas fa-fire"></i>
                    <p>عالی بود! شما در مسیر درستی قرار دارید.</p>
                </div>
                ` : score >= 60 ? `
                <div class="encouragement">
                    <i class="fas fa-thumbs-up"></i>
                    <p>خوب بود! ادامه دهید تا بهتر شوید.</p>
                </div>
                ` : `
                <div class="encouragement">
                    <i class="fas fa-handshake"></i>
                    <p>نگران نباشید، با تمرین بیشتر پیشرفت خواهید کرد.</p>
                </div>
                `}
                
                <div class="result-actions">
                    <button class="btn-primary" onclick="app.loadDailyTests()">
                        <i class="fas fa-redo"></i> تست جدید
                    </button>
                    <button class="btn-secondary" onclick="app.sendTelegramReport()">
                        <i class="fab fa-telegram"></i> ارسال گزارش
                    </button>
                </div>
            </div>
        `;
    }
    
    // ریست تست
    resetTest() {
        this.loadDailyTests();
    }
    
    // بارگذاری سیستم لایتنر
    loadLeitnerBoxes() {
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
        
        // گروه‌بندی لغات بر اساس سطح
        const groupedWords = {};
        this.userData.leitnerWords.forEach(word => {
            const level = word.level || 1;
            if (!groupedWords[level]) groupedWords[level] = [];
            groupedWords[level].push(word);
        });
        
        let html = '<div class="leitner-boxes">';
        
        boxes.forEach(box => {
            const words = groupedWords[box.level] || [];
            const count = words.length;
            
            html += `
                <div class="leitner-box" style="border-color: ${box.color}">
                    <div class="box-header" style="background: ${box.color}20">
                        <h4>${box.name}</h4>
                        <span class="box-count">${count} لغت</span>
                    </div>
                    <div class="box-info">
                        <div class="interval">
                            <i class="fas fa-clock"></i>
                            <span>${box.interval}</span>
                        </div>
                        <div class="box-words">
                            ${words.slice(0, 3).map(w => `
                                <span class="word-tag">${w.word}</span>
                            `).join('')}
                            ${count > 3 ? `<span class="more-tag">+${count - 3} بیشتر</span>` : ''}
                        </div>
                        ${count > 0 ? `
                        <button class="review-box-btn" onclick="app.reviewBox(${box.level})" style="background: ${box.color}">
                            <i class="fas fa-play"></i> مرور
                        </button>` : `
                        <button class="review-box-btn disabled" style="background: ${box.color}40">
                            <i class="fas fa-plus"></i> اضافه کردن
                        </button>`}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // آپدیت آمار
        this.updateLeitnerStats();
    }
    
    // آپدیت آمار لایتنر
    updateLeitnerStats() {
        const totalElement = document.querySelector('#totalWords');
        const todayElement = document.querySelector('#todayReview');
        
        if (totalElement) {
            totalElement.textContent = this.userData.leitnerWords.length;
        }
        
        if (todayElement) {
            const todayReviews = this.getTodayReviews();
            todayElement.textContent = todayReviews.length;
        }
    }
    
    // شروع مرور لایتنر
    startLeitnerReview() {
        const todayReviews = this.getTodayReviews();
        
        if (todayReviews.length === 0) {
            this.showNotification('هیچ لغتی برای مرور امروز ندارید', 'info');
            return;
        }
        
        this.showLeitnerReviewSession(todayReviews);
    }
    
    // نمایش جلسه مرور
    showLeitnerReviewSession(words) {
        this.switchPage('leitner');
        
        const container = document.getElementById('leitnerContainer');
        if (!container) return;
        
        let currentIndex = 0;
        let sessionWords = [...words];
        
        const showNextWord = () => {
            if (currentIndex >= sessionWords.length) {
                this.showReviewComplete();
                return;
            }
            
            const wordItem = sessionWords[currentIndex];
            const wordData = window.DictionaryDB.searchWord(wordItem.word);
            
            if (!wordData) {
                currentIndex++;
                showNextWord();
                return;
            }
            
            container.innerHTML = `
                <div class="review-session">
                    <div class="session-header">
                        <span class="session-progress">${currentIndex + 1}/${sessionWords.length}</span>
                        <button class="btn-secondary" onclick="app.endReviewSession()">
                            <i class="fas fa-times"></i> پایان مرور
                        </button>
                    </div>
                    
                    <div class="review-card">
                        <div class="review-word">
                            <h2>${wordData.word}</h2>
                            <button class="play-btn" onclick="playWordSound('${wordData.word}')">
                                <i class="fas fa-volume-up"></i>
                            </button>
                        </div>
                        
                        <div class="review-question">
                            <p>معنی این لغت چیست؟</p>
                        </div>
                        
                        <div class="review-answer" style="display: none;">
                            <div class="meaning">
                                <strong>معنی:</strong> ${wordData.meanings[0].persian}
                            </div>
                            <div class="example">
                                <strong>مثال:</strong> ${wordData.meanings[0].examples?.[0]?.english || 'بدون مثال'}
                            </div>
                        </div>
                        
                        <div class="review-actions">
                            <button class="show-answer-btn" onclick="app.showAnswer()">
                                <i class="fas fa-eye"></i> نمایش جواب
                            </button>
                            <div class="difficulty-buttons" style="display: none;">
                                <p>چقدر این لغت را به خاطر آوردید؟</p>
                                <button class="difficulty-btn hard" onclick="app.rateDifficulty('hard', '${wordItem.word}')">
                                    <i class="fas fa-times-circle"></i> سخت بود
                                </button>
                                <button class="difficulty-btn good" onclick="app.rateDifficulty('good', '${wordItem.word}')">
                                    <i class="fas fa-check-circle"></i> خوب بود
                                </button>
                                <button class="difficulty-btn easy" onclick="app.rateDifficulty('easy', '${wordItem.word}')">
                                    <i class="fas fa-star"></i> آسان بود
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };
        
        window.app = this;
        window.app.showAnswer = function() {
            document.querySelector('.review-answer').style.display = 'block';
            document.querySelector('.show-answer-btn').style.display = 'none';
            document.querySelector('.difficulty-buttons').style.display = 'flex';
        };
        
        window.app.rateDifficulty = function(difficulty, word) {
            // آپدیت سطح لغت بر اساس پاسخ
            const wordIndex = this.userData.leitnerWords.findIndex(w => w.word === word);
            if (wordIndex !== -1) {
                if (difficulty === 'easy') {
                    this.userData.leitnerWords[wordIndex].level++;
                    if (this.userData.leitnerWords[wordIndex].level > 7) {
                        this.userData.leitnerWords[wordIndex].level = 7;
                    }
                } else if (difficulty === 'hard') {
                    this.userData.leitnerWords[wordIndex].level = Math.max(1, this.userData.leitnerWords[wordIndex].level - 1);
                }
                
                // تنظیم تاریخ مرور بعدی
                const intervals = [1, 2, 7, 14, 30, 60, 365];
                const nextReview = new Date();
                nextReview.setDate(nextReview.getDate() + intervals[this.userData.leitnerWords[wordIndex].level - 1]);
                this.userData.leitnerWords[wordIndex].nextReview = nextReview.toDateString();
                
                this.saveUserData();
            }
            
            currentIndex++;
            showNextWord();
        }.bind(this);
        
        window.app.endReviewSession = function() {
            this.showNotification('مرور لغات به پایان رسید', 'info');
            this.loadLeitnerBoxes();
        }.bind(this);
        
        showNextWord();
    }
    
    // نمایش اتمام مرور
    showReviewComplete() {
        const container = document.getElementById('leitnerContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="review-complete">
                <div class="complete-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>مرور امروز به پایان رسید! 🎉</h3>
                <p>شما تمام لغات امروز را مرور کردید.</p>
                
                <div class="stats">
                    <div class="stat">
                        <i class="fas fa-brain"></i>
                        <div>
                            <div class="stat-value">${this.userData.leitnerWords.length}</div>
                            <div class="stat-label">لغت در سیستم</div>
                        </div>
                    </div>
                    <div class="stat">
                        <i class="fas fa-star"></i>
                        <div>
                            <div class="stat-value">+5</div>
                            <div class="stat-label">ستاره کسب شده</div>
                        </div>
                    </div>
                </div>
                
                <button class="btn-primary" onclick="app.loadLeitnerBoxes()">
                    <i class="fas fa-home"></i> بازگشت به صفحه لایتنر
                </button>
            </div>
        `;
        
        // افزودن ستاره
        this.userData.stars += 5;
        this.saveUserData();
        this.updateUI();
    }
    
    // مرور یک باکس خاص
    reviewBox(level) {
        const boxWords = this.userData.leitnerWords.filter(word => word.level === level);
        if (boxWords.length === 0) return;
        
        this.showLeitnerReviewSession(boxWords);
    }
    
    // اضافه کردن لغت به لایتنر
    addToLeitner(wordData) {
        if (!wordData || !wordData.word) return;
        
        // بررسی وجود لغت
        const exists = this.userData.leitnerWords.some(w => w.word === wordData.word);
        if (exists) {
            this.showNotification('این لغت قبلاً ذخیره شده است', 'info');
            return;
        }
        
        // افزودن لغت جدید
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1); // مرور فردا
        
        const wordItem = {
            word: wordData.word,
            meaning: wordData.meanings[0].persian,
            level: 1,
            nextReview: nextReview.toDateString(),
            addedDate: new Date().toDateString()
        };
        
        this.userData.leitnerWords.push(wordItem);
        this.saveUserData();
        
        this.showNotification(`"${wordData.word}" به لایتنر اضافه شد`, 'success');
        
        // آپدیت UI اگر در صفحه لایتنر هستیم
        if (this.currentPage === 'leitner') {
            this.updateLeitnerStats();
        }
    }
    
    // اضافه کردن به علاقه‌مندی‌ها
    addToFavorites(word) {
        this.addToLeitner({ word: word });
    }
    
    // بارگذاری گزارش‌ها
    loadReports() {
        const container = document.getElementById('reportsContainer');
        if (!container) return;
        
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        // ساخت گزارش هفتگی
        const weeklyData = this.generateWeeklyData();
        
        container.innerHTML = `
            <div class="reports-content">
                <div class="report-section">
                    <h3><i class="fas fa-chart-line"></i> پیشرفت هفتگی</h3>
                    <div class="chart-container">
                        <div class="chart">
                            ${weeklyData.map((day, index) => `
                                <div class="chart-bar" style="height: ${day.words}%" title="${day.day}: ${day.words} لغت">
                                    <div class="bar-label">${day.day}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="report-cards">
                    <div class="report-card">
                        <i class="fas fa-brain"></i>
                        <div class="card-content">
                            <h4>تسلط لغات</h4>
                            <div class="card-value">${this.getMasteryPercentage()}%</div>
                            <div class="card-progress">
                                <div class="progress-bar" style="width: ${this.getMasteryPercentage()}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-card">
                        <i class="fas fa-calendar"></i>
                        <div class="card-content">
                            <h4>روزهای متوالی</h4>
                            <div class="card-value">${this.userData.streak}</div>
                            <div class="card-subtitle">روز فعال</div>
                        </div>
                    </div>
                    
                    <div class="report-card">
                        <i class="fas fa-trophy"></i>
                        <div class="card-content">
                            <h4>رتبه شما</h4>
                            <div class="card-value">#${this.calculateRank()}</div>
                            <div class="card-subtitle">بین کاربران</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-details">
                    <h4><i class="fas fa-list"></i> جزئیات پیشرفت</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">کل لغات یادگرفته:</span>
                            <span class="detail-value">${this.userData.wordsLearned}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">تست‌های انجام شده:</span>
                            <span class="detail-value">${this.userData.testsCompleted}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ستاره‌های کسب شده:</span>
                            <span class="detail-value">${this.userData.stars}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">مسابقات برده:</span>
                            <span class="detail-value">${this.userData.competitionWins}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // تولید داده هفتگی
    generateWeeklyData() {
        const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
        return days.map(day => ({
            day: day,
            words: Math.floor(Math.random() * 10) + 1,
            tests: Math.floor(Math.random() * 5)
        }));
    }
    
    // محاسبه درصد تسلط
    getMasteryPercentage() {
        if (this.userData.leitnerWords.length === 0) return 0;
        const mastered = this.getMasteredWords().length;
        return Math.round((mastered / this.userData.leitnerWords.length) * 100);
    }
    
    // محاسبه رتبه
    calculateRank() {
        const score = this.userData.wordsLearned * 3 + 
                     this.userData.testsCompleted * 2 + 
                     this.userData.stars + 
                     this.userData.competitionWins * 5;
        
        if (score > 100) return Math.floor(Math.random() * 10) + 1;
        if (score > 50) return Math.floor(Math.random() * 20) + 11;
        return Math.floor(Math.random() * 30) + 21;
    }
    
    // بررسی وضعیت مهمان
    checkGuestStatus() {
        if (this.userData.isGuest && this.userData.testsCompleted >= 5) {
            // نمایش پیشنهاد تماس بعد از ۵ تست
            setTimeout(() => {
                this.showContactModal();
            }, 3000);
        }
    }
    
    // نمایش مدال تماس
    showContactModal() {
        const modal = document.getElementById('contactModal');
        if (modal) {
            modal.classList.add('active');
            
            // دکمه بستن
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            // بستن با کلیک خارج
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }
    
    // نمایش پروفایل
    showProfile() {
        // ساخت مدال پروفایل
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <button class="modal-close">&times;</button>
                <div class="profile-header">
                    <div class="avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <h3>${this.userData.isGuest ? 'کاربر مهمان' : 'کاربر ثبت‌نام شده'}</h3>
                    <p>${this.userData.isGuest ? 'برای دسترسی کامل ثبت‌نام کنید' : 'خوش آمدید!'}</p>
                </div>
                
                <div class="profile-stats">
                    <div class="profile-stat">
                        <i class="fas fa-star"></i>
                        <div>
                            <div class="stat-value">${this.userData.stars}</div>
                            <div class="stat-label">ستاره</div>
                        </div>
                    </div>
                    <div class="profile-stat">
                        <i class="fas fa-brain"></i>
                        <div>
                            <div class="stat-value">${this.userData.wordsLearned}</div>
                            <div class="stat-label">لغت</div>
                        </div>
                    </div>
                    <div class="profile-stat">
                        <i class="fas fa-trophy"></i>
                        <div>
                            <div class="stat-value">${this.userData.competitionWins}</div>
                            <div class="stat-label">برد</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    ${this.userData.isGuest ? `
                    <button class="btn-primary" onclick="app.upgradeAccount()">
                        <i class="fas fa-crown"></i> ارتقاء حساب
                    </button>
                    ` : ''}
                    
                    <button class="btn-secondary" onclick="app.exportData()">
                        <i class="fas fa-download"></i> ذخیره داده‌ها
                    </button>
                    
                    <button class="btn-secondary" onclick="app.resetProgress()">
                        <i class="fas fa-redo"></i> ریست پیشرفت
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // رویدادهای مدال
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // ارتقاء حساب
    upgradeAccount() {
        this.showContactModal();
    }
    
    // خروجی گرفتن داده‌ها
    exportData() {
        const dataStr = JSON.stringify(this.userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dicdeep-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.showNotification('داده‌های شما دانلود شد', 'success');
    }
    
    // ریست پیشرفت
    resetProgress() {
        if (confirm('آیا مطمئن هستید؟ تمام پیشرفت شما پاک خواهد شد.')) {
            localStorage.removeItem('dicdeep_user');
            this.userData = this.loadUserData();
            this.saveUserData();
            this.updateUI();
            this.showNotification('پیشرفت شما ریست شد', 'info');
        }
    }
    
    // بستن همه مدال‌ها
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // آپدیت UI
    updateUI() {
        // آپدیت آمار تست‌ها
        const todayTests = document.getElementById('todayTests');
        const totalStars = document.getElementById('totalStars');
        const streakDays = document.getElementById('streakDays');
        
        if (todayTests) todayTests.textContent = this.userData.testsCompleted;
        if (totalStars) totalStars.textContent = this.userData.stars;
        if (streakDays) streakDays.textContent = this.userData.streak;
    }
    
    // نمایش نوتیفیکیشن
    showNotification(message, type = 'info') {
        // ساخت نوتیفیکیشن
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        // اضافه کردن به صفحه
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        
        // نمایش
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // حذف پس از ۳ ثانیه
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// استایل نوتیفیکیشن‌ها
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    color: #1e293b;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    z-index: 10000;
    max-width: 350px;
    border-right: 4px solid;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-color: #10b981;
    background: #f0fdf4;
}

.notification.error {
    border-color: #ef4444;
    background: #fef2f2;
}

.notification.info {
    border-color: #3b82f6;
    background: #eff6ff;
}

.notification.warning {
    border-color: #f59e0b;
    background: #fffbeb;
}

body.night-mode .notification {
    background: #1e293b;
    color: #f1f5f9;
}

body.night-mode .notification.success {
    background: #064e3b;
}

body.night-mode .notification.error {
    background: #7f1d1d;
}

body.night-mode .notification.info {
    background: #1e3a8a;
}

body.night-mode .notification.warning {
    background: #78350f;
}
`;

document.head.appendChild(notificationStyle);

// ایجاد نمونه برنامه
window.app = new DicDeepApp();

console.log('🎯 Dic-deep App is ready!');
console.log('Available via window.app');
