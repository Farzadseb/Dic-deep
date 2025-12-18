// سیستم تست‌های روزانه و تمرین
class DailyTests {
    constructor() {
        this.dailyLimit = 10; // ۱۰ تست روزانه
        this.testHistory = this.loadHistory();
        this.currentTest = null;
        this.init();
    }
    
    init() {
        console.log('📝 Daily Tests System Initialized');
        this.checkDailyReset();
    }
    
    // بارگذاری تاریخچه
    loadHistory() {
        const saved = localStorage.getItem('dicdeep_test_history');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }
    
    // ذخیره تاریخچه
    saveHistory() {
        localStorage.setItem('dicdeep_test_history', JSON.stringify(this.testHistory));
    }
    
    // بررسی ریست روزانه
    checkDailyReset() {
        const today = new Date().toDateString();
        const lastTestDate = this.testHistory[0]?.date;
        
        if (lastTestDate !== today) {
            // ریست شمارنده تست‌های امروز
            const userData = JSON.parse(localStorage.getItem('dicdeep_user') || '{}');
            userData.testsToday = 0;
            localStorage.setItem('dicdeep_user', JSON.stringify(userData));
            
            console.log('🔄 Daily test counter reset');
        }
    }
    
    // ایجاد تست جدید
    createTest(type = 'vocabulary', questionCount = 10) {
        const today = new Date().toDateString();
        const todayTests = this.testHistory.filter(test => test.date === today);
        
        // بررسی محدودیت تست روزانه
        if (todayTests.length >= this.dailyLimit) {
            console.log('⚠️ Daily test limit reached');
            return null;
        }
        
        // بررسی محدودیت مهمان (۵ تست)
        const userData = JSON.parse(localStorage.getItem('dicdeep_user') || '{}');
        if (userData.isGuest && userData.testsCompleted >= 5) {
            console.log('⚠️ Guest test limit reached (5 tests)');
            
            // نمایش پیام تماس
            setTimeout(() => {
                if (window.app) {
                    window.app.showContactModal();
                }
            }, 1000);
            
            return null;
        }
        
        // ایجاد تست
        const test = {
            id: 'test_' + Date.now(),
            type: type,
            date: today,
            startTime: new Date().toISOString(),
            questions: this.generateQuestions(type, questionCount),
            completed: false,
            score: 0,
            timeSpent: 0
        };
        
        this.currentTest = test;
        return test;
    }
    
    // تولید سوالات
    generateQuestions(type, count) {
        const questions = [];
        const words = window.DictionaryDB.getRandomWords(count * 4);
        
        for (let i = 0; i < count; i++) {
            let question;
            
            switch(type) {
                case 'vocabulary':
                    question = this.createVocabularyQuestion(words, i);
                    break;
                case 'listening':
                    question = this.createListeningQuestion(words, i);
                    break;
                case 'grammar':
                    question = this.createGrammarQuestion(words, i);
                    break;
                default:
                    question = this.createVocabularyQuestion(words, i);
            }
            
            questions.push(question);
        }
        
        return questions;
    }
    
    // ایجاد سوال لغت
    createVocabularyQuestion(words, index) {
        const correctWord = words[index * 4];
        const options = [
            correctWord.meaning,
            words[index * 4 + 1].meaning,
            words[index * 4 + 2].meaning,
            words[index * 4 + 3].meaning
        ].sort(() => Math.random() - 0.5);
        
        return {
            type: 'vocabulary',
            word: correctWord.word,
            question: `معنی "${correctWord.word}" چیست؟`,
            options: options,
            correctAnswer: correctWord.meaning,
            points: 1
        };
    }
    
    // ایجاد سوال شنیداری (شبیه‌سازی)
    createListeningQuestion(words, index) {
        const correctWord = words[index * 4];
        
        return {
            type: 'listening',
            word: correctWord.word,
            question: 'گوش دهید و لغت را انتخاب کنید:',
            audio: correctWord.word, // برای پخش TTS
            options: [
                correctWord.word,
                words[index * 4 + 1].word,
                words[index * 4 + 2].word,
                words[index * 4 + 3].word
            ].sort(() => Math.random() - 0.5),
            correctAnswer: correctWord.word,
            points: 2
        };
    }
    
