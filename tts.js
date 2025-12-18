// سیستم Text-to-Speech با تنظیمات درخواستی
class TTSSystem {
    constructor() {
        this.isEnabled = true;
        this.rate = 0.7; // سرعت 0.7
        this.voiceType = 'female';
        this.voiceLang = 'en-US';
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        
        this.init();
    }
    
    // مقداردهی اولیه
    init() {
        if (!this.synth) {
            console.warn('Speech synthesis not supported');
            this.isEnabled = false;
            return;
        }
        
        // بارگذاری صداها
        this.loadVoices();
        
        // رویداد تغییر صداها
        this.synth.onvoiceschanged = () => {
            this.loadVoices();
        };
        
        // بازیابی تنظیمات از localStorage
        this.loadSettings();
    }
    
    // بارگذاری صداهای موجود
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // انتخاب صدای خانم آمریکایی
        this.selectedVoice = this.voices.find(voice => 
            voice.lang === 'en-US' && 
            voice.name.toLowerCase().includes('female')
        ) || this.voices.find(voice => 
            voice.lang === 'en-US'
        ) || this.voices[0];
        
        console.log(`🎵 TTS System Ready - Voice: ${this.selectedVoice ? this.selectedVoice.name : 'Default'}`);
    }
    
    // بارگذاری تنظیمات
    loadSettings() {
        const saved = localStorage.getItem('tts_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.isEnabled = settings.isEnabled;
            this.rate = settings.rate;
        }
    }
    
    // ذخیره تنظیمات
    saveSettings() {
        const settings = {
            isEnabled: this.isEnabled,
            rate: this.rate
        };
        localStorage.setItem('tts_settings', JSON.stringify(settings));
    }
    
    // پخش متن
    speak(text, callback = null) {
        if (!this.isEnabled || !this.synth) {
            if (callback) callback(false);
            return;
        }
        
        // متوقف کردن پخش قبلی
        this.stop();
        
        // ایجاد utterance جدید
        const utterance = new SpeechSynthesisUtterance(text);
        
        // تنظیمات utterance
        utterance.voice = this.selectedVoice;
        utterance.rate = this.rate; // سرعت 0.7
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        // رویدادها
        utterance.onstart = () => {
            console.log(`🔊 Speaking: "${text}"`);
            this.updateUI(true);
            if (callback) callback(true);
        };
        
        utterance.onend = () => {
            console.log('🔇 Speech finished');
            this.updateUI(false);
            if (callback) callback(false);
        };
        
        utterance.onerror = (event) => {
            console.error('TTS Error:', event);
            this.updateUI(false);
            if (callback) callback(false);
        };
        
        // شروع پخش
        this.synth.speak(utterance);
        this.currentUtterance = utterance;
    }
    
    // پخش لغت انگلیسی
    speakWord(word) {
        if (!word) return;
        
        // پاک کردن تلفظ اضافی
        const cleanWord = word.replace(/[^a-zA-Z\s]/g, '');
        
        // پخش با تأخیر برای تجربه بهتر
        setTimeout(() => {
            this.speak(cleanWord);
        }, 100);
    }
    
    // پخش مثال
    speakExample(example) {
        if (!example) return;
        this.speak(example);
    }
    
    // توقف پخش
    stop() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
            this.updateUI(false);
        }
    }
    
    // تغییر وضعیت صدا
    toggle() {
        this.isEnabled = !this.isEnabled;
        this.saveSettings();
        this.updateToggleButton();
        
        // پخش تست صدا
        if (this.isEnabled) {
            setTimeout(() => {
                this.speak('Sound activated');
            }, 300);
        }
        
        return this.isEnabled;
    }
    
    // تنظیم سرعت
    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(2, rate));
        this.saveSettings();
        return this.rate;
    }
    
    // افزایش سرعت
    increaseRate() {
        return this.setRate(this.rate + 0.1);
    }
    
    // کاهش سرعت
    decreaseRate() {
        return this.setRate(this.rate - 0.1);
    }
    
    // تغییر صدای زن/مرد
    toggleVoice() {
        if (!this.selectedVoice) return;
        
        const currentIsFemale = this.selectedVoice.name.toLowerCase().includes('female');
        const targetGender = currentIsFemale ? 'male' : 'female';
        
        this.selectedVoice = this.voices.find(voice => 
            voice.lang === 'en-US' && 
            voice.name.toLowerCase().includes(targetGender)
        ) || this.selectedVoice;
        
        return this.selectedVoice.name;
    }
    
    // به‌روزرسانی UI دکمه
    updateToggleButton() {
        const button = document.getElementById('soundToggle');
        if (!button) return;
        
        const icon = button.querySelector('i');
        if (this.isEnabled) {
            button.classList.add('sound-active');
            button.classList.remove('sound-inactive');
            icon.className = 'fas fa-volume-up';
            button.title = 'خاموش کردن صدا';
        } else {
            button.classList.remove('sound-active');
            button.classList.add('sound-inactive');
            icon.className = 'fas fa-volume-mute';
            button.title = 'روشن کردن صدا';
        }
    }
    
    // به‌روزرسانی وضعیت پخش در UI
    updateUI(isSpeaking) {
        // آپدیت دکمه‌های پخش در صورت وجود
        const playButtons = document.querySelectorAll('.play-sound-btn');
        playButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isSpeaking ? 'fas fa-stop' : 'fas fa-volume-up';
            }
        });
    }
    
    // پخش تلفظ IPA (شبیه‌سازی شده)
    speakIPA(ipa) {
        // IPA به متن معمولی تبدیل می‌شود (ساده‌سازی)
        const ipaMap = {
            'æ': 'a', 'ɑː': 'ar', 'ə': 'a', 'ɛ': 'e',
            'ɪ': 'i', 'iː': 'ee', 'ʊ': 'oo', 'uː': 'oo',
            'ʌ': 'u', 'ɔː': 'or', 'eɪ': 'ay', 'aɪ': 'eye',
            'ɔɪ': 'oy', 'aʊ': 'ow', 'oʊ': 'oh',
            'θ': 'th', 'ð': 'th', 'ʃ': 'sh', 'ʒ': 'zh',
            'tʃ': 'ch', 'dʒ': 'j', 'ŋ': 'ng'
        };
        
        let text = ipa;
        for (const [symbol, replacement] of Object.entries(ipaMap)) {
            text = text.replace(new RegExp(symbol, 'g'), replacement);
        }
        
        // حذف اسلش‌ها
        text = text.replace(/\//g, '');
        
        this.speak(text);
    }
    
    // تست سیستم
    test() {
        if (!this.isEnabled) {
            console.log('TTS is disabled');
            return false;
        }
        
        this.speak('Hello, this is a test of the text to speech system.');
        return true;
    }
    
    // گرفتن وضعیت سیستم
    getStatus() {
        return {
            enabled: this.isEnabled,
            rate: this.rate,
            voice: this.selectedVoice ? this.selectedVoice.name : 'Not set',
            language: 'en-US',
            supported: !!this.synth
        };
    }
}

