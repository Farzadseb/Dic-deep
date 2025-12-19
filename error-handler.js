// error-handler.js
class ErrorHandler {
    constructor(app) {
        this.app = app;
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }
    
    handleGlobalError(event) {
        // هندل کردن خطاهای عمومی
    }
    
    handlePromiseRejection(event) {
        // هندل کردن reject نشده‌های Promise
    }
}
