// ایجاد نمونه TTS
const tts = new TTSSystem();

// توابع اصلی
function searchWord() {
    const input = document.getElementById('searchInput');
    const word = input.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!word) {
        showError('لطفاً یک لغت انگلیسی وارد کنید');
        return;
    }
    
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('initialLoading').style.display = 'none';
    
    if (dictionary[word]) {
        displayWord(word, dictionary[word]);
        
        if (tts.settings.autoPlay) {
            setTimeout(() => {
                playWordAudio(word);
            }, 300);
        }
    } else {
        showWordNotFound(word);
    }
}

function displayWord(word, data) {
    const resultsDiv = document.getElementById('searchResults');
    
    let examplesHTML = '';
    data.examples.forEach((example, index) => {
        examplesHTML += `
            <div class="example-item">
                <div>
                    <div class="example-text">${example.en}</div>
                    <div class="example-translation">${example.fa}</div>
                </div>
                <button class="example-audio-btn" onclick="playExampleAudio('${example.en.replace(/'/g, "\\'")}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `;
    });
    
    let collocationsHTML = '';
    if (data.collocations && data.collocations.length > 0) {
        data.collocations.forEach(coll => {
            collocationsHTML += `
                <div class="collocation-tag">
                    <i class="fas fa-link"></i>
                    ${coll.phrase} (${coll.meaning})
                </div>
            `;
        });
    }
    
    let phrasalHTML = '';
    if (data.phrasal_verbs && data.phrasal_verbs.length > 0) {
        data.phrasal_verbs.forEach(ph => {
            phrasalHTML += `
                <div class="phrasal-tag">
                    <i class="fas fa-bolt"></i>
                    ${ph.phrase} (${ph.meaning})
                </div>
            `;
        });
    }
    
    const html = `
        <div class="word-card">
            <div class="word-header">
                <div class="word-title">
                    <div>
                        <div class="word-text">${word}</div>
                        <div class="word-meaning">${data.meaning}</div>
                    </div>
                </div>
                <div class="word-audio">
                    <button class="play-btn" onclick="playWordAudio('${word}')" id="play-${word}">
                        <i class="fas fa-play-circle"></i>
                        پخش تلفظ
                    </button>
                </div>
            </div>
            
            <h3 class="section-title">
                <i class="fas fa-comment-dots"></i>
                مثال‌ها
            </h3>
            <div class="examples-list">
                ${examplesHTML}
            </div>
            
            ${collocationsHTML ? `
                <h3 class="section-title">
                    <i class="fas fa-link"></i>
                    کالوکیشن‌ها
                </h3>
                <div class="collocations-container">
                    ${collocationsHTML}
                </div>
            ` : ''}
            
            ${phrasalHTML ? `
                <h3 class="section-title">
                    <i class="fas fa-bolt"></i>
                    Phrasal Verbs
                </h3>
                <div class="collocations-container">
                    ${phrasalHTML}
                </div>
            ` : ''}
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

function playWordAudio(word) {
    if (!tts.isAvailable()) {
        alert('مرورگر شما از TTS پشتیبانی نمی‌کند.');
        return;
    }
    
    const button = document.getElementById(`play-${word}`);
    if (button) {
        button.innerHTML = '<i class="fas fa-pause-circle"></i> در حال پخش...';
        button.classList.add('playing');
    }
    
    const success = tts.speak(word, (success) => {
        if (button) {
            button.innerHTML = '<i class="fas fa-play-circle"></i> پخش مجدد';
            button.classList.remove('playing');
        }
    });
}

function playExampleAudio(text) {
    tts.speak(text);
}

function toggleAutoPlay() {
    tts.toggleAutoPlay();
}

function changeSpeed(delta) {
    tts.setSpeed(tts.settings.speed + delta);
}

function testTTS() {
    if (tts.isAvailable()) {
        tts.speak('Welcome to Dic-deep');
        alert('✅ سیستم صوت فعال است!');
    } else {
        alert('❌ سیستم صوت فعال نیست');
    }
}

// راهنما
function showHelp() {
    alert(`📖 راهنما:
1. لغت انگلیسی را وارد کنید
2. معنی و مثال‌ها نمایش داده می‌شود
3. صوت به طور خودکار پخش می‌شود
4. برای پخش مثال‌ها روی دکمه 🔊 کلیک کنید`);
}

// شروع برنامه
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('initialLoading').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'block';
    }, 1000);
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWord();
    });
});
