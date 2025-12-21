// Fred Elite Core Logic - Integrated with Secure Proxy
const PROXY_URL = "Https://script.google.com/macros/s/AKfycbwpS34Rfd59aIpCger7MC2ggs0WyaIxlcfHQ_AjkDevV22HtbkuP-jKcKysNIj0LWwb/exec";

class FredApp {
    constructor() {
        this.score = 0;
        this.qIndex = 0;
        this.mistakes = []; 
        this.isReviewMode = false;
        this.userName = localStorage.getItem('fred_name') || "Guest";
        this.isVIP = localStorage.getItem('fred_vip') === 'true';
        this.init();
    }

    init() {
        // مدیریت ورود اتوماتیک از طریق URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('name')) {
            this.userName = params.get('name');
            localStorage.setItem('fred_name', this.userName);
            if (params.get('vip') === 'yes') {
                this.isVIP = true;
                localStorage.setItem('fred_vip', 'true');
            }
        }
        document.getElementById('userBadge').innerText = this.isVIP ? "🎓 VIP Mode" : "👤 Guest Mode";
    }

    startQuiz() {
        document.getElementById('homeMenu').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        this.score = 0;
        this.qIndex = 0;
        this.mistakes = [];
        this.isReviewMode = false;
        this.activePool = [...dictionary].sort(() => 0.5 - Math.random());
        this.nextQuestion();
    }

    nextQuestion() {
        // چک کردن پایان دور اول (۱۰ سوال) یا پایان مرور اشتباهات
        if (!this.isReviewMode && this.qIndex >= 10) {
            this.finishFirstRound();
            return;
        }
        if (this.isReviewMode && this.activePool.length === 0) {
            this.endSession();
            return;
        }

        this.qIndex++;
        
        // انتخاب لغت (اگر در حالت مرور باشد از لیست اشتباهات، وگرنه تصادفی)
        const correct = this.activePool.pop();
        let wrongs = dictionary.filter(i => i.en !== correct.en).sort(() => 0.5 - Math.random()).slice(0, 3);
        let opts = [correct, ...wrongs].sort(() => 0.5 - Math.random());

        this.currentQ = correct;
        
        // فراخوانی رابط کاربری (توابع UI در index.html تعریف شده‌اند)
        ui.render(
            correct.ex.replace(new RegExp(correct.en, 'gi'), "_______"), 
            opts.map(o => o.en),
            (this.isReviewMode ? "Review Mode" : `Question ${this.qIndex}/10`)
        );
    }

    check(chosen) {
        const isCorrect = chosen === this.currentQ.en;
        
        if (isCorrect) {
            if (!this.isReviewMode) this.score += 20;
        } else {
            // اگر در دور اول اشتباه کند، به لیست مرور اضافه می‌شود
            if (!this.isReviewMode) {
                this.mistakes.push(this.currentQ);
            } else {
                // اگر در زمان مرور هم اشتباه کند، دوباره به ته لیست می‌رود تا یاد بگیرد
                this.activePool.unshift(this.currentQ);
            }
        }
        
        ui.feedback(isCorrect, this.currentQ.en);
        setTimeout(() => this.nextQuestion(), 1300);
    }

    async finishFirstRound() {
        // ارسال گزارش امن به تلگرام شاگرد/استاد
        let report = `📊 ${this.userName}\nScore: ${this.score}\nMistakes: ${this.mistakes.length}`;
        this.sendToTelegram(report);

        if (this.mistakes.length > 0) {
            // افکت بصری برای شروع فاز مرور
            if (confirm(`You had ${this.mistakes.length} mistakes. Let's fix them!`)) {
                this.isReviewMode = true;
                this.activePool = [...this.mistakes].sort(() => 0.5 - Math.random());
                this.qIndex = 0;
                this.nextQuestion();
            } else {
                location.reload();
            }
        } else {
            alert("Perfect! No mistakes found. Excellence achieved! 🏆");
            location.reload();
        }
    }

    async sendToTelegram(msg) {
        // استفاده از پروکسی شما برای امنیت توکن
        try {
            fetch(PROXY_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify({ message: msg }) 
            });
        } catch(e) { console.log("Reporting offline."); }
    }

    endSession() {
        alert("Well done! You have mastered your mistakes. 🌟");
        location.reload();
    }
}

const app = new FredApp();
