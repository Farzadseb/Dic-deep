const PROXY_URL = "https://script.google.com/macros/s/AKfycbwpS34Rfd59aIpCger7MC2ggs0WyaIxlcfHQ_AjkDevV22HtbkuP-jKcKysNIj0LWwb/exec";

class FredApp {
    constructor() {
        this.score = 0; this.qIndex = 0; this.mistakes = [];
        this.isMuted = false;
        this.isReviewMode = false;
        this.init();
    }

    init() {
        // تنظیمات اولیه فونت در لود (۱.۵ برابر قبلاً در CSS اعمال شده)
        console.log("Fred Elite Ready.");
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        document.getElementById('muteBtn').innerText = this.isMuted ? "🔇" : "🔊";
    }

    speak(text) {
        if (!this.isMuted && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US'; u.rate = 0.8;
            window.speechSynthesis.speak(u);
        }
    }

    startQuiz() {
        document.getElementById('homeMenu').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        this.activePool = [...dictionary].sort(() => 0.5 - Math.random());
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.qIndex >= 10 && !this.isReviewMode) { this.finishRound(); return; }
        this.qIndex++;
        const correct = this.activePool.pop();
        this.currentQ = correct;
        this.speak(correct.en);
        
        let wrongs = dictionary.filter(i => i.en !== correct.en).sort(() => 0.5 - Math.random()).slice(0, 2);
        let opts = [correct, ...wrongs].sort(() => 0.5 - Math.random());

        ui.render(correct.ex.replace(new RegExp(correct.en, 'gi'), "___"), opts.map(o => o.en), `سوال ${this.qIndex}`);
    }

    check(chosen) {
        const isCorrect = chosen === this.currentQ.en;
        if (!isCorrect) {
            this.mistakes.push(this.currentQ);
            this.speak(this.currentQ.en);
        }
        ui.feedback(isCorrect, this.currentQ.en);
        setTimeout(() => this.nextQuestion(), 1500);
    }

    exitApp() {
        if(confirm("آیا قصد خروج دارید؟")) {
            location.reload(); // بازگشت به منوی اصلی
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
    }

    finishRound() {
        alert(`پایان تمرین. اشتباهات: ${this.mistakes.length}`);
        this.exitApp();
    }
}

const ui = {
    render: (q, opts, status) => {
        document.getElementById('qText').innerHTML = q;
        const container = document.getElementById('qOptions');
        container.innerHTML = "";
        opts.forEach(o => {
            const btn = document.createElement('button');
            btn.className = 'neu-btn';
            btn.innerText = o;
            btn.onclick = () => app.check(o);
            container.appendChild(btn);
        });
    },
    feedback: (isCorrect, correctEn) => {
        const fb = document.getElementById('qFeedback');
        fb.classList.remove('hidden');
        fb.innerText = isCorrect ? "✅ عالی" : `❌ جواب: ${correctEn}`;
        setTimeout(() => fb.classList.add('hidden'), 1000);
    },
    search: () => { /* منطق جستجو */ }
};

const app = new FredApp();
