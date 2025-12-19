class UIModule {
    constructor(app) {
        this.app = app;
    }
    
    // نمایش نوتیفیکیشن
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }
    
    // نمایش پروفایل
    showProfile() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal profile-modal">
                <!-- محتوای پروفایل -->
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // نمایش مدال تماس
    showContactModal() {
        this.app.userData.contactModalShown = true;
        this.app.saveUserData();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal contact-modal">
                <!-- محتوای تماس -->
            </div>
        `;
        document.body.appendChild(modal);
    }
  }
