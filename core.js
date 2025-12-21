const PROXY_URL = "https://script.google.com/macros/s/AKfycbwpS34Rfd59aIpCger7MC2ggs0WyaIxlcfHQ_AjkDevV22HtbkuP-jKcKysNIj0LWwb/exec";

class FredApp {
    constructor() {
        this.score = 0; this.qIndex = 0; this.mistakes = [];
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
            if (params.get('vip') === 'yes') { this.isVIP = true; localStorage.setItem('fred_vip', 'true'); }
        }
        document.getElementById('userBadge').innerText = this.isVIP ? "🎓 VIP Mode" : "👤 Guest";
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US'; u.rate = 0.85;
            window.speechSynthesis.speak(u);
        }
    }

    speakCurrent() { if(this.currentQ) this.speak(this.currentQ.en); }

    startQuiz() {
        document.getElementById('homeMenu').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        this.score = 0; this.qIndex = 0; this.mistakes = []; this.isReviewMode = false;
        this.activePool = [...dictionary].sort(() => 0.5 - Math.random());
        this.nextQuestion();
    }

    nextQuestion() {
        if (!this.isReviewMode && this.qIndex >= 10) { this.finishFirstRound(); return; }
        if (this.isReviewMode && this.activePool.length === 0) { this.endSession(); return; }

        this.qIndex++;
        const correct = this.activePool.pop();
        let wrongs = dictionary.filter(i => i.en !== correct.en).sort(() => 0.5 - Math.random()).slice(0, 3);
        let opts = [correct, ...wrongs].sort(() => 0.5 - Math.random());

        this.currentQ = correct;
        this.speak(correct.en);
        document.getElementById('pFill').style.width = (this.qIndex * 10) + "%";
        
        ui.render(
            correct.ex.replace(new RegExp(correct.en, 'gi'), "_______"), 
            opts.map(o => o.en),
            this.isReviewMode ? "فاز مرور اشتباهات" : `سوال ${this.qIndex} از ۱۰`
        );
    }

    check(chosen) {
        const isCorrect = chosen === this.currentQ.en;
        if (isCorrect) { if (!this.isReviewMode) this.score += 20; } 
        else {
            if (!this.isReviewMode) this.mistakes.push(this.currentQ);
            else this.activePool.unshift(this.currentQ);
            this.speak(this.currentQ.en);
        }
        document.getElementById('scoreDisp').innerText = this.score;
        ui.feedback(isCorrect, this.currentQ.en);
        setTimeout(() => this.nextQuestion(), 1300);
    }

    async finishFirstRound() {
        let msg = `📊 گزارش: ${this.userName}\nامتیاز: ${this.score}\nاشتباهات: ${this.mistakes.length}`;
        fetch(PROXY_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ message: msg }) });

        if (this.mistakes.length > 0) {
            if (confirm(`شما ${this.mistakes.length} اشتباه داشتید. مرور کنیم؟`)) {
                this.isReviewMode = true; this.activePool = [...this.mistakes];
                this.qIndex = 0; this.nextQuestion();
            } else { location.reload(); }
        } else { alert("عالی بود! بدون غلط."); location.reload(); }
    }

    endSession() { alert("مرور تمام شد. لغات ملکه ذهنت شدند!"); location.reload(); }
    toggleTheme() { document.body.style.filter = document.body.style.filter ? "" : "invert(1) hue-rotate(180deg)"; }
}
const app = new FredApp();
