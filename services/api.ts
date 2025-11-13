import { supabase } from './supabase';
import { APPS_SCRIPT_URL, REPORTS_API_URL, APPS_SCRIPT_CONFIG } from '../constants';
import { Profile, Report, CreateUserData, UpdateUserData, AppsScriptAction, AppsScriptPayload, ApiResponse } from '../types';

/**
 * Servicio para Google Apps Script con manejo mejorado de CORS y errores
 */
export const AppsScriptService = {
    /**
     * Enviar datos a Google Apps Script con retry automático
     */
    async sendData(payload: AppsScriptPayload): Promise<ApiResponse> {
        for (let attempt = 1; attempt <= APPS_SCRIPT_CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                console.log(`📤 Apps Script intento ${attempt}:`, payload);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), APPS_SCRIPT_CONFIG.TIMEOUT);

                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors', // Important for Apps Script web apps
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('✅ Apps Script exitoso:', result);
                
                return {
                    success: true,
                    data: result
                };

            } catch (error: any) {
                console.warn(`⚠️ Apps Script intento ${attempt} falló:`, error.message);
                
                if (attempt === APPS_SCRIPT_CONFIG.RETRY_ATTEMPTS) {
                    if (APPS_SCRIPT_CONFIG.FALLBACK_MODE) {
                        console.log('🔄 Apps Script en modo fallback - continuando sin logging');
                        return {
                            success: true,
                            data: { fallback: true },
                            message: 'Apps Script no disponible, operación completada localmente'
                        };
                    } else {
                        throw error;
                    }
                }

                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        return {
            success: false,
            error: 'Máximo número de intentos alcanzado'
        };
    },

    /**
     * Registrar acción del usuario
     */
    async logUserAction(action: AppsScriptAction, userEmail: string, data: Record<string, any>): Promise<void> {
        try {
            await this.sendData({
                action,
                timestamp: new Date().toISOString(),
                user: userEmail,
                data
            });
        } catch (error) {
            if (APPS_SCRIPT_CONFIG.LOG_ERRORS) {
                console.error('Apps Script logging failed:', error);
            }
            // No lanzar error para que la operación principal continúe
        }
    }
};

/**
 * Obtener usuarios con emails - Función mejorada con manejo de errores
 */
export const fetchUsers = async (): Promise<Profile[]> => {
    try {
        console.log('🔍 Obteniendo usuarios...');

        const { data, error } = await supabase.rpc('get_users_with_emails');

        if (error) {
            console.error('❌ Error Supabase:', error);
            throw new Error(`Error de base de datos: ${error.message}`);
        }
        
        if (!data) {
            console.warn('⚠️ No se recibieron datos de usuarios');
            return [];
        }

        console.log(`✅ ${data.length} usuarios obtenidos exitosamente`);
        
        const users: Profile[] = data.map((user: any) => ({
            id: user.id,
            name: user.name || 'Sin nombre',
            role: user.role || 'employee',
            company: user.company || 'Sin empresa',
            department: user.department || '',
            phone: user.phone || '',
            is_active: user.is_active !== false,
            created_at: user.created_at,
            updated_at: user.updated_at,
            email: user.email || `user_${user.id.slice(0, 8)}@domain.com`,
            last_sign_in_at: user.last_sign_in_at
        }));

        return users;

    } catch (error: any) {
        console.error('❌ Error completo en fetchUsers:', error);
        
        if (error.message.includes('ambiguous')) {
            throw new Error('supabaseAmbiguousIdError');
        }
        if (error.message.includes('get_users_with_emails')) {
            throw new Error('databaseFunctionError');
        }
        if (error.message.includes('permission')) {
            throw new Error('permissionDenied');
        }

        throw new Error(error.message || 'unknownError');
    }
};

/**
 * Crear nuevo usuario con validación mejorada
 */
