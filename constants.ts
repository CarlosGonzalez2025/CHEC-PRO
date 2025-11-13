// Configuración de Supabase
export const SUPABASE_URL = 'https://azsehkzuhmjccbabqrcd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c2Voa3p1aG1qY2NiYWJxcmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTk0NzUsImV4cCI6MjA3ODUzNTQ3NX0.XvQBOkTKXJEsjWMfefuf0MOA5_KZsNTuA1ydwCkZyGw';

// Google Apps Script
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYTHwGmWecvpMsKmqiLFPC03MoedY15gT_dZgtU_kcFRxmY8RJD3DMCklTqvCcupks4A/exec';

// API de Reportes (si tienes una API separada)
export const REPORTS_API_URL = 'https://script.google.com/macros/s/AKfycbzYTHwGmWecvpMsKmqiLFPC03MoedY15gT_dZgtU_kcFRxmY8RJD3DMCklTqvCcupks4A/exec';

// Configuraciones de la aplicación
export const APP_CONFIG = {
    USERS_PER_PAGE: 10,
    MAX_RETRY_ATTEMPTS: 3,
    REQUEST_TIMEOUT: 10000,
    DEFAULT_LANGUAGE: 'es' as const,
    SUPPORTED_LANGUAGES: ['es', 'en', 'zh'] as const,
    SESSION_STORAGE_KEY: 'user_session',
    LANGUAGE_STORAGE_KEY: 'preferred_language',
    THEME_STORAGE_KEY: 'app_theme'
};

// Roles disponibles en el sistema
export const USER_ROLES = {
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    SST_SPECIALIST: 'sst_specialist',
    NURSE: 'nurse',
    EMPLOYEE: 'employee'
} as const;

// Configuración de Toast notifications
export const TOAST_CONFIG = {
    DURATION: 5000,
    POSITION: 'top-right' as const,
    ANIMATION_DURATION: 300
};

// Configuración de modales
export const MODAL_CONFIG = {
    ANIMATION_DURATION: 200,
    BACKDROP_BLUR: true,
    CLOSE_ON_OUTSIDE_CLICK: true
};

// Configuración de Apps Script
export const APPS_SCRIPT_CONFIG = {
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 2,
    LOG_ERRORS: true,
    FALLBACK_MODE: true // Si falla Apps Script, la app continúa funcionando
};