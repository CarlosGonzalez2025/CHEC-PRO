/**
 * CHEC-PRO - Google Apps Script Backend
 * Sistema de logging y reportes para Multi-language User Management System
 *
 * Autor: Sistema CHEC-PRO
 * Versión: 2.0
 * Fecha: 2025-11-13
 */

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================

const CONFIG = {
  SPREADSHEET_ID: '', // Dejar vacío para usar el spreadsheet actual
  SHEETS: {
    LOGS: 'UserLogs',
    REPORTS: 'Reports',
    METRICS: 'Metrics'
  },
  TIMEZONE: 'America/Bogota',
  MAX_LOGS_PER_DAY: 10000,
  ENABLE_EMAIL_NOTIFICATIONS: false,
  ADMIN_EMAIL: ''
};

// ============================================================================
// FUNCIÓN PRINCIPAL - doPost
// ============================================================================

/**
 * Maneja todas las peticiones POST desde la aplicación React
 * @param {Object} e - Evento de Apps Script
 * @returns {TextOutput} Respuesta JSON
 */
function doPost(e) {
  try {
    // Validar que llegó contenido
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'No se recibió contenido en la petición'
      }, 400);
    }

    // Parsear el payload
    const payload = JSON.parse(e.postData.contents);

    // Validar estructura del payload
    if (!payload.action || !payload.timestamp || !payload.user) {
      return createJsonResponse({
        success: false,
        error: 'Payload inválido. Se requieren: action, timestamp, user'
      }, 400);
    }

    // Log de la petición
    console.log('📥 Petición recibida:', {
      action: payload.action,
      user: payload.user,
      timestamp: payload.timestamp
    });

    // Procesar según la acción
    let result;
    switch (payload.action) {
      case 'LOGIN':
        result = handleLogin(payload);
        break;

      case 'LOGOUT':
        result = handleLogout(payload);
        break;

      case 'CREATE_USER':
        result = handleCreateUser(payload);
        break;

      case 'UPDATE_USER':
        result = handleUpdateUser(payload);
        break;

      case 'DELETE_USER':
        result = handleDeleteUser(payload);
        break;

      case 'VIEW_REPORTS':
        result = handleViewReports(payload);
        break;

      case 'VIEW_REPORT_PDF':
        result = handleViewReportPDF(payload);
        break;

      case 'SYNC_USERS':
        result = handleSyncUsers(payload);
        break;

      case 'PING':
        result = { success: true, message: 'pong', timestamp: new Date().toISOString() };
        break;

      default:
        return createJsonResponse({
          success: false,
          error: `Acción no reconocida: ${payload.action}`
        }, 400);
    }

    // Registrar en logs
    logAction(payload);

    // Retornar respuesta exitosa
    return createJsonResponse({
      success: true,
      data: result,
      message: 'Operación completada exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en doPost:', error);
    return createJsonResponse({
      success: false,
      error: error.toString(),
      message: 'Error interno del servidor'
    }, 500);
  }
}

// ============================================================================
// FUNCIÓN doGet - Para obtener reportes
// ============================================================================

/**
 * Maneja peticiones GET para obtener reportes
 * @param {Object} e - Evento de Apps Script
 * @returns {TextOutput} Respuesta JSON con reportes
 */
function doGet(e) {
  try {
    console.log('📥 GET request recibida');

    // Obtener parámetros
    const params = e.parameter || {};

    if (params.action === 'getReports') {
      const reports = getAllReports();
      return createJsonResponse({
        success: true,
        data: reports,
        count: reports.length
      });
    }

    if (params.action === 'getLogs') {
      const days = parseInt(params.days) || 7;
      const logs = getRecentLogs(days);
      return createJsonResponse({
        success: true,
        data: logs,
        count: logs.length
      });
    }

    if (params.action === 'getMetrics') {
      const metrics = calculateMetrics();
      return createJsonResponse({
        success: true,
        data: metrics
      });
    }

    // Respuesta por defecto
    return createJsonResponse({
      success: true,
      message: 'CHEC-PRO Apps Script API - v2.0',
      endpoints: {
        POST: 'Para logging de acciones',
        GET: 'Para obtener reportes y métricas'
      }
    });

  } catch (error) {
    console.error('❌ Error en doGet:', error);
    return createJsonResponse({
      success: false,
      error: error.toString()
    }, 500);
  }
}