    // ایجاد سوال گرامر
    createGrammarQuestion(words, index) {
        const templates = [
            {
                sentence: "I ___ to school every day.",
                options: ["go", "goes", "going", "went"],
                correct: "go"
            },
            {
                sentence: "She ___ a book right now.",
                options: ["read", "reads", "is reading", "reading"],
                correct: "is reading"
            },
            {
                sentence: "They ___ football yesterday.",
                options: ["play", "plays", "played", "playing"],
                correct: "played"
            }
        ];
        
        const template = templates[index % templates.length];
        return {
            type: 'grammar',
            question: template.sentence,
            options: template.options,
            correctAnswer: template.correct,
            points: 1
        };
    }
    
    // شروع تست
    startTest(testId) {
        if (!this.currentTest || this.currentTest.id !== testId) {
            return false;
        }
        
        this.currentTest.startTime = new Date().toISOString();
        this.currentTest.status = 'in-progress';
        
        return true;
    }
    
    // پاسخ به سوال
    answerQuestion(testId, questionIndex, answer) {
        if (!this.currentTest || this.currentTest.id !== testId) {
            return null;
        }
        
        const question = this.currentTest.questions[questionIndex];
        if (!question) return null;
        
        const isCorrect = answer === question.correctAnswer;
        const response = {
            questionIndex,
            answer,
            isCorrect,
            correctAnswer: question.correctAnswer,
            points: isCorrect ? question.points : 0
        };
        
        // ذخیره پاسخ
        if (!this.currentTest.answers) {
            this.currentTest.answers = [];
        }
        this.currentTest.answers.push(response);
        
        return response;
    }
    
    // پایان تست
    finishTest(testId) {
        if (!this.currentTest || this.currentTest.id !== testId) {
            return null;
        }
        
        const test = this.currentTest;
        const endTime = new Date();
        const startTime = new Date(test.startTime);
        
        test.endTime = endTime.toISOString();
        test.timeSpent = Math.round((endTime - startTime) / 1000); // ثانیه
        test.completed = true;
        
        // محاسبه امتیاز
        test.score = this.calculateScore(test);
        test.correctCount = test.answers?.filter(a => a.isCorrect).length || 0;
        test.totalQuestions = test.questions.length;
        
        // ذخیره تاریخچه
        this.testHistory.unshift(test);
        this.saveHistory();
        
        // آپدیت آمار کاربر
        this.updateUserStats(test);
        
        // پاک کردن تست جاری
        this.currentTest = null;
        
        // اهدای ستاره
        const starsEarned = this.awardStars(test);
        
        return {
            test,
            starsEarned
        };
    }
    
    // محاسبه امتیاز
    calculateScore(test) {
        if (!test.answers) return 0;
        
        return test.answers.reduce((total, answer) => {
            return total + (answer.isCorrect ? answer.points : 0);
        }, 0);
    }
    
    // آپدیت آمار کاربر
    updateUserStats(test) {
        const userData = JSON.parse(localStorage.getItem('dicdeep_user') || '{}');
        
        userData.testsCompleted = (userData.testsCompleted || 0) + 1;
        userData.testsToday = (userData.testsToday || 0) + 1;
        
        // محاسبه روزهای متوالی
        this.updateStreak(userData);
        
        localStorage.setItem('dicdeep_user', JSON.stringify(userData));
    }
    
    // آپدیت روزهای متوالی
    updateStreak(userData) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastLogin = userData.lastLogin ? new Date(userData.lastLogin) : null;
        
        if (!lastLogin) {
            // اولین ورود
            userData.streak = 1;
        } else if (lastLogin.toDateString() === yesterday.toDateString()) {
            // ورود متوالی
            userData.streak = (userData.streak || 0) + 1;
        } else if (lastLogin.toDateString() !== today.toDateString()) {
            // شکستن توالی
            userData.streak = 1;
        }
        
