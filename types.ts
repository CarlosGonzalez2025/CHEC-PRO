// Fix: Import translations to derive TranslationKey type.
import { translations } from './lib/translations';

// Tipos base del sistema
export type Role = 'admin' | 'coordinator' | 'sst_specialist' | 'nurse' | 'employee';

export type Language = 'es' | 'en' | 'zh';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Interfaz del perfil de usuario
export interface Profile {
    id: string;
    name: string;
    role: Role;
    company: string;
    department?: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    email?: string;
    last_sign_in_at?: string;
}

// Datos para crear/actualizar usuario
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: Role;
    company: string;
    department?: string;
    phone?: string;
}

export interface UpdateUserData {
    name?: string;
    role?: Role;
    company?: string;
    department?: string;
    phone?: string;
    is_active?: boolean;
}

// Interfaz de reportes
export interface Report {
    ID: string; // Corregido de number a string
    'Fecha de verificación 验证日期': string;
    'Centro de trabajo 地点': string;
    'Proceso/tarea verificada 流程/任务已验证': string;
    'Resultado Final 底線': string;
    'Estado del cierre': string;
    'Link_PDF 連結_PDF': string;
}

// Contexto de autenticación
export interface AuthContextType {
    user: Profile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

// Contexto de idioma
export interface LanguageContextType {
    currentLanguage: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
    isRTL: boolean;
}

// Claves de traducción - Todas las posibles claves
// Fix: Derive TranslationKey from the translations object to ensure they are always in sync.
export type TranslationKey = keyof typeof translations.es;

// Estructura de traducciones
export interface Translations {
    [key: string]: string;
}

export interface TranslationsMap {
    es: Translations;
    en: Translations;
    zh: Translations;
}

// Tipos para Apps Script
export type AppsScriptAction = 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'LOGIN' | 'LOGOUT' | 'SYNC_USERS' | 'VIEW_REPORTS' | 'VIEW_REPORT_PDF';

export interface AppsScriptPayload {
    action: AppsScriptAction;
    timestamp: string;
    user: string;
    data: Record<string, any>;
}

export interface AppsScriptResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Configuración del usuario
export interface UserPreferences {
    language: Language;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    autoSave: boolean;
    itemsPerPage: number;
}

// Filtros para la tabla de usuarios
export interface UserFilters {
    search: string;
    role: Role | 'all';
    company: string | 'all';
    status: 'active' | 'inactive' | 'all';
    department?: string | 'all';
}

// Configuración de tabla
export interface TableColumn {
    key: string;
    label: TranslationKey;
    sortable?: boolean;
    hidden?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

// Paginación
export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

// Modal state
export interface ModalState {
    isOpen: boolean;
    type: 'create' | 'edit' | 'delete' | 'view';
    data?: any;
}

// Toast notification
export interface ToastNotification {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    persistent?: boolean;
    action?: {
        label: string;
        handler: () => void;
    };
}

// Estado de carga
export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
}

// Configuración de tema
export interface ThemeConfig {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
    info: string;
}