/**
 * CHEC-PRO - Funciones Avanzadas Opcionales
 *
 * Este archivo contiene funciones adicionales que puedes agregar
 * para extender la funcionalidad del sistema.
 *
 * NOTA: Estas funciones son opcionales y no son requeridas
 * para el funcionamiento básico del sistema.
 */

// ============================================================================
// NOTIFICACIONES POR EMAIL
// ============================================================================

/**
 * Envía notificación por email cuando ocurre una acción crítica
 */
function sendEmailNotification(action, user, data) {
  if (!CONFIG.ENABLE_EMAIL_NOTIFICATIONS || !CONFIG.ADMIN_EMAIL) {
    return;
  }

  try {
    const subject = `[CHEC-PRO] ${action} - ${user}`;
    let body = `
      <h2>Notificación del Sistema CHEC-PRO</h2>
      <p><strong>Acción:</strong> ${action}</p>
      <p><strong>Usuario:</strong> ${user}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-CO', { timeZone: CONFIG.TIMEZONE })}</p>
      <hr>
      <h3>Detalles:</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: subject,
      htmlBody: body
    });

    console.log('📧 Email enviado a:', CONFIG.ADMIN_EMAIL);

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
  }
}

/**
 * Modifica los handlers para incluir notificaciones
 * Ejemplo de uso en handleDeleteUser:
 */
function handleDeleteUserWithNotification(payload) {
  const result = handleDeleteUser(payload);

  // Enviar notificación solo para acciones críticas
  sendEmailNotification('DELETE_USER', payload.user, payload.data);

  return result;
}

// ============================================================================
// EXPORTACIÓN DE DATOS
// ============================================================================

/**
 * Exporta logs a formato CSV
 */
function exportLogsToCSV(days = 30) {
  try {
    const logs = getRecentLogs(days);

    if (logs.length === 0) {
      return { success: false, message: 'No hay logs para exportar' };
    }

    // Headers
    let csv = 'Timestamp,Action,User,Data,Executor,UserAgent\n';

    // Datos
    logs.forEach(log => {
      csv += `"${log.timestamp}","${log.action}","${log.user}","${JSON.stringify(log.data).replace(/"/g, '""')}","${log.executor}","${log.userAgent}"\n`;
    });

    // Crear archivo en Drive
    const fileName = `CHEC-PRO_Logs_${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd_HHmmss')}.csv`;
    const file = DriveApp.createFile(fileName, csv, MimeType.CSV);

    console.log('✅ CSV exportado:', file.getUrl());

    return {
      success: true,
      fileUrl: file.getUrl(),
      fileName: fileName,
      recordCount: logs.length
    };

  } catch (error) {
    console.error('❌ Error al exportar CSV:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Programa exportación automática semanal
 */
function scheduleWeeklyExport() {
  // Eliminar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'weeklyExport') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Crear nuevo trigger para los domingos a las 23:00
  ScriptApp.newTrigger('weeklyExport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(23)
    .create();

  console.log('✅ Exportación semanal programada');
}

/**
 * Función que se ejecuta automáticamente cada semana
 */
function weeklyExport() {
  const result = exportLogsToCSV(7);

  if (result.success && CONFIG.ADMIN_EMAIL) {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: '[CHEC-PRO] Exportación Semanal de Logs',
      body: `Se ha generado el reporte semanal de logs.\n\nURL: ${result.fileUrl}\nRegistros: ${result.recordCount}`
    });
  }
}

// ============================================================================
// ANÁLISIS Y REPORTES AVANZADOS
// ============================================================================

/**
 * Genera reporte de actividad por usuario
 */
function generateUserActivityReport(days = 30) {
  try {
    const logs = getRecentLogs(days);
    const userActivity = {};

    logs.forEach(log => {
      if (!userActivity[log.user]) {
        userActivity[log.user] = {
          user: log.user,
          totalActions: 0,
          loginCount: 0,
          userOperations: 0,
          reportViews: 0,
          lastActivity: log.timestamp,
          actions: {}
        };
      }

      const activity = userActivity[log.user];
      activity.totalActions++;
      activity.actions[log.action] = (activity.actions[log.action] || 0) + 1;

      if (log.action === 'LOGIN') activity.loginCount++;
      if (['CREATE_USER', 'UPDATE_USER', 'DELETE_USER'].includes(log.action)) {
        activity.userOperations++;
      }
      if (['VIEW_REPORTS', 'VIEW_REPORT_PDF'].includes(log.action)) {
        activity.reportViews++;
      }

      // Actualizar última actividad
      if (new Date(log.timestamp) > new Date(activity.lastActivity)) {
        activity.lastActivity = log.timestamp;
      }
    });

    return Object.values(userActivity);

  } catch (error) {
    console.error('❌ Error al generar reporte de actividad:', error);
    return [];
  }
}

/**
 * Calcula métricas por día
 */
function getDailyMetrics(days = 30) {
  try {
    const logs = getRecentLogs(days);
    const dailyMetrics = {};

    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];

      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          date: date,
          totalActions: 0,
          uniqueUsers: new Set(),
          actionsByType: {}
        };
      }

      dailyMetrics[date].totalActions++;
      dailyMetrics[date].uniqueUsers.add(log.user);
      dailyMetrics[date].actionsByType[log.action] =
        (dailyMetrics[date].actionsByType[log.action] || 0) + 1;
    });

    // Convertir Sets a números
    return Object.values(dailyMetrics).map(day => ({
      ...day,
      uniqueUsers: day.uniqueUsers.size
    }));

  } catch (error) {
    console.error('❌ Error al calcular métricas diarias:', error);
    return [];
  }
}

