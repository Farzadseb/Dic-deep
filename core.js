const PROXY_URL = "https://script.google.com/macros/s/AKfycbwpS34Rfd59aIpCger7MC2ggs0WyaIxlcfHQ_AjkDevV22HtbkuP-jKcKysNIj0LWwb/exec";

class FredApp {
    constructor() {
        this.score = 0;
        this.qIndex = 0;
        this.mistakes = [];
        this.isMuted = false;
        this.isReviewMode = false;
        this.currentQ = null;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        document.getElementById('muteBtn').innerText = this.isMuted ? "🔇" : "🔊";
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
    }

    speak(text) {
        if (!this.isMuted && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US';
            u.rate = 0.8;
            window.speechSynthesis.speak(u);
        }
    }

    exitApp() {
        if (confirm("آیا می‌خواهید به منوی اصلی برگردید؟")) {
            location.reload();
        }
    }

    startQuiz() {
        document.getElementById('homeMenu').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        this.activePool = [...dictionary].sort(() => 0.5 - Math.random());
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.qIndex >= 10 && !this.isReviewMode) {
            this.finishRound();
            return;
        }
        
        this.qIndex++;
        const correct = this.activePool.pop();
        this.currentQ = correct;
        
        // تلفظ خودکار
        this.speak(correct.en);

        let wrongs = dictionary.filter(i => i.en !== correct.en).sort(() => 0.5 - Math.random()).slice(0, 2);
        let opts = [correct, ...wrongs].sort(() => 0.5 - Math.random());

        // آپدیت UI
        document.getElementById('statusLabel').innerText = `سوال ${this.qIndex} از ۱۰`;
        document.getElementById('qText').innerText = correct.ex.replace(new RegExp(correct.en, 'gi'), "_______");
        
        const container = document.getElementById('qOptions');
        container.innerHTML = "";
        opts.forEach(o => {
            const btn = document.createElement('button');
            btn.className = 'neu-btn';
            btn.innerText = o.en;
            btn.onclick = () => this.check(o.en);
            container.appendChild(btn);
        });
    }

    check(chosen) {
        const isCorrect = chosen === this.currentQ.en;
        const fb = document.getElementById('qFeedback');
        fb.classList.remove('hidden');
        
        if (isCorrect) {
            fb.innerText = "✅ Excellent!";
            fb.style.color = "green";
        } else {
            fb.innerText = `❌ Correct: ${this.currentQ.en}`;
            fb.style.color = "red";
            this.mistakes.push(this.currentQ);
            this.speak(this.currentQ.en); // تلفظ مجدد در صورت غلط
        }

        setTimeout(() => {
            fb.classList.add('hidden');
            this.nextQuestion();
        }, 1500);
    }

    finishRound() {
        alert(`تمرین تمام شد! اشتباهات شما: ${this.mistakes.length}`);
        location.reload();
    }
}

const app = new FredApp();
