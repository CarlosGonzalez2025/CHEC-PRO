# 📋 Guía de Instalación - Google Apps Script para CHEC-PRO

## 🎯 Objetivo

Este documento te guiará paso a paso para implementar el backend de Google Apps Script que registra todas las acciones del sistema de gestión de usuarios.

---

## 📦 Archivos Requeridos

- `Code.gs` - Código principal del sistema

---

## 🚀 Pasos de Instalación

### **Paso 1: Crear nuevo Google Spreadsheet**

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"CHEC-PRO Logs and Reports"**
4. Anota el ID del spreadsheet (está en la URL):
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

---

### **Paso 2: Abrir el Editor de Apps Script**

1. En tu Google Sheet, ve a: **Extensiones → Apps Script**
2. Se abrirá el editor de Apps Script
3. Verás un archivo llamado `Code.gs` por defecto

---

### **Paso 3: Copiar el Código**

1. **Borra** todo el contenido del archivo `Code.gs` por defecto
2. **Copia** TODO el contenido del archivo `apps-script/Code.gs` de este repositorio
3. **Pega** el código en el editor de Apps Script
4. **Guarda** el proyecto (Ctrl+S o icono de disquete)
5. **Nombra** el proyecto: "CHEC-PRO Backend"

---

### **Paso 4: Configurar el Sistema**

Ejecuta la función de setup inicial:

1. En el editor, selecciona la función `setupSystem` del menú desplegable
2. Haz clic en **▶ Ejecutar**
3. **Autoriza** el script cuando se solicite:
   - Clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Clic en "Avanzado" → "Ir a CHEC-PRO Backend (no seguro)"
   - Clic en "Permitir"

4. Verifica en los **Logs** (Ver → Registros) que aparezca:
   ```
   ✅ Sistema configurado exitosamente
   ```

5. Vuelve a tu Google Sheet - Deberías ver 2 nuevas hojas:
   - **UserLogs** - Para registros de acciones
   - **Reports** - Para reportes (con datos de ejemplo)

---

### **Paso 5: Probar el Sistema**

1. En el editor de Apps Script, selecciona la función `testSystem`
2. Haz clic en **▶ Ejecutar**
3. Verifica en los Logs que todas las pruebas pasen:
   ```
   ✅ Test de logging completado
   ✅ Test de reportes: 3 encontrados
   ✅ Test de métricas completado
   🎉 Todas las pruebas completadas exitosamente
   ```

---

### **Paso 6: Desplegar como Web App**

Este es el paso MÁS IMPORTANTE para que tu aplicación React pueda conectarse:

1. En el editor, haz clic en **Implementar → Nueva implementación**

2. En "Tipo de implementación":
   - Haz clic en el icono de engranaje ⚙️
   - Selecciona **"Aplicación web"**

3. Configura los siguientes campos:
   ```
   Descripción: CHEC-PRO Backend v2.0
   Ejecutar como: Yo (tu_email@gmail.com)
   Quién tiene acceso: Cualquier persona ⚠️ IMPORTANTE
   ```

4. Haz clic en **Implementar**

