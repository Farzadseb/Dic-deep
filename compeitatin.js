// سیستم مسابقه آنلاین Dic-deep
class CompetitionSystem {
    constructor() {
        this.isConnected = false;
        this.currentCompetition = null;
        this.opponent = null;
        this.timer = null;
        this.timeLeft = 60; // 60 ثانیه
        this.scores = { player: 0, opponent: 0 };
        this.aiDifficulty = 'medium'; // easy, medium, hard
        this.init();
    }
    
    init() {
        console.log('🤖 Competition System Initialized');
        this.checkConnection();
        
        // تلاش برای اتصال خودکار
        setTimeout(() => {
            this.connect();
        }, 1000);
    }
    
    // بررسی اتصال
    checkConnection() {
        this.isConnected = navigator.onLine;
        return this.isConnected;
    }
    
    // اتصال به سرور مسابقه
    async connect() {
        try {
            // شبیه‌سازی اتصال
            await this.simulateConnection();
            this.isConnected = true;
            console.log('✅ Connected to competition server');
            return true;
        } catch (error) {
            console.warn('⚠️ Competition server unavailable, using AI mode');
            this.isConnected = false;
            return false;
        }
    }
    
    // شبیه‌سازی اتصال
    simulateConnection() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 80% شانس اتصال موفق
                if (Math.random() > 0.2) {
                    resolve();
                } else {
                    reject('Connection failed');
                }
            }, 500);
        });
    }
    
    // پیدا کردن حریف
    async findOpponent(timeout = 30000) {
        if (!this.isConnected) {
            return this.startAICompetition();
        }
        
        console.log('🔍 Looking for opponent...');
        
        // شروع تایمر 30 ثانیه
        let timeLeft = 30;
        const findInterval = setInterval(() => {
            timeLeft--;
            this.updateFindStatus(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(findInterval);
                this.startAICompetition();
            }
        }, 1000);
        
        try {
            // شبیه‌سازی پیدا کردن حریف
            const opponent = await this.simulateFindOpponent();
            
            clearInterval(findInterval);
            this.opponent = opponent;
            
            console.log(`🎯 Found opponent: ${opponent.name}`);
            return opponent;
        } catch (error) {
            clearInterval(findInterval);
            this.startAICompetition();
            return null;
        }
    }
    
    // شبیه‌سازی پیدا کردن حریف
    simulateFindOpponent() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // شانس 70% برای پیدا کردن حریف
                if (Math.random() > 0.3) {
                    resolve({
                        id: 'user_' + Math.random().toString(36).substr(2, 9),
                        name: this.generateRandomName(),
                        level: Math.floor(Math.random() * 5) + 1,
                        country: this.getRandomCountry(),
                        wins: Math.floor(Math.random() * 50),
                        rating: Math.floor(Math.random() * 1000) + 1000
                    });
                } else {
                    // اگر حریف پیدا نشد، AI شروع می‌شود
                    setTimeout(() => {
                        this.startAICompetition();
                    }, 1000);
                }
            }, 2000 + Math.random() * 3000); // تأخیر تصادفی 2-5 ثانیه
        });
    }
    
    // شروع مسابقه با AI
    startAICompetition(difficulty = 'medium') {
        this.aiDifficulty = difficulty;
        
        this.opponent = {
            id: 'ai_opponent',
            name: 'AI Bot',
            level: this.getAILevel(difficulty),
            isAI: true,
            difficulty: difficulty,
            winChance: this.getAIWinChance(difficulty)
        };
        
        console.log(`🤖 Starting competition with AI (${difficulty})`);
        
        // ایجاد مسابقه
        this.createCompetition();
        return this.opponent;
    }
    
    // سطح AI بر اساس سختی
    getAILevel(difficulty) {
        const levels = {
            easy: 1,
            medium: 3,
            hard: 5
        };
        return levels[difficulty] || 3;
    }
    
    // شانس برد کاربر بر اساس سختی
    getAIWinChance(difficulty) {
        const chances = {
            easy: 0.9,   // 90% شانس برد کاربر
            medium: 0.8, // 80% شانس برد کاربر
            hard: 0.6    // 60% شانس برد کاربر
        };
        return chances[difficulty] || 0.8;
    }
    
    // ایجاد مسابقه
    createCompetition() {
        this.currentCompetition = {
            id: 'comp_' + Date.now(),
            startTime: new Date().toISOString(),
            players: ['player', this.opponent.id],
            questions: this.generateQuestions(),
            currentQuestion: 0,
            status: 'active'
        };
        
        this.scores = { player: 0, opponent: 0 };
        this.timeLeft = 60;
        
        // شروع تایمر
        this.startTimer();
        
        return this.currentCompetition;
    }
    
    // تولید سوالات مسابقه
    generateQuestions(count = 10) {
        const questions = [];
        const words = window.DictionaryDB.getRandomWords(count * 4); // کلمات بیشتر برای گزینه‌ها
        
        for (let i = 0; i < count; i++) {
            const correctWord = words[i * 4];
            const options = [
                correctWord.meaning,
                words[i * 4 + 1].meaning,
                words[i * 4 + 2].meaning,
                words[i * 4 + 3].meaning
            ].sort(() => Math.random() - 0.5);
            
            questions.push({
                id: i + 1,
                word: correctWord.word,
                correctAnswer: correctWord.meaning,
                options: options,
                points: 2,
                timeLimit: 15 // 15 ثانیه برای هر سوال
            });
        }
        
        return questions;
    }
    
    // شروع تایمر
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.endCompetition();
            }
        }, 1000);
    }
    
    // آپدیت نمایش تایمر
    updateTimerDisplay() {
        const timerElement = document.querySelector('.competition-timer');
        if (timerElement) {
            timerElement.textContent = `⏱️ ${this.timeLeft} ثانیه`;
            
            if (this.timeLeft <= 10) {
                timerElement.style.color = '#ef4444';
                timerElement.classList.add('pulse');
            }
        }
    }
    
    // آپدیت وضعیت جستجو
    updateFindStatus(timeLeft) {
        const statusElement = document.getElementById('competitionStatus');
        if (statusElement) {
            statusElement.innerHTML = `<i class="fas fa-search"></i> در حال پیدا کردن حریف (${timeLeft} ثانیه)`;
        }
    }
    
    // پاسخ به سوال
    answerQuestion(questionId, answer, responseTime) {
        if (!this.currentCompetition) return null;
        
        const question = this.currentCompetition.questions[questionId - 1];
        const isCorrect = answer === question.correctAnswer;
        
        // محاسبه امتیاز
        let points = 0;
        if (isCorrect) {
            points = question.points;
            
            // امتیاز سریع
            if (responseTime < 5) {
                points += 1;
            }
            
            this.scores.player += points;
        }
        
        // پاسخ AI
        setTimeout(() => {
            this.aiAnswer(questionId);
        }, 500 + Math.random() * 1500);
        
        return {
            isCorrect,
            points,
            correctAnswer: question.correctAnswer
        };
    }
    
    // پاسخ AI
    aiAnswer(questionId) {
        if (!this.currentCompetition || !this.opponent?.isAI) return;
        
        const question = this.currentCompetition.questions[questionId - 1];
        const winChance = this.opponent.winChance;
        
        // تصمیم‌گیری AI بر اساس شانس برد
        const shouldAnswerCorrectly = Math.random() < winChance;
        
        if (shouldAnswerCorrectly) {
            this.scores.opponent += question.points;
        }
        
        // آپدیت صفحه
        this.updateScoreDisplay();
    }
    
    // آپدیت نمایش امتیاز
    updateScoreDisplay() {
        const scoreElement = document.querySelector('.competition-scores');
        if (scoreElement) {
            scoreElement.innerHTML = `
                <div class="score player">
                    <span>شما</span>
                    <strong>${this.scores.player}</strong>
                </div>
                <div class="score-divider">-</div>
                <div class="score opponent">
                    <span>${this.opponent?.name || 'حریف'}</span>
                    <strong>${this.scores.opponent}</strong>
                </div>
            `;
        }
    }
    
    // پایان مسابقه
    endCompetition() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        if (!this.currentCompetition) return;
        
        this.currentCompetition.endTime = new Date().toISOString();
        this.currentCompetition.status = 'completed';
        this.currentCompetition.finalScores = { ...this.scores };
        
        // تعیین برنده
        const winner = this.scores.player > this.scores.opponent ? 'player' : 
                      this.scores.player < this.scores.opponent ? 'opponent' : 'draw';
        
        this.currentCompetition.winner = winner;
        
        // اهدای ستاره
        this.awardStars(winner);
        
        // ذخیره نتیجه
        this.saveCompetitionResult();
        
        // نمایش نتیجه
        this.showCompetitionResult(winner);
        
        return {
            winner,
            scores: this.scores,
            competition: this.currentCompetition
        };
    }
    
    // اهدای ستاره
    awardStars(winner) {
        let stars = 0;
        
        if (winner === 'player') {
            stars = 3;
            if (this.opponent?.isAI && this.aiDifficulty === 'hard') {
                stars += 2; // جایزه اضافه برای شکست AI سخت
            }
        } else if (winner === 'draw') {
            stars = 1;
        }
        
        if (stars > 0) {
            // ذخیره ستاره‌ها
            const userData = JSON.parse(localStorage.getItem('dicdeep_user') || '{}');
            userData.stars = (userData.stars || 0) + stars;
            userData.competitionWins = (userData.competitionWins || 0) + (winner === 'player' ? 1 : 0);
            localStorage.setItem('dicdeep_user', JSON.stringify(userData));
            
            console.log(`⭐ Awarded ${stars} stars to player`);
        }
        
        return stars;
    }
    
    // ذخیره نتیجه مسابقه
    saveCompetitionResult() {
        const history = JSON.parse(localStorage.getItem('dicdeep_competition_history') || '[]');
        
        history.unshift({
            ...this.currentCompetition,
            opponent: this.opponent,
            timestamp: Date.now()
        });
        
        // محدود کردن تاریخچه به ۵۰ مورد آخر
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('dicdeep_competition_history', JSON.stringify(history));
    }
    
    // نمایش نتیجه مسابقه
    showCompetitionResult(winner) {
        const resultMessages = {
            player: {
                title: '🎉 برنده شدید!',
                message: 'تبریک! شما مسابقه را بردید.',
                color: '#10b981'
            },
            opponent: {
                title: '💔 باختید',
                message: 'دفعه بعدی شانس با شماست!',
                color: '#ef4444'
            },
            draw: {
                title: '🤝 مساوی',
                message: 'مسابقه جالبی بود!',
                color: '#f59e0b'
            }
        };
        
        const result = resultMessages[winner] || resultMessages.draw;
        
        // نمایش مدال نتیجه
        this.showResultModal(result);
        
        // ارسال گزارش تلگرام
        this.sendCompetitionReport(result);
    }
    
    // نمایش مدال نتیجه
    showResultModal(result) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content result-modal" style="border-top: 4px solid ${result.color}">
                <div class="result-header">
                    <h2>${result.title}</h2>
                    <div class="result-icon">${result.title.includes('برنده') ? '🏆' : '🤝'}</div>
                </div>
                
                <div class="result-body">
                    <p>${result.message}</p>
                    
                    <div class="final-scores">
                        <div class="score-item">
                            <span>امتیاز شما:</span>
                            <strong>${this.scores.player}</strong>
                        </div>
                        <div class="score-item">
                            <span>امتیاز حریف:</span>
                            <strong>${this.scores.opponent}</strong>
                        </div>
                        <div class="score-item">
                            <span>ستاره‌های کسب شده:</span>
                            <strong>+${this.awardStars(this.currentCompetition.winner)}</strong>
                        </div>
                    </div>
                    
                    <div class="encouragement">
                        <i class="fas fa-fire"></i>
                        <p>ادامه دهید! هر مسابقه شما را قوی‌تر می‌کند.</p>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="btn-primary" onclick="this.closest('.modal').remove(); CompetitionSystem.startNewCompetition()">
                        <i class="fas fa-redo"></i> مسابقه جدید
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i> بستن
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // بستن مدال با کلیک خارج
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // ارسال گزارش تلگرام
    sendCompetitionReport(result) {
        const report = `
🏆 *نتیجه مسابقه Dic-deep*
        
${result.title}
        
📊 امتیازها:
├ شما: ${this.scores.player}
└ ${this.opponent.name}: ${this.scores.opponent}
        
🎯 ${result.message}
        
⏱️ مدت مسابقه: ${this.timeLeft} ثانیه
        
_با تشکر از شرکت شما در مسابقه_
        `;
        
        // ارسال از طریق Telegram API
        window.TelegramBot?.sendMessage(report);
    }
    
    // شروع مسابقه جدید
    startNewCompetition() {
        this.currentCompetition = null;
        this.opponent = null;
        this.scores = { player: 0, opponent: 0 };
        this.timeLeft = 60;
        
        // بازگشت به صفحه مسابقه
        if (window.app) {
            window.app.switchPage('competition');
        }
    }
    
    // دریافت تاریخچه مسابقات
    getCompetitionHistory(limit = 10) {
        const history = JSON.parse(localStorage.getItem('dicdeep_competition_history') || '[]');
        return history.slice(0, limit);
    }
    
    // دریافت آمار مسابقات
    getCompetitionStats() {
        const history = this.getCompetitionHistory(100);
        const total = history.length;
        const wins = history.filter(h => h.winner === 'player').length;
        const losses = history.filter(h => h.winner === 'opponent').length;
        const draws = history.filter(h => h.winner === 'draw').length;
        
        return {
            total,
            wins,
            losses,
            draws,
            winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
            totalStars: history.reduce((sum, h) => sum + (h.winner === 'player' ? 3 : h.winner === 'draw' ? 1 : 0), 0)
        };
    }
    
    // تولید اسم تصادفی برای حریف
    generateRandomName() {
        const firstNames = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    // دریافت کشور تصادفی
    getRandomCountry() {
        const countries = [
            '🇺🇸 USA', '🇬🇧 UK', '🇨🇦 Canada', '🇦🇺 Australia', 
            '🇩🇪 Germany', '🇫🇷 France', '🇯🇵 Japan', '🇰🇷 Korea',
            '🇮🇷 Iran', '🇧🇷 Brazil', '🇮🇳 India', '🇷🇺 Russia'
        ];
        
        return countries[Math.floor(Math.random() * countries.length)];
    }
    
    // دریافت وضعیت اتصال
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            server: 'dicdeep-competition-server',
            latency: Math.floor(Math.random() * 100) + 50,
            onlinePlayers: Math.floor(Math.random() * 1000) + 100
        };
    }
}

// صادر کردن سیستم مسابقه
window.CompetitionSystem = new CompetitionSystem();

// توابع عمومی
function findCompetitionOpponent() {
    return window.CompetitionSystem.findOpponent();
}

function startAICompetition(difficulty = 'medium') {
    return window.CompetitionSystem.startAICompetition(difficulty);
}

function getCompetitionStats() {
    return window.CompetitionSystem.getCompetitionStats();
}

console.log('🤖 Competition System loaded successfully!');
console.log('Available functions: findCompetitionOpponent(), startAICompetition(), getCompetitionStats()');