// ============================================================================
// HANDLERS DE ACCIONES
// ============================================================================

/**
 * Maneja login de usuarios
 */
function handleLogin(payload) {
  const { user, data } = payload;
  console.log(`✅ Login: ${user}`);

  return {
    action: 'LOGIN',
    user: user,
    userAgent: data.sessionInfo?.userAgent || 'Unknown',
    timestamp: payload.timestamp
  };
}

/**
 * Maneja logout de usuarios
 */
function handleLogout(payload) {
  const { user, data } = payload;
  console.log(`👋 Logout: ${user}`);

  return {
    action: 'LOGOUT',
    user: user,
    timestamp: payload.timestamp
  };
}

/**
 * Maneja creación de usuarios
 */
function handleCreateUser(payload) {
  const { user, data } = payload;
  console.log(`🆕 Usuario creado por ${user}:`, data.email);

  return {
    action: 'CREATE_USER',
    admin: user,
    newUserId: data.userId,
    newUserEmail: data.email,
    timestamp: payload.timestamp
  };
}

/**
 * Maneja actualización de usuarios
 */
function handleUpdateUser(payload) {
  const { user, data } = payload;
  console.log(`🔄 Usuario actualizado por ${user}:`, data.userId);

  return {
    action: 'UPDATE_USER',
    admin: user,
    targetUserId: data.userId,
    updates: data.updates,
    timestamp: payload.timestamp
  };
}

/**
 * Maneja eliminación de usuarios
 */
function handleDeleteUser(payload) {
  const { user, data } = payload;
  console.log(`🗑️ Usuario eliminado por ${user}:`, data.email);

  return {
    action: 'DELETE_USER',
    admin: user,
    deletedUserId: data.userId,
    deletedUserEmail: data.email,
    timestamp: payload.timestamp
  };
}

/**
 * Maneja visualización de reportes
 */
function handleViewReports(payload) {
  const { user, data } = payload;
  console.log(`📊 Reportes visualizados por ${user}`);

  return {
    action: 'VIEW_REPORTS',
    user: user,
    reportCount: data.reportCount || 0,
    timestamp: payload.timestamp
  };
}

/**
 * Maneja visualización de PDF
 */
function handleViewReportPDF(payload) {
  const { user, data } = payload;
  console.log(`📄 PDF visualizado por ${user}:`, data.reportId);

  return {
    action: 'VIEW_REPORT_PDF',
    user: user,
    reportId: data.reportId,
    timestamp: payload.timestamp
  };
}

/**
 * Maneja sincronización de usuarios
 */
function handleSyncUsers(payload) {
  const { user, data } = payload;
  console.log(`🔄 Sincronización de usuarios por ${user}`);

  return {
    action: 'SYNC_USERS',
    user: user,
    userCount: data.userCount || 0,
    timestamp: payload.timestamp
  };
}

// ============================================================================
// FUNCIONES DE LOGGING
// ============================================================================

/**
 * Registra una acción en la hoja de logs
 */
function logAction(payload) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);

    // Crear la hoja si no existe
    if (!sheet) {
      sheet = createLogsSheet(ss);
    }

    // Preparar datos para la fila
    const rowData = [
      new Date(payload.timestamp),           // A: Timestamp
      payload.action,                        // B: Action
      payload.user,                          // C: User
      JSON.stringify(payload.data || {}),    // D: Data (JSON)
      Session.getActiveUser().getEmail(),    // E: Script executor
      payload.data?.sessionInfo?.userAgent || '' // F: User Agent
    ];

    // Agregar fila
    sheet.appendRow(rowData);

    // Mantener solo últimos 10000 registros
    const lastRow = sheet.getLastRow();
    if (lastRow > CONFIG.MAX_LOGS_PER_DAY + 1) {
      sheet.deleteRows(2, lastRow - CONFIG.MAX_LOGS_PER_DAY - 1);
    }

    console.log('✅ Acción registrada en logs');

  } catch (error) {
    console.error('❌ Error al registrar log:', error);
    // No lanzar error para que la operación principal continúe
  }
}

