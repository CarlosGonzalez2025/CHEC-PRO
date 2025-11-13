# 🧪 Guía de Pruebas - Apps Script

## Pruebas desde la Terminal

### 1. Test de Ping
```bash
curl -X POST "TU_URL_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "PING",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "user": "test@example.com",
    "data": {}
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "pong",
    "timestamp": "2025-11-13T..."
  }
}
```

---

### 2. Test de Login
```bash
curl -X POST "TU_URL_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "LOGIN",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "user": "admin@example.com",
    "data": {
      "sessionInfo": {
        "userAgent": "curl/test"
      }
    }
  }'
```

---

### 3. Test de Creación de Usuario
```bash
curl -X POST "TU_URL_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "CREATE_USER",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "user": "admin@example.com",
    "data": {
      "userId": "test-123",
      "email": "newuser@example.com"
    }
  }'
```

---

### 4. Test de Obtener Reportes (GET)
```bash
curl -X GET "TU_URL_AQUI?action=getReports"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "ID": "RPT-001",
      "Fecha de verificación 验证日期": "2025-11-01",
      ...
    }
  ],
  "count": 3
}
```

---

### 5. Test de Obtener Logs
```bash
curl -X GET "TU_URL_AQUI?action=getLogs&days=7"
```

---

### 6. Test de Métricas
```bash
curl -X GET "TU_URL_AQUI?action=getMetrics"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "totalActions": 15,
    "actionsByType": {
      "LOGIN": 5,
      "CREATE_USER": 3,
      ...
    },
    "uniqueUsers": 4,
    "loginCount": 5,
    "userOperations": 8,
    "reportViews": 2
  }
}
```

---

## Pruebas desde Apps Script

### Ejecutar en el Editor

1. **Setup del Sistema**
   ```javascript
   // Ejecutar una vez al inicio
   setupSystem()
   ```

2. **Test Completo**
   ```javascript
   // Ejecutar para probar todas las funciones
   testSystem()
   ```

3. **Test Manual de Logging**
   ```javascript
   function testManualLog() {
     const payload = {
       action: 'TEST_ACTION',
       timestamp: new Date().toISOString(),
       user: 'test@example.com',
       data: { message: 'Prueba manual' }
     };

     logAction(payload);
     console.log('✅ Log manual creado');
   }
   ```

4. **Test de Reportes**
   ```javascript
   function testGetReports() {
     const reports = getAllReports();
     console.log('Reportes encontrados:', reports.length);
     console.log(reports);
   }
   ```

5. **Test de Logs Recientes**
   ```javascript
   function testGetLogs() {
     const logs = getRecentLogs(7);
     console.log('Logs de últimos 7 días:', logs.length);
     console.log(logs);
   }
   ```

---

## Verificación Visual

### Verificar en Google Sheets

1. **Hoja UserLogs**
   - Debe tener headers en la fila 1 con fondo azul
   - Debe mostrar cada acción registrada
   - La columna A debe mostrar timestamps
   - La columna B debe mostrar tipos de acción

2. **Hoja Reports**
   - Debe tener headers en la fila 1 con fondo verde
   - Debe tener al menos 3 reportes de ejemplo
   - Los enlaces PDF deben estar en la columna G

---

## Pruebas desde la Aplicación React

### 1. Test de Login
1. Inicia sesión en la aplicación
2. Ve a Google Sheets → Hoja UserLogs
3. Verifica que aparezca una nueva fila con:
   - Action: LOGIN
   - User: tu_email@example.com
   - Timestamp actual

### 2. Test de Creación de Usuario
1. Crea un nuevo usuario en la aplicación
2. Verifica en UserLogs que aparezca:
   - Action: CREATE_USER
   - Data con el email del nuevo usuario

### 3. Test de Reportes
1. Ve a la página de Reportes
2. Verifica que se carguen los reportes
3. Verifica en UserLogs que aparezca:
   - Action: VIEW_REPORTS

