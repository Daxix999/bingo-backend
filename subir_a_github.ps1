# ============================================================
# SCRIPT PARA SUBIR PROYECTO A GITHUB
# Archivo: subir_a_github.ps1
# Descripción: Automatiza el proceso de subir tu proyecto a GitHub
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUBIR PROYECTO A GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# Verificar que estamos en la carpeta correcta
# ------------------------------------------------------------
$currentPath = Get-Location
Write-Host "📂 Carpeta actual: $currentPath" -ForegroundColor Yellow

$confirm = Read-Host "¿Estás en la carpeta correcta? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Por favor, navega a tu carpeta primero:" -ForegroundColor Red
    Write-Host "   cd 'C:\Users\nuevoadmin\Desktop\Estructura del poyecto de bingo'" -ForegroundColor Yellow
    exit
}

# ------------------------------------------------------------
# Verificar si Git está instalado
# ------------------------------------------------------------
Write-Host ""
Write-Host "🔍 Verificando Git..." -ForegroundColor Cyan
try {
    $gitVersion = git --version
    Write-Host "✅ Git instalado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no está instalado. Descárgalo de: https://git-scm.com/download/win" -ForegroundColor Red
    exit
}

# ------------------------------------------------------------
# Inicializar Git si no está inicializado
# ------------------------------------------------------------
Write-Host ""
Write-Host "🔧 Verificando repositorio Git..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Git ya está inicializado" -ForegroundColor Green
}

# ------------------------------------------------------------
# Configurar usuario (si no está configurado)
# ------------------------------------------------------------
Write-Host ""
Write-Host "👤 Verificando configuración de usuario..." -ForegroundColor Cyan
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName) {
    Write-Host "⚠️  Usuario no configurado" -ForegroundColor Yellow
    $newName = Read-Host "Ingresa tu nombre (o presiona Enter para usar 'Daxix999')"
    if (-not $newName) { $newName = "Daxix999" }
    git config --global user.name $newName
    Write-Host "✅ Usuario configurado: $newName" -ForegroundColor Green
} else {
    Write-Host "✅ Usuario: $userName" -ForegroundColor Green
}

if (-not $userEmail) {
    Write-Host "⚠️  Email no configurado" -ForegroundColor Yellow
    $newEmail = Read-Host "Ingresa tu email"
    if ($newEmail) {
        git config --global user.email $newEmail
        Write-Host "✅ Email configurado: $newEmail" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Email: $userEmail" -ForegroundColor Green
}

# ------------------------------------------------------------
# Conectar con GitHub
# ------------------------------------------------------------
Write-Host ""
Write-Host "🔗 Conectando con GitHub..." -ForegroundColor Cyan
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "✅ Remoto ya configurado: $remoteExists" -ForegroundColor Green
    $changeRemote = Read-Host "¿Quieres cambiar el remoto? (S/N)"
    if ($changeRemote -eq "S" -or $changeRemote -eq "s") {
        git remote remove origin
        git remote add origin https://github.com/Daxix999/bingo-backend.git
        Write-Host "✅ Remoto actualizado" -ForegroundColor Green
    }
} else {
    git remote add origin https://github.com/Daxix999/bingo-backend.git
    Write-Host "✅ Remoto agregado" -ForegroundColor Green
}

# ------------------------------------------------------------
# Agregar todos los archivos
# ------------------------------------------------------------
Write-Host ""
Write-Host "📦 Agregando archivos..." -ForegroundColor Cyan
git add .
$status = git status --short
$fileCount = ($status | Measure-Object).Count
Write-Host "✅ $fileCount archivos agregados" -ForegroundColor Green

# ------------------------------------------------------------
# Hacer commit
# ------------------------------------------------------------
Write-Host ""
$commitMessage = Read-Host "Ingresa un mensaje para este commit (o presiona Enter para usar el mensaje por defecto)"
if (-not $commitMessage) {
    $commitMessage = "Actualización completa del proyecto desde PC local - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
Write-Host "💾 Guardando cambios..." -ForegroundColor Cyan
git commit -m $commitMessage
Write-Host "✅ Cambios guardados" -ForegroundColor Green

# ------------------------------------------------------------
# Subir a GitHub
# ------------------------------------------------------------
Write-Host ""
Write-Host "🚀 Subiendo a GitHub..." -ForegroundColor Cyan
Write-Host "⚠️  Cuando te pida contraseña, usa tu Personal Access Token" -ForegroundColor Yellow
Write-Host "   (NO uses tu contraseña de GitHub)" -ForegroundColor Yellow
Write-Host ""
$forcePush = Read-Host "¿Quieres forzar el push? (reemplaza todo en GitHub) (S/N)"
if ($forcePush -eq "S" -or $forcePush -eq "s") {
    git push -u origin main --force
} else {
    # Intentar pull primero
    Write-Host "📥 Intentando bajar cambios existentes..." -ForegroundColor Cyan
    git pull origin main --allow-unrelated-histories --no-edit 2>$null
    git push -u origin main
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Verifica en: https://github.com/Daxix999/bingo-backend" -ForegroundColor Yellow
Write-Host ""

