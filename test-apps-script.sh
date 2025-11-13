#!/bin/bash

################################################################################
# Script de Pruebas Automatizadas para Apps Script de CHEC-PRO
# Versión: 1.0
# Uso: ./test-apps-script.sh [URL_DE_APPS_SCRIPT]
################################################################################

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# URL de Apps Script
APPS_SCRIPT_URL="${1}"

################################################################################
# Funciones auxiliares
################################################################################

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_test() {
    echo -n -e "${BLUE}Test $1:${NC} $2... "
}

pass_test() {
    echo -e "${GREEN}✅ PASSED${NC}"
    ((TESTS_PASSED++))
    ((TOTAL_TESTS++))
}

fail_test() {
    echo -e "${RED}❌ FAILED${NC}"
    if [ ! -z "$1" ]; then
        echo -e "${RED}   Error: $1${NC}"
    fi
    ((TESTS_FAILED++))
    ((TOTAL_TESTS++))
}

skip_test() {
    echo -e "${YELLOW}⊘ SKIPPED${NC}"
    ((TOTAL_TESTS++))
}

get_timestamp() {
    date -u +%Y-%m-%dT%H:%M:%S.000Z
}

################################################################################
# Validación de entrada
################################################################################

if [ -z "$APPS_SCRIPT_URL" ]; then
    echo -e "${RED}Error: URL de Apps Script no proporcionada${NC}"
    echo ""
    echo "Uso:"
    echo "  $0 [URL_DE_APPS_SCRIPT]"
    echo ""
    echo "Ejemplo:"
    echo "  $0 https://script.google.com/macros/s/AKfycbz.../exec"
    echo ""
    echo "Para obtener tu URL:"
    echo "  1. Ve a tu proyecto de Apps Script"
    echo "  2. Implementar → Gestionar implementaciones"
    echo "  3. Copia la URL de la aplicación web"
    exit 1
fi

# Validar que la URL termine en /exec
if [[ ! "$APPS_SCRIPT_URL" =~ /exec$ ]]; then
    echo -e "${YELLOW}Advertencia: La URL no termina en '/exec'${NC}"
    echo -e "${YELLOW}Asegúrate de que sea correcta${NC}"
    echo ""
fi

################################################################################
# Inicio de pruebas
################################################################################

print_header "🧪 INICIANDO PRUEBAS DE APPS SCRIPT - CHEC-PRO"

echo -e "${BLUE}URL a probar:${NC} $APPS_SCRIPT_URL"
echo -e "${BLUE}Timestamp:${NC} $(date)"
echo ""

################################################################################
# Test 1: Conectividad básica (PING)
################################################################################

print_test "1" "Conectividad básica (PING)"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"PING\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"test@example.com\",\"data\":{}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE - $(echo $BODY | head -c 100)"
fi

################################################################################
# Test 2: LOGIN action
################################################################################

print_test "2" "Acción LOGIN"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"LOGIN\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"admin@example.com\",\"data\":{\"sessionInfo\":{\"userAgent\":\"test-script\"}}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 3: CREATE_USER action
################################################################################

print_test "3" "Acción CREATE_USER"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"CREATE_USER\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"admin@example.com\",\"data\":{\"userId\":\"test-123\",\"email\":\"newuser@example.com\"}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 4: UPDATE_USER action
################################################################################

print_test "4" "Acción UPDATE_USER"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"UPDATE_USER\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"admin@example.com\",\"data\":{\"userId\":\"test-123\",\"updates\":[\"role\",\"company\"]}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 5: DELETE_USER action
################################################################################

print_test "5" "Acción DELETE_USER"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"DELETE_USER\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"admin@example.com\",\"data\":{\"userId\":\"test-123\",\"email\":\"olduser@example.com\"}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 6: VIEW_REPORTS action
################################################################################

print_test "6" "Acción VIEW_REPORTS"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"VIEW_REPORTS\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"user@example.com\",\"data\":{\"reportCount\":10}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 7: LOGOUT action
################################################################################

print_test "7" "Acción LOGOUT"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"LOGOUT\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"admin@example.com\",\"data\":{\"sessionInfo\":{\"userAgent\":\"test-script\"}}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 8: GET Reports
################################################################################

print_test "8" "GET /exec?action=getReports"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$APPS_SCRIPT_URL?action=getReports" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    # Verificar que haya datos
    if echo "$BODY" | grep -q '"data":\['; then
        pass_test
    else
        fail_test "No se encontraron reportes en la respuesta"
    fi
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 9: GET Logs
################################################################################

print_test "9" "GET /exec?action=getLogs&days=7"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$APPS_SCRIPT_URL?action=getLogs&days=7" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    pass_test
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 10: GET Metrics
################################################################################

print_test "10" "GET /exec?action=getMetrics"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$APPS_SCRIPT_URL?action=getMetrics" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q '"success":true'; then
    # Verificar que haya métricas
    if echo "$BODY" | grep -q '"totalActions"'; then
        pass_test
    else
        fail_test "No se encontraron métricas en la respuesta"
    fi
else
    fail_test "HTTP $HTTP_CODE"
fi

################################################################################
# Test 11: Acción inválida (debe fallar correctamente)
################################################################################

print_test "11" "Manejo de acción inválida"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"INVALID_ACTION\",\"timestamp\":\"$(get_timestamp)\",\"user\":\"test@example.com\",\"data\":{}}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if echo "$BODY" | grep -q '"success":false'; then
    pass_test
else
    fail_test "Debería retornar success:false para acción inválida"
fi

################################################################################
# Test 12: Payload vacío (debe fallar correctamente)
################################################################################

print_test "12" "Manejo de payload vacío"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d "{}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if echo "$BODY" | grep -q '"success":false'; then
    pass_test
else
    fail_test "Debería retornar success:false para payload vacío"
fi

################################################################################
# Resumen final
################################################################################

print_header "📊 RESUMEN DE PRUEBAS"

echo -e "${BLUE}Total de pruebas:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Pruebas exitosas:${NC} $TESTS_PASSED"
echo -e "${RED}Pruebas fallidas:${NC} $TESTS_FAILED"
echo ""

# Calcular porcentaje de éxito
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=1; ($TESTS_PASSED / $TOTAL_TESTS) * 100" | bc)
    echo -e "${BLUE}Tasa de éxito:${NC} $SUCCESS_RATE%"
fi

echo ""

# Resultado final
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Tu sistema de Apps Script está funcionando correctamente.${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Verifica los logs en tu Google Sheet (hoja 'UserLogs')"
    echo "  2. Verifica los reportes en la hoja 'Reports'"
    echo "  3. Prueba desde tu aplicación React"
    echo ""
    exit 0
else
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ ALGUNAS PRUEBAS FALLARON${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Solución de problemas:${NC}"
    echo ""
    echo "1. Verifica que la URL sea correcta"
    echo "   - Debe terminar en /exec"
    echo "   - Cópiala de: Implementar → Gestionar implementaciones"
    echo ""
    echo "2. Verifica la configuración de la Web App"
    echo "   - Ejecutar como: Yo"
    echo "   - Quién tiene acceso: Cualquier persona"
    echo ""
    echo "3. Verifica los logs en Apps Script"
    echo "   - Ver → Registros"
    echo "   - Busca errores en rojo"
    echo ""
    echo "4. Re-despliega la Web App"
    echo "   - Implementar → Nueva implementación"
    echo ""
    echo "5. Ejecuta testSystem() en Apps Script"
    echo "   - Selecciona la función testSystem"
    echo "   - Click en Ejecutar"
    echo ""
    exit 1
fi