export const adminCreateUser = async (userData: CreateUserData): Promise<Profile> => {
    try {
        console.log('🆕 Creando usuario:', { ...userData, password: '[OCULTO]' });

        if (!userData.name?.trim()) throw new Error('El nombre es requerido');
        if (!userData.email?.trim()) throw new Error('El email es requerido');
        if (!userData.password || userData.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
        if (!userData.company?.trim()) throw new Error('La empresa es requerida');

        const { data, error } = await supabase.rpc('admin_create_user', {
            user_email: userData.email.trim(),
            user_password: userData.password,
            user_name: userData.name.trim(),
            user_role: userData.role || 'employee',
            user_company: userData.company.trim(),
            user_department: userData.department?.trim() || '',
            user_phone: userData.phone?.trim() || '',
        });

        if (error) {
            console.error('❌ Error RPC:', error);
            throw new Error(`Error de función: ${error.message}`);
        }
        if (!data) throw new Error('No se recibió respuesta del servidor');
        if (data.success === false) throw new Error(data.message || 'Error desconocido al crear usuario');
        
        const createdUser = data.user || data;
        console.log('✅ Usuario creado exitosamente:', createdUser);
        return createdUser as Profile;

    } catch (error: any) {
        console.error('❌ Error completo en adminCreateUser:', error);
        if (error.message.includes('Ya existe un usuario')) throw new Error('Ya existe un usuario con este email. Usa un email diferente.');
        if (error.message.includes('admin_create_user')) throw new Error('La función de creación no está disponible. Contacta al administrador.');
        if (error.message.includes('permission') || error.message.includes('permisos')) throw new Error('No tienes permisos suficientes para crear usuarios.');
        throw error;
    }
};

/**
 * Actualizar usuario existente
 */
export const updateUser = async (userId: string, updates: UpdateUserData): Promise<Profile> => {
    try {
        console.log('🔄 Actualizando usuario:', userId, updates);
        const cleanUpdates: Record<string, any> = {};
        if (updates.name?.trim()) cleanUpdates.name = updates.name.trim();
        if (updates.role) cleanUpdates.role = updates.role;
        if (updates.company?.trim()) cleanUpdates.company = updates.company.trim();
        if (updates.department !== undefined) cleanUpdates.department = updates.department?.trim() || '';
        if (updates.phone !== undefined) cleanUpdates.phone = updates.phone?.trim() || '';
        if (updates.is_active !== undefined) cleanUpdates.is_active = updates.is_active;

        const { data, error } = await supabase.from('profiles').update(cleanUpdates).eq('id', userId).select().single();
        if (error) throw new Error(`Error al actualizar: ${error.message}`);
        if (!data) throw new Error('No se pudo actualizar el usuario');
        return data as Profile;
    } catch (error: any) {
        console.error('❌ Error completo en updateUser:', error);
        throw error;
    }
};

/**
 * Eliminar usuario (soft delete)
 */
export const deleteUser = async (userId: string): Promise<Profile> => {
    try {
        console.log('🗑️ Eliminando usuario:', userId);
        const { data, error } = await supabase.from('profiles').update({ is_active: false }).eq('id', userId).select().single();
        if (error) throw new Error(`Error al eliminar: ${error.message}`);
        if (!data) throw new Error('No se pudo eliminar el usuario');
        return data as Profile;
    } catch (error: any) {
        console.error('❌ Error completo en deleteUser:', error);
        throw error;
    }
};

/**
 * Obtener reportes (si hay API configurada)
 */
export const fetchReports = async (): Promise<Report[]> => {
    if (!REPORTS_API_URL) {
        console.warn('⚠️ REPORTS_API_URL no configurada');
        return [];
    }
    try {
        console.log('📊 Obteniendo reportes...');
        const response = await fetch(REPORTS_API_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Error en API de reportes');
        console.log(`✅ ${result.data?.length || 0} reportes obtenidos`);
        return result.data || [];
    } catch (error: any) {
        console.error('❌ Error obteniendo reportes:', error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error('appsScriptCorsError');
        }
        throw new Error(error.message || 'fetchReportsError');
    }
};

/**
 * Wrapper para logging automático de acciones
 */
export const logToActionScript = async (action: AppsScriptAction, userEmail: string, data: Record<string, any>): Promise<void> => {
    await AppsScriptService.logUserAction(action, userEmail, data);
};
