/* استایل تمیز و حرفه‌ای */
:root {
    /* رنگ‌های اصلی */
    --primary: #238636;
    --primary-hover: #2ea043;
    --secondary: #f6f8fa;
    --background: #ffffff;
    --surface: #f6f8fa;
    --border: #d0d7de;
    --text-primary: #1f2328;
    --text-secondary: #656d76;
    --text-muted: #8c959f;
    
    /* سایه‌ها */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
    
    /* انیمیشن‌ها */
    --transition: all 0.2s ease;
}

/* ریست استایل */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.5;
    direction: ltr;
}

.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
    min-height: 100vh;
}

/* هدر */
.header {
    background: linear-gradient(135deg, var(--surface) 0%, #ffffff 100%);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid var(--border);
}

.repo-header {
    margin-bottom: 20px;
}

.repo-name {
    font-size: 14px;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 8px;
}

.project-title {
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.project-title i {
    color: var(--primary);
}

.repo-status {
    display: flex;
    align-items: center;
    gap: 12px;
}

.public-badge {
    background: rgba(35, 134, 54, 0.1);
    color: var(--primary);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(35, 134, 54, 0.3);
}

/* نوار ناوبری */
.actions-nav {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: var(--transition);
}

.nav-btn:hover {
    background: var(--surface);
    color: var(--text-primary);
}

.nav-btn.active {
    color: var(--primary);
    background: rgba(35, 134, 54, 0.1);
    border-bottom: 2px solid var(--primary);
}

.count {
    background: var(--surface);
    color: var(--text-muted);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

/* چیدمان اصلی */
.main-content {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    margin-bottom: 40px;
}

@media (max-width: 1024px) {
    .main-content {
        grid-template-columns: 1fr;
    }
}

/* سایدبار */
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
}

.card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
}

.card-title i {
    color: var(--primary);
}

.card-text {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
}

/* آمار */
.stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stat {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-secondary);
}

.stat i {
    width: 20px;
    text-align: center;
    color: var(--text-muted);
}

.stat strong {
    color: var(--text-primary);
    font-weight: 600;
}

/* برنچ */
.branch-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.branch {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: rgba(35, 134, 54, 0.08);
    border: 1px solid rgba(35, 134, 54, 0.2);
    border-radius: 6px;
    color: var(--primary);
    font-size: 14px;
}

.branch i {
    color: var(--primary);
}

/* ریلیزها */
.no-release {
    color: var(--text-muted);
    font-style: italic;
    font-size: 14px;
    margin-bottom: 16px;
}

.release-btn {
    width: 100%;
    padding: 10px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.release-btn:hover {
    background: #f3f4f6;
    border-color: #d1d9e0;
}

/* مشارکت کنندگان */
.contributor {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary), #0969da);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
}

.contributor-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.contributor-info strong {
    font-size: 16px;
    color: var(--text-primary);
}

.commit-time {
    font-size: 12px;
    color: var(--text-muted);
}

.branch-path {
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
}

.contributor-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    flex: 1;
    padding: 8px 12px;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.action-btn:hover {
    background: var(--surface);
}

.action-btn.small {
    font-size: 13px;
    padding: 6px 10px;
}

/* محتوای اصلی */
.content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
}

.files-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.file-actions {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 8px 16px;
    border: 1px solid var(--border);
    background: var(--background);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn:hover {
    background: var(--surface);
}

.btn.outline {
    background: transparent;
}

/* لیست فایل‌ها */
.files-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    transition: var(--transition);
}

.file-item:hover {
    background: rgba(255, 255, 255, 0.8);
}

.file-item:last-child {
    border-bottom: none;
}

.file-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 16px;
    border-radius: 8px;
}

.file-icon i {
    color: white;
}

.file-item:nth-child(1) .file-icon { background: #264de4; } /* CSS */
.file-item:nth-child(2) .file-icon { background: #f0db4f; } /* JS */
.file-item:nth-child(3) .file-icon { background: #f5a623; } /* JSON */
.file-item:nth-child(4) .file-icon { background: #e34c26; } /* HTML */
.file-item:nth-child(5) .file-icon { background: #0366d6; } /* README */

.file-details {
    flex: 1;
}

.file-details h4 {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.filename {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 4px;
}

.description {
    font-size: 13px;
    color: var(--text-secondary);
}

.file-meta {
    text-align: right;
}

.time {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
}

/* بخش README */
.readme-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.readme-header {
    padding: 20px;
    background: var(--background);
    border-bottom: 1px solid var(--border);
}

.readme-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.readme-content {
    padding: 32px;
}

.readme-content h1 {
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.lead {
    font-size: 18px;
    color: var(--text-secondary);
    margin-bottom: 32px;
    line-height: 1.6;
}

.features {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.feature {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.feature i {
    font-size: 24px;
    color: var(--primary);
    margin-top: 4px;
}

.feature h4 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.feature p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
}

/* فوتر */
.footer {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.copyright {
    font-size: 14px;
    color: var(--text-muted);
}

.footer-links {
    display: flex;
    gap: 24px;
}

.footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: var(--transition);
}

.footer-links a:hover {
    color: var(--primary);
}

/* ریسپانسیو */
@media (max-width: 768px) {
    .container {
        padding: 16px;
    }
    
    .files-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .file-actions {
        width: 100%;
        justify-content: flex-start;
    }
    
    .footer-content {
        flex-direction: column;
        text-align: center;
    }
    
    .footer-links {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .file-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    
    .file-icon {
        margin-right: 0;
    }
    
    .file-meta {
        align-self: flex-end;
    }
    
    .actions-nav {
        flex-wrap: wrap;
    }
    
    .nav-btn {
        flex: 1;
        min-width: 120px;
    }
        }