5. **⚠️ IMPORTANTE**: Copia la **URL de la aplicación web**:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```

6. **Guarda esta URL** - La necesitarás para el siguiente paso

---

### **Paso 7: Actualizar la Aplicación React**

Ahora debes actualizar el archivo `constants.ts` de tu aplicación React:

1. Abre el archivo `/home/user/CHEC-PRO/constants.ts`

2. Reemplaza las URLs viejas con la nueva URL que copiaste:
   ```typescript
   // Reemplaza esta línea:
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/LA_URL_VIEJA/exec';

   // Con tu nueva URL:
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_NUEVA_URL/exec';

   // Y también:
   export const REPORTS_API_URL = 'https://script.google.com/macros/s/TU_NUEVA_URL/exec';
   ```

3. **Guarda** el archivo

---

### **Paso 8: Verificar la Conexión**

1. En tu terminal, ejecuta:
   ```bash
   curl -X POST "TU_URL_DE_APPS_SCRIPT" \
     -H "Content-Type: application/json" \
     -d '{"action":"PING","timestamp":"2025-11-13T00:00:00.000Z","user":"test@example.com","data":{}}'
   ```

2. Deberías recibir:
   ```json
   {
     "success": true,
     "data": {
       "success": true,
       "message": "pong",
       "timestamp": "2025-11-13T..."
     },
     "message": "Operación completada exitosamente"
   }
   ```

✅ Si recibes esto, ¡la conexión está funcionando!

---

## 🔧 Funcionalidades Implementadas

### **1. Logging Automático**

El sistema registra automáticamente:
- ✅ **LOGIN** - Cuando un usuario inicia sesión
- ✅ **LOGOUT** - Cuando un usuario cierra sesión
- ✅ **CREATE_USER** - Cuando se crea un usuario
- ✅ **UPDATE_USER** - Cuando se actualiza un usuario
- ✅ **DELETE_USER** - Cuando se elimina un usuario
- ✅ **VIEW_REPORTS** - Cuando se visualizan reportes
- ✅ **VIEW_REPORT_PDF** - Cuando se abre un PDF

### **2. Endpoints Disponibles**

#### **POST /exec** - Registrar acciones
```json
{
  "action": "LOGIN",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "user": "usuario@example.com",
  "data": {}
}
```

#### **GET /exec?action=getReports** - Obtener reportes
Retorna todos los reportes de la hoja "Reports"

#### **GET /exec?action=getLogs&days=7** - Obtener logs
Retorna logs de los últimos N días

#### **GET /exec?action=getMetrics** - Obtener métricas
Retorna estadísticas del sistema

---

## 📊 Estructura de Datos

### **Hoja: UserLogs**
| Timestamp | Action | User | Data | Script Executor | User Agent |
|-----------|--------|------|------|----------------|------------|
| 2025-11-13 10:30:00 | LOGIN | user@example.com | {...} | script@gmail.com | Mozilla/5.0... |

### **Hoja: Reports**
| ID | Fecha | Centro | Proceso | Resultado | Estado | Link_PDF |
|----|-------|--------|---------|-----------|--------|----------|
| RPT-001 | 2025-11-01 | Planta Principal | Inspección | Aprobado | Cerrado | https://... |

---

## 🔐 Seguridad

### **⚠️ IMPORTANTE: Configuración de Acceso**

La configuración actual permite acceso desde **cualquier origen** (`Cualquier persona`). Esto es necesario para que tu aplicación React pueda conectarse.

**Para mejorar la seguridad en producción:**

1. Implementa un sistema de API Keys
2. Valida el origen de las peticiones
3. Agrega autenticación básica
4. Limita las tasas de peticiones

---

## 🐛 Solución de Problemas

### **Error 403 - Access Denied**
- Verifica que la configuración sea: **"Quién tiene acceso: Cualquier persona"**
- Vuelve a desplegar la aplicación web
- Asegúrate de usar la URL más reciente

### **Error 401 - Unauthorized**
- Verifica los permisos del script
- Re-autoriza el script

### **No se registran logs**
- Ejecuta `testSystem()` para verificar
- Revisa los Logs del script (Ver → Registros)
- Verifica que las hojas existan

### **Los reportes no se cargan**
- Verifica que la hoja "Reports" exista
- Ejecuta `getAllReports()` manualmente
- Verifica el formato de los datos

---

## 📝 Mantenimiento

### **Ver Logs del Sistema**
En Apps Script: **Ver → Registros** o **Ver → Registros de ejecución**

### **Actualizar el Script**
1. Edita el código en el editor
2. Guarda los cambios
3. **Implementar → Gestionar implementaciones**
4. Haz clic en el icono de lápiz ✏️ de tu implementación
5. Cambia "Versión" a **"Nueva versión"**
6. **Implementar**

### **Limpiar Logs Antiguos**
Los logs se mantienen automáticamente a un máximo de 10,000 registros.
Para cambiar esto, modifica `MAX_LOGS_PER_DAY` en la configuración.

---

## 🎯 Próximos Pasos Recomendados

1. **Personalizar Reportes**: Agrega tus propios datos en la hoja "Reports"
2. **Configurar Notificaciones**: Activa `ENABLE_EMAIL_NOTIFICATIONS` en CONFIG
3. **Crear Dashboard**: Usa los datos de la hoja para crear visualizaciones
4. **Agregar Métricas**: Expande la función `calculateMetrics()` con tus KPIs
5. **Implementar Backups**: Configura exportaciones automáticas de logs

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Apps Script
2. Ejecuta `testSystem()` para diagnosticar
3. Verifica que todas las configuraciones estén correctas
4. Consulta la documentación oficial de Apps Script

---

## ✅ Checklist de Instalación

- [ ] Google Sheet creado
- [ ] Apps Script editor abierto
- [ ] Código copiado y guardado
- [ ] Función `setupSystem()` ejecutada
- [ ] Permisos autorizados
- [ ] Hojas UserLogs y Reports creadas
- [ ] Función `testSystem()` ejecutada exitosamente
- [ ] Web App desplegada
- [ ] Configuración: "Cualquier persona" seleccionada
- [ ] URL de la Web App copiada
- [ ] `constants.ts` actualizado con nueva URL
- [ ] Prueba con curl exitosa
- [ ] Aplicación React reiniciada

---

🎉 **¡Listo! Tu sistema de logging está funcionando correctamente.**
