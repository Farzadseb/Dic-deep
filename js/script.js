// اسکریپت ساده و تمیز
document.addEventListener('DOMContentLoaded', function() {
    // تعامل با دکمه‌های ناوبری
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // حذف کلاس active از همه دکمه‌ها
            navButtons.forEach(btn => btn.classList.remove('active'));
            // اضافه کردن کلاس active به دکمه کلیک شده
            this.classList.add('active');
        });
    });

    // کپی کردن نام فایل
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        item.addEventListener('click', function() {
            const fileName = this.querySelector('.filename').textContent;
            
            // انیمیشن انتخاب
            this.style.transform = 'translateX(4px)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
            }, 300);
            
            console.log(`Selected file: ${fileName}`);
        });
    });

    // دکمه ایجاد ریلیز جدید
    const releaseBtn = document.querySelector('.release-btn');
    if (releaseBtn) {
        releaseBtn.addEventListener('click', function() {
            alert('Create New Release feature will be available soon!');
        });
    }

    // دکمه دانلود
    const downloadBtn = document.querySelector('.contributor-actions .action-btn:first-child');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('Download feature is under development!');
        });
    }

    // بروزرسانی زمان‌ها
    function updateTimes() {
        const times = document.querySelectorAll('.time');
        const now = new Date();
        
        times.forEach(timeElement => {
            const hoursAgo = Math.floor(Math.random() * 5);
            if (hoursAgo === 0) {
                timeElement.textContent = 'just now';
            } else if (hoursAgo === 1) {
                timeElement.textContent = '1 hour ago';
            } else {
                timeElement.textContent = `${hoursAgo} hours ago`;
            }
        });
    }
    
    // بروزرسانی زمان هر 30 ثانیه
    setInterval(updateTimes, 30000);

    // تغییر تم ساده
    const themeBtn = document.createElement('button');
    themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    themeBtn.className = 'theme-toggle';
    themeBtn.style.position = 'fixed';
    themeBtn.style.bottom = '20px';
    themeBtn.style.right = '20px';
    themeBtn.style.background = 'var(--primary)';
    themeBtn.style.color = 'white';
    themeBtn.style.border = 'none';
    themeBtn.style.borderRadius = '50%';
    themeBtn.style.width = '50px';
    themeBtn.style.height = '50px';
    themeBtn.style.cursor = 'pointer';
    themeBtn.style.zIndex = '1000';
    themeBtn.style.display = 'flex';
    themeBtn.style.alignItems = 'center';
    themeBtn.style.justifyContent = 'center';
    themeBtn.style.fontSize = '20px';
    
    themeBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
    
    document.body.appendChild(themeBtn);

    // استایل تم تاریک
    const darkModeStyle = document.createElement('style');
    darkModeStyle.textContent = `
        .dark-mode {
            --background: #0d1117;
            --surface: #161b22;
            --border: #30363d;
            --text-primary: #c9d1d9;
            --text-secondary: #8b949e;
            --text-muted: #6e7681;
            --secondary: #21262d;
        }
        
        .dark-mode .card,
        .dark-mode .files-container,
        .dark-mode .readme-section {
            background: var(--surface);
        }
        
        .dark-mode .header {
            background: linear-gradient(135deg, var(--surface) 0%, #0d1117 100%);
        }
        
        .dark-mode .btn {
            background: var(--surface);
        }
        
        .dark-mode .file-item:hover {
            background: rgba(255, 255, 255, 0.05);
        }
    `;
    document.head.appendChild(darkModeStyle);
});
