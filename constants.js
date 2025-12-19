// constants.js - ثابت‌های برنامه
export const Constants = {
    // سطوح لایتنر
    LEITNER_LEVELS: [
        { level: 1, name: 'روز اول', interval: 1 },
        { level: 2, name: 'روز دوم', interval: 2 },
        { level: 3, name: 'هفته اول', interval: 7 },
        { level: 4, name: 'هفته دوم', interval: 14 },
        { level: 5, name: 'ماه اول', interval: 30 },
        { level: 6, name: 'ماه دوم', interval: 60 },
        { level: 7, name: 'تسلط', interval: 90 }
    ],
    
    // کدهای خطا
    ERROR_CODES: {
        NETWORK: 'NETWORK_ERROR',
        VALIDATION: 'VALIDATION_ERROR',
        AUTH: 'AUTH_ERROR',
        PERMISSION: 'PERMISSION_ERROR',
        UNKNOWN: 'UNKNOWN_ERROR'
    },
    
    // محدودیت‌های مهمان
    GUEST_LIMITS: {
        MAX_TESTS: 5,
        MAX_WORDS: 20,
        DAILY_SEARCHES: 10
    },
    
    // امتیازات
    POINTS: {
        TEST_COMPLETE: 10,
        WORD_LEARNED: 5,
        STREAK_BONUS: 3,
        COMPETITION_WIN: 20
    },
    
    // localStorage keys
    STORAGE_KEYS: {
        USER_DATA: 'dicdeep_user',
        THEME: 'dicdeep_theme',
        SOUND: 'dicdeep_sound',
        SETTINGS: 'dicdeep_settings'
    },
    
    // API endpoints (در صورت نیاز)
    API_URLS: {
        DICTIONARY: 'https://api.dictionaryapi.dev/api/v2/entries/en',
        TRANSLATE: 'https://api.mymemory.translated.net/get',
        BACKUP: 'https://backup.dicdeep.com/api'
    }
};