/**
 * Detecta usuarios inactivos
 */
function detectInactiveUsers(inactiveDays = 30) {
  try {
    const logs = getRecentLogs(inactiveDays);
    const activeUsers = new Set();

    logs.forEach(log => {
      if (log.action === 'LOGIN') {
        activeUsers.add(log.user);
      }
    });

    // Obtener todos los usuarios históricos
    const allLogs = getRecentLogs(365);
    const allUsers = new Set();
    allLogs.forEach(log => allUsers.add(log.user));

    // Usuarios inactivos = todos - activos
    const inactiveUsers = [...allUsers].filter(user => !activeUsers.has(user));

    return {
      inactiveUsers: inactiveUsers,
      count: inactiveUsers.length,
      threshold: inactiveDays
    };

  } catch (error) {
    console.error('❌ Error al detectar usuarios inactivos:', error);
    return { inactiveUsers: [], count: 0 };
  }
}

// ============================================================================
// LIMPIEZA Y MANTENIMIENTO
// ============================================================================

/**
 * Limpia logs más antiguos que X días
 */
function cleanOldLogs(daysToKeep = 90) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);

    if (!sheet) {
      return { success: false, message: 'Hoja de logs no encontrada' };
    }

    const data = sheet.getDataRange().getValues();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let rowsDeleted = 0;

    // Iterar desde abajo hacia arriba para no afectar los índices
    for (let i = data.length - 1; i > 0; i--) {
      const timestamp = new Date(data[i][0]);

      if (timestamp < cutoffDate) {
        sheet.deleteRow(i + 1);
        rowsDeleted++;
      }
    }

    console.log(`🗑️ ${rowsDeleted} logs antiguos eliminados`);

    return {
      success: true,
      rowsDeleted: rowsDeleted,
      cutoffDate: cutoffDate.toISOString()
    };

  } catch (error) {
    console.error('❌ Error al limpiar logs:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Optimiza el tamaño de la hoja
 */
function optimizeSheet() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);

    if (!sheet) return;

    // Eliminar filas vacías al final
    const lastRow = sheet.getLastRow();
    const maxRows = sheet.getMaxRows();

    if (maxRows > lastRow + 100) {
      sheet.deleteRows(lastRow + 1, maxRows - lastRow - 1);
      console.log(`✅ ${maxRows - lastRow - 1} filas vacías eliminadas`);
    }

    // Eliminar columnas vacías al final
    const lastCol = sheet.getLastColumn();
    const maxCols = sheet.getMaxColumns();

    if (maxCols > lastCol + 5) {
      sheet.deleteColumns(lastCol + 1, maxCols - lastCol - 1);
      console.log(`✅ ${maxCols - lastCol - 1} columnas vacías eliminadas`);
    }

  } catch (error) {
    console.error('❌ Error al optimizar hoja:', error);
  }
}

/**
 * Programa limpieza automática mensual
 */
function scheduleMonthlyCleanup() {
  // Eliminar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'monthlyCleanup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Crear nuevo trigger para el primer día del mes a las 02:00
  ScriptApp.newTrigger('monthlyCleanup')
    .timeBased()
    .onMonthDay(1)
    .atHour(2)
    .create();

  console.log('✅ Limpieza mensual programada');
}

/**
 * Función que se ejecuta automáticamente cada mes
 */