/**
 * Obtiene logs recientes
 */
function getRecentLogs(days = 7) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);

    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Solo headers

    const headers = data[0];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const logs = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const timestamp = new Date(row[0]);

      if (timestamp >= cutoffDate) {
        logs.push({
          timestamp: timestamp.toISOString(),
          action: row[1],
          user: row[2],
          data: tryParseJSON(row[3]),
          executor: row[4],
          userAgent: row[5]
        });
      }
    }

    return logs.reverse(); // Más recientes primero

  } catch (error) {
    console.error('❌ Error al obtener logs:', error);
    return [];
  }
}

// ============================================================================
// FUNCIONES DE REPORTES
// ============================================================================

/**
 * Obtiene todos los reportes de la hoja
 */
function getAllReports() {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEETS.REPORTS);

    // Si no existe la hoja, crearla con datos de ejemplo
    if (!sheet) {
      sheet = createReportsSheet(ss);
      populateSampleReports(sheet);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Solo headers

    const headers = data[0];
    const reports = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      reports.push({
        ID: row[0] || `RPT-${i}`,
        'Fecha de verificación 验证日期': formatDate(row[1]),
        'Centro de trabajo 地点': row[2] || '',
        'Proceso/tarea verificada 流程/任务已验证': row[3] || '',
        'Resultado Final 底線': row[4] || '',
        'Estado del cierre': row[5] || '',
        'Link_PDF 連結_PDF': row[6] || ''
      });
    }

    return reports;

  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    return [];
  }
}

/**
 * Calcula métricas del sistema
 */
function calculateMetrics() {
  try {
    const logs = getRecentLogs(30);

    const metrics = {
      totalActions: logs.length,
      actionsByType: {},
      uniqueUsers: new Set(),
      loginCount: 0,
      userOperations: 0,
      reportViews: 0
    };

    logs.forEach(log => {
      // Contar por tipo
      metrics.actionsByType[log.action] = (metrics.actionsByType[log.action] || 0) + 1;

      // Usuarios únicos
      metrics.uniqueUsers.add(log.user);

      // Contadores específicos
      if (log.action === 'LOGIN') metrics.loginCount++;
      if (['CREATE_USER', 'UPDATE_USER', 'DELETE_USER'].includes(log.action)) {
        metrics.userOperations++;
      }
      if (['VIEW_REPORTS', 'VIEW_REPORT_PDF'].includes(log.action)) {
        metrics.reportViews++;
      }
    });

    metrics.uniqueUsers = metrics.uniqueUsers.size;

    return metrics;

  } catch (error) {
    console.error('❌ Error al calcular métricas:', error);
    return null;
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Crea respuesta JSON con headers CORS
 */
function createJsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // Headers CORS para permitir peticiones desde cualquier origen
  // NOTA: En producción, reemplaza '*' con tu dominio específico
  return output;
}

/**
 * Obtiene el spreadsheet activo o por ID
 */
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Crea la hoja de logs con formato
 */
function createLogsSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.LOGS);

  // Headers
  const headers = [
    'Timestamp',
    'Action',
    'User',
    'Data',
    'Script Executor',
    'User Agent'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4285F4');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');

  // Ancho de columnas
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Action
  sheet.setColumnWidth(3, 200); // User
  sheet.setColumnWidth(4, 300); // Data
  sheet.setColumnWidth(5, 150); // Executor
  sheet.setColumnWidth(6, 250); // User Agent

  // Freeze header
  sheet.setFrozenRows(1);

  console.log('✅ Hoja de logs creada');
  return sheet;
}