// صادر کردن سیستم TTS
window.TTSSystem = new TTSSystem();

// تابع‌های کمکی
function playWordSound(word) {
    window.TTSSystem.speakWord(word);
}

function playExampleSound(example) {
    window.TTSSystem.speakExample(example);
}

function toggleTTS() {
    return window.TTSSystem.toggle();
}

function setTTSSpeed(speed) {
    return window.TTSSystem.setRate(speed);
}

// افزودن استایل برای دکمه‌های صدا
const ttsStyles = `
.sound-active {
    background-color: #10b981 !important;
    color: white !important;
}

.sound-inactive {
    background-color: #ef4444 !important;
    color: white !important;
}

.play-sound-btn {
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #e2e8f0;
    background: white;
    color: #4361ee;
}

.play-sound-btn:hover {
    background: #4361ee;
    color: white;
    transform: scale(1.1);
}

body.night-mode .play-sound-btn {
    background: #1e293b;
    border-color: #334155;
    color: #60a5fa;
}

body.night-mode .play-sound-btn:hover {
    background: #60a5fa;
    color: #1e293b;
}
`;

// اضافه کردن استایل‌ها به صفحه
const styleSheet = document.createElement('style');
styleSheet.textContent = ttsStyles;
document.head.appendChild(styleSheet);

console.log("🎵 TTS System initialized successfully!");
console.log("Available functions: playWordSound('hello'), toggleTTS(), setTTSSpeed(0.5)");