### 4. Test de Actualización
1. Edita un usuario existente
2. Verifica en UserLogs:
   - Action: UPDATE_USER
   - Data con los campos actualizados

### 5. Test de Eliminación
1. Elimina un usuario
2. Verifica en UserLogs:
   - Action: DELETE_USER
   - Data con el ID y email del usuario

---

## Debugging

### Ver Logs del Script

**Opción 1: Logs del Editor**
1. Apps Script → Ver → Registros
2. Revisa los `console.log()` y `console.error()`

**Opción 2: Registros de Ejecución**
1. Apps Script → Ver → Registros de ejecución
2. Filtra por fecha/función

### Errores Comunes

#### Error: "No se recibió contenido en la petición"
- Causa: POST sin body
- Solución: Verifica que estés enviando JSON en el body

#### Error: "Payload inválido"
- Causa: Faltan campos requeridos
- Solución: Asegúrate de enviar: action, timestamp, user

#### Error: "Acción no reconocida"
- Causa: El campo "action" no coincide con ninguna acción válida
- Solución: Verifica que la acción esté en mayúsculas (LOGIN, LOGOUT, etc.)

#### Error 403 en curl
- Causa: Configuración de acceso incorrecta
- Solución: Verifica "Quién tiene acceso: Cualquier persona"

#### No se registran logs
- Causa: Error en la función logAction
- Solución: Ejecuta testSystem() y revisa los logs del script

---

## Benchmarks Esperados

| Operación | Tiempo Esperado |
|-----------|----------------|
| POST /exec (registro) | < 2 segundos |
| GET /exec?action=getReports | < 3 segundos |
| GET /exec?action=getLogs | < 4 segundos |
| GET /exec?action=getMetrics | < 3 segundos |

---

## Script de Prueba Automatizada

Guarda esto como `test-apps-script.sh`:

```bash
#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de tu Apps Script
APPS_SCRIPT_URL="TU_URL_AQUI"

echo "🧪 Iniciando pruebas de Apps Script..."
echo ""

# Test 1: PING
echo -n "Test 1 - PING... "
RESPONSE=$(curl -s -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"PING\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",\"user\":\"test@example.com\",\"data\":{}}")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASSED${NC}"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

# Test 2: LOGIN
echo -n "Test 2 - LOGIN... "
RESPONSE=$(curl -s -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"LOGIN\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",\"user\":\"test@example.com\",\"data\":{\"sessionInfo\":{\"userAgent\":\"test\"}}}")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASSED${NC}"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

# Test 3: GET Reports
echo -n "Test 3 - GET Reports... "
RESPONSE=$(curl -s -X GET "$APPS_SCRIPT_URL?action=getReports")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASSED${NC}"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

# Test 4: GET Metrics
echo -n "Test 4 - GET Metrics... "
RESPONSE=$(curl -s -X GET "$APPS_SCRIPT_URL?action=getMetrics")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ PASSED${NC}"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "Response: $RESPONSE"
fi

echo ""
echo "🎉 Pruebas completadas"
```

**Uso:**
```bash
chmod +x test-apps-script.sh
./test-apps-script.sh
```

---

## Checklist de Pruebas

- [ ] `setupSystem()` ejecutado sin errores
- [ ] `testSystem()` ejecutado sin errores
- [ ] Hojas UserLogs y Reports creadas
- [ ] curl PING retorna success: true
- [ ] curl LOGIN retorna success: true
- [ ] GET Reports retorna al menos 3 reportes
- [ ] GET Metrics retorna datos válidos
- [ ] Login desde React registra en UserLogs
- [ ] Crear usuario desde React registra en UserLogs
- [ ] Ver reportes desde React registra en UserLogs
- [ ] Todas las acciones se registran con timestamp correcto
- [ ] Los logs son legibles en Google Sheets

---

✅ **Si todos los tests pasan, tu integración está funcionando perfectamente.**