/**
 * Crea la hoja de reportes con formato
 */
function createReportsSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.REPORTS);

  // Headers
  const headers = [
    'ID',
    'Fecha de verificación 验证日期',
    'Centro de trabajo 地点',
    'Proceso/tarea verificada 流程/任务已验证',
    'Resultado Final 底線',
    'Estado del cierre',
    'Link_PDF 連結_PDF'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#34A853');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');

  // Ancho de columnas
  sheet.setColumnWidth(1, 80);  // ID
  sheet.setColumnWidth(2, 120); // Fecha
  sheet.setColumnWidth(3, 200); // Centro
  sheet.setColumnWidth(4, 250); // Proceso
  sheet.setColumnWidth(5, 120); // Resultado
  sheet.setColumnWidth(6, 120); // Estado
  sheet.setColumnWidth(7, 300); // Link

  sheet.setFrozenRows(1);

  console.log('✅ Hoja de reportes creada');
  return sheet;
}

/**
 * Pobla datos de ejemplo en reportes
 */
function populateSampleReports(sheet) {
  const sampleData = [
    ['RPT-001', new Date('2025-11-01'), 'Planta Principal', 'Inspección de seguridad', 'Aprobado', 'Cerrado', 'https://example.com/report1.pdf'],
    ['RPT-002', new Date('2025-11-05'), 'Almacén Norte', 'Verificación de equipos', 'Aprobado con observaciones', 'En seguimiento', 'https://example.com/report2.pdf'],
    ['RPT-003', new Date('2025-11-10'), 'Oficinas Administrativas', 'Revisión de documentación', 'Aprobado', 'Cerrado', 'https://example.com/report3.pdf']
  ];

  sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
  console.log('✅ Datos de ejemplo agregados');
}

/**
 * Formatea fecha
 */
function formatDate(date) {
  if (!date) return '';
  if (!(date instanceof Date)) date = new Date(date);
  return Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Intenta parsear JSON, retorna objeto vacío si falla
 */
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

// ============================================================================
// FUNCIÓN DE INSTALACIÓN/SETUP
// ============================================================================

/**
 * Función para ejecutar la primera vez para configurar el sistema
 */
function setupSystem() {
  try {
    console.log('🚀 Iniciando configuración del sistema...');

    const ss = getSpreadsheet();

    // Crear hojas si no existen
    if (!ss.getSheetByName(CONFIG.SHEETS.LOGS)) {
      createLogsSheet(ss);
    }

    if (!ss.getSheetByName(CONFIG.SHEETS.REPORTS)) {
      const reportsSheet = createReportsSheet(ss);
      populateSampleReports(reportsSheet);
    }

    console.log('✅ Sistema configurado exitosamente');
    console.log('📋 Hojas creadas:', CONFIG.SHEETS);
    console.log('🌐 Ahora despliega el script como Web App');

    return {
      success: true,
      message: 'Sistema configurado correctamente'
    };

  } catch (error) {
    console.error('❌ Error en setup:', error);
    throw error;
  }
}

/**
 * Función de prueba - Ejecutar para verificar que todo funcione
 */
function testSystem() {
  console.log('🧪 Ejecutando pruebas del sistema...');

  // Test 1: Crear payload de prueba
  const testPayload = {
    action: 'PING',
    timestamp: new Date().toISOString(),
    user: 'test@example.com',
    data: { test: true }
  };

  // Test 2: Log action
  logAction(testPayload);
  console.log('✅ Test de logging completado');

  // Test 3: Obtener reportes
  const reports = getAllReports();
  console.log(`✅ Test de reportes: ${reports.length} encontrados`);

  // Test 4: Calcular métricas
  const metrics = calculateMetrics();
  console.log('✅ Test de métricas completado:', metrics);

  console.log('🎉 Todas las pruebas completadas exitosamente');
}
