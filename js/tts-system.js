// 🔊 سیستم TTS برای Dic-deep
class TTSSystem {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.settings = {
            autoPlay: true,
            speed: 0.7,
            voice: 'en-US',
            volume: 1.0
        };
        this.loadSettings();
    }

    speak(text, callback = null) {
        if (!this.synth) {
            console.warn('مرورگر از TTS پشتیبانی نمی‌کند');
            if (callback) callback(false);
            return;
        }

        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.settings.speed;
        utterance.lang = this.settings.voice;
        utterance.volume = this.settings.volume;

        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log(`🔊 پخش: "${text}"`);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            if (callback) callback(true);
        };

        utterance.onerror = (error) => {
            this.isSpeaking = false;
            console.error('خطا:', error);
            if (callback) callback(false);
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    stop() {
        if (this.synth && this.isSpeaking) {
            this.synth.cancel();
            this.isSpeaking = false;
        }
    }

    setSpeed(speed) {
        this.settings.speed = Math.max(0.5, Math.min(1.5, speed));
        this.saveSettings();
    }

    toggleAutoPlay() {
        this.settings.autoPlay = !this.settings.autoPlay;
        this.saveSettings();
        return this.settings.autoPlay;
    }

    isAvailable() {
        return !!window.speechSynthesis;
    }

    saveSettings() {
        localStorage.setItem('dicdeep-tts-settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('dicdeep-tts-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
}

// ایجاد نمونه جهانی
window.dicdeepTTS = new TTSSystem();