function monthlyCleanup() {
  console.log('🧹 Iniciando limpieza mensual...');

  // Limpiar logs antiguos (mantener últimos 90 días)
  cleanOldLogs(90);

  // Optimizar hojas
  optimizeSheet();

  // Exportar backup antes de limpiar
  exportLogsToCSV(90);

  console.log('✅ Limpieza mensual completada');
}

// ============================================================================
// SEGURIDAD Y VALIDACIÓN
// ============================================================================

/**
 * Valida que el request venga de un origen autorizado
 * NOTA: Implementar validación de API Key para producción
 */
function validateRequest(e) {
  // Ejemplo básico - Validar IP o User-Agent
  // En producción, implementar API Keys o OAuth

  const userAgent = e.parameter?.userAgent || '';
  const blockedAgents = ['bot', 'crawler', 'spider'];

  for (const blocked of blockedAgents) {
    if (userAgent.toLowerCase().includes(blocked)) {
      return false;
    }
  }

  return true;
}

/**
 * Rate limiting básico por usuario
 */
const rateLimitCache = CacheService.getScriptCache();

function checkRateLimit(user, maxRequests = 100, windowMinutes = 60) {
  try {
    const key = `ratelimit_${user}`;
    const cached = rateLimitCache.get(key);

    let count = cached ? parseInt(cached) : 0;
    count++;

    if (count > maxRequests) {
      console.warn(`⚠️ Rate limit excedido para ${user}`);
      return false;
    }

    // Guardar en cache por windowMinutes
    rateLimitCache.put(key, count.toString(), windowMinutes * 60);

    return true;

  } catch (error) {
    console.error('❌ Error en rate limit:', error);
    return true; // Permitir en caso de error
  }
}

// ============================================================================
// WEBHOOKS E INTEGRACIONES
// ============================================================================

/**
 * Envía webhook a un servicio externo cuando ocurre una acción
 */
function sendWebhook(webhookUrl, payload) {
  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(webhookUrl, options);

    if (response.getResponseCode() === 200) {
      console.log('✅ Webhook enviado exitosamente');
      return true;
    } else {
      console.warn('⚠️ Webhook falló:', response.getResponseCode());
      return false;
    }

  } catch (error) {
    console.error('❌ Error al enviar webhook:', error);
    return false;
  }
}

/**
 * Integración con Slack (ejemplo)
 */
function sendSlackNotification(message, webhookUrl) {
  const payload = {
    text: message,
    username: 'CHEC-PRO Bot',
    icon_emoji: ':robot_face:'
  };

  return sendWebhook(webhookUrl, payload);
}

// ============================================================================
// BACKUP Y RECUPERACIÓN
// ============================================================================

/**
 * Crea backup completo de todas las hojas
 */
function createFullBackup() {
  try {
    const ss = getSpreadsheet();
    const backupName = `CHEC-PRO_Backup_${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd_HHmmss')}`;

    // Copiar el spreadsheet
    const backup = ss.copy(backupName);

    console.log('✅ Backup creado:', backup.getUrl());

    return {
      success: true,
      backupUrl: backup.getUrl(),
      backupId: backup.getId(),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error al crear backup:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Programa backup automático semanal
 */
function scheduleWeeklyBackup() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'weeklyBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('weeklyBackup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(1)
    .create();

  console.log('✅ Backup semanal programado');
}

function weeklyBackup() {
  const result = createFullBackup();

  if (result.success && CONFIG.ADMIN_EMAIL) {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: '[CHEC-PRO] Backup Semanal Creado',
      body: `Se ha creado el backup semanal.\n\nURL: ${result.backupUrl}`
    });
  }
}

// ============================================================================
// UTILIDADES DE INSTALACIÓN
// ============================================================================

/**
 * Instala todas las funciones avanzadas
 */
function installAdvancedFeatures() {
  console.log('🚀 Instalando funcionalidades avanzadas...');

  try {
    // Programar exportación semanal
    scheduleWeeklyExport();

    // Programar limpieza mensual
    scheduleMonthlyCleanup();

    // Programar backup semanal
    scheduleWeeklyBackup();

    console.log('✅ Funcionalidades avanzadas instaladas:');
    console.log('   - Exportación semanal de logs');
    console.log('   - Limpieza mensual automática');
    console.log('   - Backup semanal automático');

    return { success: true };

  } catch (error) {
    console.error('❌ Error al instalar funcionalidades:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Desinstala todas las automatizaciones
 */
function uninstallAdvancedFeatures() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  console.log('✅ Todas las automatizaciones desinstaladas');
}
