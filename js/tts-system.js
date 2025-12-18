// سیستم TTS
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
            if (callback) callback(false);
            return false;
        }
        
        this.stop();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.settings.speed;
        utterance.lang = this.settings.voice;
        utterance.volume = this.settings.volume;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            if (callback) callback(true);
        };
        
        utterance.onerror = () => {
            this.isSpeaking = false;
            if (callback) callback(false);
        };
        
        this.currentUtterance = utterance;
        this.synth.speak(utterance);
        return true;
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
        this.updateDisplay();
    }
    
    toggleAutoPlay() {
        this.settings.autoPlay = !this.settings.autoPlay;
        this.saveSettings();
        this.updateDisplay();
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
            Object.assign(this.settings, JSON.parse(saved));
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        const speedDisplay = document.getElementById('speed-display');
        if (speedDisplay) {
            speedDisplay.textContent = this.settings.speed.toFixed(1) + 'x';
        }
        
        const autoplayBtn = document.getElementById('autoplay-btn');
        const autoplayIcon = document.getElementById('autoplay-icon');
        const autoplayText = document.getElementById('autoplay-text');
        
        if (autoplayBtn && autoplayIcon && autoplayText) {
            if (this.settings.autoPlay) {
                autoplayIcon.className = 'fas fa-volume-up';
                autoplayText.textContent = 'پخش خودکار: روشن';
                autoplayBtn.classList.add('active');
            } else {
                autoplayIcon.className = 'fas fa-volume-mute';
                autoplayText.textContent = 'پخش خودکار: خاموش';
                autoplayBtn.classList.remove('active');
            }
        }
    }
}