        userData.lastLogin = today.toISOString();
    }
    
    // اهدای ستاره
    awardStars(test) {
        const scorePercentage = (test.score / (test.questions.length * 2)) * 100;
        let stars = 0;
        
        if (scorePercentage >= 90) {
            stars = 3;
        } else if (scorePercentage >= 70) {
            stars = 2;
        } else if (scorePercentage >= 50) {
            stars = 1;
        }
        
        // اضافه کردن ستاره به کاربر
        if (stars > 0) {
            const userData = JSON.parse(localStorage.getItem('dicdeep_user') || '{}');
            userData.stars = (userData.stars || 0) + stars;
            localStorage.setItem('dicdeep_user', JSON.stringify(userData));
        }
        
        return stars;
    }
    
    // دریافت تست‌های امروز
    getTodayTests() {
        const today = new Date().toDateString();
        return this.testHistory.filter(test => test.date === today);
    }
    
    // دریافت تعداد تست‌های امروز
    getTodayTestCount() {
        return this.getTodayTests().length;
    }
    
    // بررسی امکان تست جدید
    canTakeTest() {
        const todayTestCount = this.getTodayTestCount();
        
        if (todayTestCount >= this.dailyLimit) {
            return {
                allowed: false,
                reason: 'daily_limit',
                message: 'حد مجاز تست روزانه (۱۰ تست) تکمیل شده است'
            };
        }
        
        const userData = JSON.parse(localStorage.getItem('dicdeep_user') || '{}');
        if (userData.isGuest && userData.testsCompleted >= 5) {
            return {
                allowed: false,
                reason: 'guest_limit',
                message: 'مهمانان فقط ۵ تست رایگان دارند'
            };
        }
        
        return {
            allowed: true,
            reason: 'ok',
            message: 'می‌توانید تست جدید شروع کنید'
        };
    }
    
    // دریافت آمار تست‌ها
    getTestStats() {
        const totalTests = this.testHistory.length;
        const totalScore = this.testHistory.reduce((sum, test) => sum + test.score, 0);
        const averageScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
        
        // تست‌های ۷ روز اخیر
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const recentTests = this.testHistory.filter(test => 
            new Date(test.date) >= lastWeek
        );
        
        // بهترین امتیاز
        const bestScore = this.testHistory.length > 0 ? 
            Math.max(...this.testHistory.map(test => test.score)) : 0;
        
        return {
            totalTests,
            averageScore,
            bestScore,
            recentTests: recentTests.length,
            todayTests: this.getTodayTestCount(),
            totalStars: this.testHistory.reduce((sum, test) => {
                const scorePercentage = (test.score / (test.questions?.length * 2 || 1)) * 100;
                if (scorePercentage >= 90) return sum + 3;
                if (scorePercentage >= 70) return sum + 2;
                if (scorePercentage >= 50) return sum + 1;
                return sum;
            }, 0)
        };
    }
    
    // دریافت نقاط ضعف
    getWeaknesses() {
        const weaknesses = {
            vocabulary: [],
            grammar: [],
            listening: []
        };
        
        // تحلیل ۱۰ تست آخر
        const recentTests = this.testHistory.slice(0, 10);
        
        recentTests.forEach(test => {
            test.answers?.forEach((answer, index) => {
                const question = test.questions[index];
                if (!answer.isCorrect && question) {
                    switch(question.type) {
                        case 'vocabulary':
                            weaknesses.vocabulary.push({
                                word: question.word,
                                correct: question.correctAnswer,
                                chosen: answer.answer
                            });
                            break;
                        case 'grammar':
                            weaknesses.grammar.push({
                                question: question.question,
                                correct: question.correctAnswer,
                                chosen: answer.answer
                            });
                            break;
                        case 'listening':
                            weaknesses.listening.push({
                                word: question.word,
                                correct: question.correctAnswer,
                                chosen: answer.answer
                            });
                            break;
                    }
                }
            });
        });
        
        // حذف موارد تکراری
        Object.keys(weaknesses).forEach(key => {
            const unique = [];
            const seen = new Set();
            
            weaknesses[key].forEach(item => {
                const identifier = JSON.stringify(item);
                if (!seen.has(identifier)) {
                    seen.add(identifier);
                    unique.push(item);
                }
            });
            
            weaknesses[key] = unique.slice(0, 5); // فقط ۵ مورد از هر نوع
        });
        
        return weaknesses;
    }
    
    // ایجاد تمرین بر اساس نقاط ضعف
    createWeaknessPractice() {
        const weaknesses = this.getWeaknesses();
        const practiceQuestions = [];
        
        // سوالات لغت
        weaknesses.vocabulary.forEach(item => {
            practiceQuestions.push({
                type: 'vocabulary',
                word: item.word,
                question: `معنی "${item.word}" چیست؟`,
                options: [
                    item.correct,
                    this.getRandomMeaning(item.correct),
                    this.getRandomMeaning(item.correct),
                    this.getRandomMeaning(item.correct)
                ].sort(() => Math.random() - 0.5),
                correctAnswer: item.correct,
                points: 1
            });
        });
        
        // سوالات گرامر
        weaknesses.grammar.forEach(item => {
            practiceQuestions.push({
                type: 'grammar',
                question: item.question,
                options: [
                    item.correct,
                    item.chosen,
                    this.getRandomOption(item.correct),
                    this.getRandomOption(item.correct)
                ].sort(() => Math.random() - 0.5),
                correctAnswer: item.correct,
                points: 1
            });
        });
        
        // سوالات شنیداری
        weaknesses.listening.forEach(item => {
            practiceQuestions.push({
                type: 'listening',
                word: item.word,
                question: 'گوش دهید و لغت را انتخاب کنید:',
                audio: item.word,
                options: [
                    item.correct,
                    item.chosen,
                    this.getRandomWord(item.correct),
                    this.getRandomWord(item.correct)
                ].sort(() => Math.random() - 0.5),
                correctAnswer: item.correct,
                points: 2
            });
        });
        
        if (practiceQuestions.length === 0) {
            return null;
        }
        
        return {
            id: 'practice_' + Date.now(),
            type: 'weakness_practice',
            date: new Date().toDateString(),
            questions: practiceQuestions,
            completed: false
        };
    }
    
    // دریافت معنی تصادفی
    getRandomMeaning(exclude) {
        const allWords = window.DictionaryDB.getAllWords();
        let randomMeaning;
        
        do {
            const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            randomMeaning = randomWord.meaning;
        } while (randomMeaning === exclude && allWords.length > 1);
        
        return randomMeaning;
    }
    
    // دریافت گزینه تصادفی
    getRandomOption(exclude) {
        const options = ['is', 'are', 'am', 'was', 'were', 'do', 'does', 'did'];
        let randomOption;
        
        do {
            randomOption = options[Math.floor(Math.random() * options.length)];
        } while (randomOption === exclude && options.length > 1);
        
        return randomOption;
    }
    
    // دریافت لغت تصادفی
    getRandomWord(exclude) {
        const allWords = window.DictionaryDB.getAllWords();
        let randomWord;
        
        do {
            const random = allWords[Math.floor(Math.random() * allWords.length)];
            randomWord = random.word;
        } while (randomWord === exclude && allWords.length > 1);
        
        return randomWord;
    }
    
    // ریست تاریخچه تست‌ها
    resetHistory() {
        this.testHistory = [];
        this.saveHistory();
        return true;
    }
    
    // اکسپورت تاریخچه
    exportHistory() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            tests: this.testHistory,
            stats: this.getTestStats()
        };
    }
}

// صادر کردن سیستم تست‌ها
window.DailyTests = new DailyTests();

// توابع عمومی
function createDailyTest(type = 'vocabulary') {
    return window.DailyTests.createTest(type);
}

function getTestStats() {
    return window.DailyTests.getTestStats();
}

function getWeaknesses() {
    return window.DailyTests.getWeaknesses();
}

console.log('📝 Daily Tests System loaded successfully!');
console.log('Available functions: createDailyTest(), getTestStats(), getWeaknesses()');
