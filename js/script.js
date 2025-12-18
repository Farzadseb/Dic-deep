// اسکریپت برای Dic-deep
document.addEventListener('DOMContentLoaded', function() {
    // تعامل با دکمه‌ها
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const text = this.textContent.trim();
            alert(`Clicked: ${text}`);
        });
    });

    // کپی کردن نام فایل
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.file-action-btn')) return;
            
            const fileName = this.querySelector('.file-name').textContent;
            const fileType = fileName.split('.').pop();
            
            // ایجاد انیمیشن انتخاب
            this.style.backgroundColor = 'rgba(45, 164, 78, 0.1)';
            this.style.borderColor = 'var(--primary-color)';
            
            setTimeout(() => {
                this.style.backgroundColor = '';
                this.style.borderColor = '';
            }, 500);
            
            console.log(`Selected: ${fileName} (${fileType.toUpperCase()})`);
        });
    });

    // دکمه‌های سایدبار
    const releaseBtn = document.querySelector('.release-btn');
    if (releaseBtn) {
        releaseBtn.addEventListener('click', function() {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
                        <h3 style="margin-bottom: 15px;">Create New Release</h3>
                        <p style="margin-bottom: 20px; color: var(--text-secondary);">This feature is under development.</p>
                        <button onclick="this.closest('div').remove()" style="padding: 8px 20px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        });
    }

    // تغییر تم (تاریک/روشن)
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '20px';
    themeToggle.style.right = '20px';
    themeToggle.style.padding = '12px';
    themeToggle.style.background = 'var(--primary-color)';
    themeToggle.style.color = 'white';
    themeToggle.style.border = 'none';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.cursor = 'pointer';
    themeToggle.style.zIndex = '100';
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
    
    document.body.appendChild(themeToggle);

    // استایل تم تاریک
    const darkThemeStyle = document.createElement('style');
    darkThemeStyle.textContent = `
        .dark-theme {
            --background-color: #0d1117;
            --surface-color: #161b22;
            --border-color: #30363d;
            --text-primary: #c9d1d9;
            --text-secondary: #8b949e;
            --text-muted: #6e7681;
        }
        
        .dark-theme .sidebar-section,
        .dark-theme .files-section,
        .dark-theme .readme-section {
            background-color: var(--surface-color);
        }
        
        .dark-theme .file-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        .dark-theme .feature {
            background-color: rgba(255, 255, 255, 0.05);
        }
    `;
    document.head.appendChild(darkThemeStyle);

    // بارگذاری دیتای فایل‌ها
    function updateFileTimes() {
        const fileTimes = document.querySelectorAll('.file-time');
        const times = ['just now', '1 hour ago', '2 hours ago', '30 minutes ago', '2 hours ago'];
        
        fileTimes.forEach((timeElement, index) => {
            timeElement.textContent = times[index];
        });
    }
    
    updateFileTimes();
});
