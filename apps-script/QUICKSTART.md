# ⚡ Inicio Rápido - 5 Minutos

## 🎯 Pasos Mínimos para Funcionar

### 1️⃣ Crear Google Sheet (30 segundos)
1. Ir a [sheets.google.com](https://sheets.google.com)
2. Crear nueva hoja
3. Nombrar: "CHEC-PRO Logs"

---

### 2️⃣ Abrir Apps Script (15 segundos)
1. En el Google Sheet: **Extensiones → Apps Script**
2. Se abre el editor

---

### 3️⃣ Copiar Código (1 minuto)
1. Borrar todo el contenido de `Code.gs`
2. Copiar y pegar TODO el contenido de `apps-script/Code.gs`
3. Guardar (Ctrl+S)
4. Nombrar proyecto: "CHEC-PRO Backend"

---

### 4️⃣ Ejecutar Setup (2 minutos)
1. Seleccionar función: `setupSystem`
2. Click en **▶ Ejecutar**
3. **Autorizar** cuando se solicite:
   - Clic en "Revisar permisos"
   - Seleccionar tu cuenta
   - "Avanzado" → "Ir a CHEC-PRO Backend"
   - "Permitir"

✅ Verifica que en tu Google Sheet aparezcan 2 hojas nuevas:
- **UserLogs**
- **Reports**

---

### 5️⃣ Desplegar Web App (1 minuto)
1. Click en **Implementar → Nueva implementación**
2. Tipo: **Aplicación web**
3. Configurar:
   ```
   Ejecutar como: Yo
   Quién tiene acceso: Cualquier persona ⚠️
   ```
4. Click **Implementar**
5. **COPIAR LA URL** que aparece

---

### 6️⃣ Actualizar React (30 segundos)
1. Abrir `/home/user/CHEC-PRO/constants.ts`
2. Reemplazar ambas URLs con la que copiaste:
   ```typescript
   export const APPS_SCRIPT_URL = 'TU_URL_NUEVA';
   export const REPORTS_API_URL = 'TU_URL_NUEVA';
   ```
3. Guardar

---

## ✅ Verificar que Funciona

**Prueba rápida desde terminal:**
```bash
curl -X POST "TU_URL_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"action":"PING","timestamp":"2025-11-13T00:00:00Z","user":"test","data":{}}'
```

**Debe retornar:**
```json
{"success":true,"data":{"success":true,"message":"pong",...}}
```

---

## 🎉 ¡Listo!

Tu sistema está configurado y funcionando.

**Siguiente paso:**
- Inicia tu app React: `npm run dev`
- Haz login
- Ve a tu Google Sheet → Hoja UserLogs
- Verás el registro del login

---

## 🆘 Si Algo Falla

### Error 403
- Verifica que configuraste: "Quién tiene acceso: **Cualquier persona**"
- Re-despliega la Web App

### No se registran logs
- Ejecuta `testSystem()` en Apps Script
- Revisa "Ver → Registros"

### URL no funciona
- Asegúrate de copiar la URL completa (termina en `/exec`)
- Verifica que no tenga espacios

---

## 📚 Documentación Completa

- `README-APPS-SCRIPT.md` - Guía detallada
- `TESTING.md` - Cómo probar el sistema
- `Advanced.gs` - Funciones opcionales avanzadas
