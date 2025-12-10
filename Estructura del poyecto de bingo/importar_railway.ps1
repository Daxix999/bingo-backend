# ============================================================
# Script para importar schema.sql a Railway MySQL
# Archivo: importar_railway.ps1
# ============================================================

# ------------------------------------------------------------
# Configuración de conexión a Railway MySQL
# ------------------------------------------------------------
$DB_HOST = "mysql.railway.internal"
$DB_PORT = "3306"
$DB_USER = "raiz"
$DB_PASSWORD = Read-Host "Ingresa la contraseña de MySQL de Railway" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

# ------------------------------------------------------------
# Cambiar al directorio raíz del proyecto
# ------------------------------------------------------------
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# ------------------------------------------------------------
# Ruta del archivo SQL
# ------------------------------------------------------------
$SQL_FILE = Join-Path $scriptPath "database\schema.sql"

# ------------------------------------------------------------
# Verificar que existe el archivo SQL
# ------------------------------------------------------------
if (-not (Test-Path $SQL_FILE)) {
    Write-Host "❌ Error: No se encuentra el archivo $SQL_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Archivo SQL encontrado: $SQL_FILE" -ForegroundColor Green

# ------------------------------------------------------------
# Verificar si mysql está instalado
# ------------------------------------------------------------
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ Error: MySQL client no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "   Instala MySQL Client o agrega mysql.exe al PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL client encontrado" -ForegroundColor Green

# ------------------------------------------------------------
# Construir comando de conexión
# ------------------------------------------------------------
$connectionString = "-h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_PLAIN"

# ------------------------------------------------------------
# Ejecutar el script SQL
# ------------------------------------------------------------
Write-Host ""
Write-Host "🚀 Conectando a Railway MySQL..." -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST" -ForegroundColor Gray
Write-Host "   Port: $DB_PORT" -ForegroundColor Gray
Write-Host "   User: $DB_USER" -ForegroundColor Gray
Write-Host ""

try {
    # Ejecutar el script SQL completo
    Get-Content $SQL_FILE -Raw | mysql $connectionString 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Base de datos importada exitosamente!" -ForegroundColor Green
        Write-Host "   Base de datos 'bingo_generator' creada en Railway" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error al importar el schema" -ForegroundColor Red
        Write-Host "   Código de salida: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al ejecutar el script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Limpiar contraseña de memoria
$DB_PASSWORD_PLAIN = $null

