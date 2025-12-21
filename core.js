// Fred Elite Core Logic - Secure & Smart Review System
const PROXY_URL = "https://script.google.com/macros/s/AKfycbwpS34Rfd59aIpCger7MC2ggs0WyaIxlcfHQ_AjkDevV22HtbkuP-jKcKysNIj0LWwb/exec";

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
        // مخلوط کردن لغات از فایل dictionary.js
        this.activePool = [...dictionary].sort(() => 0.5 - Math.random());
        this.nextQuestion();
    }

    nextQuestion() {
        // پایان دور اصلی (۱۰ سوال) یا پایان لیست مرور
        if (!this.isReviewMode && this.qIndex >= 10) {
            this.finishFirstRound();
            return;
        }
        if (this.isReviewMode && this.activePool.length === 0) {
            this.endSession();
            return;
        }

        this.qIndex++;
        const correct = this.activePool.pop();
        let wrongs = dictionary.filter(i => i.en !== correct.en).sort(() => 0.5 - Math.random()).slice(0, 3);
        let opts = [correct, ...wrongs].sort(() => 0.5 - Math.random());

        this.currentQ = correct;
        
        // نمایش اطلاعات در UI
        const statusText = this.isReviewMode ? `Reviewing Mistake #${this.qIndex}` : `Question ${this.qIndex}/10`;
        ui.render(correct.ex.replace(new RegExp(correct.en, 'gi'), "_______"), opts.map(o => o.en), statusText);
    }

    check(chosen) {
        const isCorrect = chosen === this.currentQ.en;
        
        if (isCorrect) {
            if (!this.isReviewMode) this.score += 20;
        } else {
            // در دور اصلی، اشتباهات ذخیره می‌شوند
            if (!this.isReviewMode) {
                this.mistakes.push(this.currentQ);
            } else {
                // در دور مرور، اگر باز هم غلط بزند، لغت به انتهای صف برمی‌گردد تا حتماً یاد بگیرد
                this.activePool.unshift(this.currentQ);
            }
        }
        
        ui.feedback(isCorrect, this.currentQ.en);
        setTimeout(() => this.nextQuestion(), 1300);
    }

    async finishFirstRound() {
        let report = `📊 ${this.userName}\nScore: ${this.score}/200\nMistakes: ${this.mistakes.length}`;
        this.sendToTelegram(report);

        if (this.mistakes.length > 0) {
            const redo = confirm(`You had ${this.mistakes.length} mistakes. Ready to review and fix them?`);
            if (redo) {
                this.isReviewMode = true;
                this.activePool = [...this.mistakes].sort(() => 0.5 - Math.random());
                this.qIndex = 0;
                this.nextQuestion();
            } else { location.reload(); }
        } else {
            alert("Perfect! No mistakes found. 🏆");
            location.reload();
        }
    }

    async sendToTelegram(msg) {
        try {
            fetch(PROXY_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify({ message: msg }) 
            });
        } catch(e) { console.warn("Log failed, but quiz continues."); }
    }

    endSession() {
        alert("Well done! You have corrected all your mistakes. 🌟");
        location.reload();
    }
}

const app = new FredApp();
