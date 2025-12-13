#!/bin/bash
# ============================================================
# SCRIPT DE BUILD PARA RENDER
# Archivo: backend/render-build.sh
# Descripción: Script que se ejecuta antes de iniciar el servidor
#              en Render. Instala dependencias y configura Puppeteer
# ============================================================

echo "🔧 Iniciando build para Render..."

# ------------------------------------------------------------
# Instalar dependencias de Node.js
# ------------------------------------------------------------
echo "📦 Instalando dependencias..."
npm install

# ------------------------------------------------------------
# Configurar Puppeteer para Render
# Render ya tiene Chromium instalado, así que no necesitamos
# descargarlo de nuevo
# ------------------------------------------------------------
echo "🌐 Configurando Puppeteer..."
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# ------------------------------------------------------------
# Crear carpetas necesarias si no existen
# ------------------------------------------------------------
echo "📁 Creando carpetas necesarias..."
mkdir -p uploads pdfs uploads/encabezados pdfs/temp

# ------------------------------------------------------------
# Verificar que todo esté listo
# ------------------------------------------------------------
echo "✅ Build completado exitosamente"

