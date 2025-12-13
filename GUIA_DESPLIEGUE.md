# 🚀 GUÍA COMPLETA DE DESPLIEGUE - GENERADOR DE BINGO

Esta guía te explica paso a paso cómo desplegar tu aplicación en **Netlify** (frontend) y **Render** (backend), y cómo configurar la base de datos en **Railway**.

---

## 📋 ÍNDICE

1. [Requisitos Previos](#requisitos-previos)
2. [Configurar Base de Datos en Railway](#1-configurar-base-de-datos-en-railway)
3. [Desplegar Backend en Render](#2-desplegar-backend-en-render)
4. [Desplegar Frontend en Netlify](#3-desplegar-frontend-en-netlify)
5. [Configurar Variables de Entorno](#4-configurar-variables-de-entorno)
6. [Probar la Aplicación](#5-probar-la-aplicación)
7. [Solución de Problemas](#solución-de-problemas)

---

## ✅ REQUISitos PREVIOS

- ✅ Cuenta en GitHub (gratis)
- ✅ Cuenta en Railway.app (gratis)
- ✅ Cuenta en Render.com (gratis)
- ✅ Cuenta en Netlify.com (gratis)
- ✅ Tu código subido a un repositorio de GitHub

---

## 1️⃣ CONFIGURAR BASE DE DATOS EN RAILWAY

### Paso 1: Crear cuenta en Railway

1. Ve a https://railway.app
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con GitHub

### Paso 2: Crear base de datos MySQL

1. En el dashboard de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"**
3. Elige **"MySQL"**
4. Railway creará automáticamente una base de datos MySQL

### Paso 3: Obtener credenciales de conexión

1. Haz clic en tu base de datos MySQL
2. Ve a la pestaña **"Variables"**
3. Copia estos valores (los necesitarás después):
   - `MYSQLHOST` → Este es tu `DB_HOST`
   - `MYSQLPORT` → Este es tu `DB_PORT` (generalmente 3306)
   - `MYSQLUSER` → Este es tu `DB_USER`
   - `MYSQLPASSWORD` → Este es tu `DB_PASSWORD`
   - `MYSQLDATABASE` → Este es tu `DB_NAME`

### Paso 4: Crear las tablas en la base de datos

1. Ve a la pestaña **"Connect"** en Railway
2. Copia el comando de conexión o usa un cliente MySQL
3. Ejecuta el archivo `database/schema.sql` para crear las tablas
4. Ejecuta el archivo `database/seed.sql` para crear el usuario admin

**O usando MySQL desde la terminal:**

```bash
# Conectarte a Railway MySQL
mysql -h [MYSQLHOST] -P [MYSQLPORT] -u [MYSQLUSER] -p[MYSQLPASSWORD] [MYSQLDATABASE] < database/schema.sql
mysql -h [MYSQLHOST] -P [MYSQLPORT] -u [MYSQLUSER] -p[MYSQLPASSWORD] [MYSQLDATABASE] < database/seed.sql
```

---

## 2️⃣ DESPLEGAR BACKEND EN RENDER

### Paso 1: Crear cuenta en Render

1. Ve a https://render.com
2. Haz clic en **"Get Started for Free"**
3. Inicia sesión con GitHub

### Paso 2: Crear nuevo servicio Web

1. En el dashboard, haz clic en **"+ New"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio con tu código

### Paso 3: Configurar el servicio

**Configuración básica:**
- **Name:** `bingo-generator-backend` (o el nombre que prefieras)
- **Environment:** `Node`
- **Region:** Elige la más cercana a ti (ej: `Oregon`)
- **Branch:** `main` (o la rama que uses)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

### Paso 4: Configurar Variables de Entorno en Render

En la sección **"Environment Variables"**, agrega estas variables:

```
NODE_ENV=production
PORT=10000

# Base de datos (valores de Railway)
DB_HOST=[tu-MYSQLHOST-de-railway]
DB_PORT=3306
DB_USER=[tu-MYSQLUSER-de-railway]
DB_PASSWORD=[tu-MYSQLPASSWORD-de-railway]
DB_NAME=[tu-MYSQLDATABASE-de-railway]

# JWT Secret (genera uno seguro)
JWT_SECRET=[genera-un-secreto-seguro-aqui]
JWT_EXPIRES_IN=7d

# URL del frontend (la configurarás después de desplegar Netlify)
FRONTEND_URL=https://tu-sitio.netlify.app

# Puppeteer (para Render)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Créditos
COSTO_PDF_FINAL=5
CREDITOS_INICIALES=0
```

**Para generar un JWT_SECRET seguro:**
```bash
# En tu terminal
openssl rand -base64 32
```

### Paso 5: Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu backend
3. Espera a que termine (puede tardar 5-10 minutos la primera vez)
4. Copia la URL que te da Render (ej: `https://bingo-generator-backend.onrender.com`)

**⚠️ IMPORTANTE:** El servicio gratuito se "duerme" después de 15 minutos sin uso. La primera petición después de dormir puede tardar ~30 segundos. Esto es normal.

---

## 3️⃣ DESPLEGAR FRONTEND EN NETLIFY

### Paso 1: Crear cuenta en Netlify

1. Ve a https://netlify.com
2. Haz clic en **"Sign up"**
3. Inicia sesión con GitHub

### Paso 2: Crear nuevo sitio

1. En el dashboard, haz clic en **"Add new site"**
2. Selecciona **"Import an existing project"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio con tu código

### Paso 3: Configurar el sitio

**Configuración de build:**
- **Base directory:** `frontend`
- **Build command:** (déjalo vacío, no necesitas build)
- **Publish directory:** `frontend`

### Paso 4: Configurar Variables de Entorno en Netlify

1. Ve a **"Site settings"** > **"Environment variables"**
2. Agrega esta variable:

```
API_BASE_URL=https://tu-backend-de-render.onrender.com/api
```

(Reemplaza `tu-backend-de-render` con la URL real de tu backend en Render)

### Paso 5: Desplegar

1. Haz clic en **"Deploy site"**
2. Netlify comenzará a desplegar tu frontend
3. Espera a que termine (generalmente 1-2 minutos)
4. Netlify te dará una URL (ej: `https://random-name-123.netlify.app`)

### Paso 6: Actualizar URL del Frontend en Render

1. Vuelve a Render
2. Ve a las **"Environment Variables"** de tu backend
3. Actualiza `FRONTEND_URL` con la URL de Netlify:
   ```
   FRONTEND_URL=https://random-name-123.netlify.app
   ```
4. Render se reiniciará automáticamente

---

## 4️⃣ CONFIGURAR VARIABLES DE ENTORNO

### Resumen de Variables Necesarias

#### En Render (Backend):
- `NODE_ENV=production`
- `PORT=10000`
- `DB_HOST` (de Railway)
- `DB_PORT=3306`
- `DB_USER` (de Railway)
- `DB_PASSWORD` (de Railway)
- `DB_NAME` (de Railway)
- `JWT_SECRET` (genera uno seguro)
- `JWT_EXPIRES_IN=7d`
- `FRONTEND_URL` (URL de Netlify)
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- `COSTO_PDF_FINAL=5`
- `CREDITOS_INICIALES=0`

#### En Netlify (Frontend):
- `API_BASE_URL` (URL de Render + `/api`)

---

## 5️⃣ PROBAR LA APLICACIÓN

### Paso 1: Verificar que el backend funciona

1. Abre la URL de Render en tu navegador
2. Deberías ver un mensaje JSON:
   ```json
   {
     "mensaje": "🎲 API del Generador de Tablas de Bingo",
     "version": "1.0.0",
     "estado": "activo"
   }
   ```

### Paso 2: Verificar que el frontend funciona

1. Abre la URL de Netlify en tu navegador
2. Deberías ver la página principal

### Paso 3: Probar el login

1. Ve a la página de login
2. Usa las credenciales del admin (del `seed.sql`):
   - Email: `admin@bingo.com`
   - Password: `admin123`

### Paso 4: Probar desde el celular

1. Abre la URL de Netlify en el navegador del celular
2. Todo debería funcionar igual que en la computadora

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Cannot connect to database"

**Solución:**
- Verifica que las credenciales de Railway estén correctas en Render
- Asegúrate de que la base de datos esté activa en Railway
- Verifica que el `DB_HOST` no tenga `http://` o `https://`

### ❌ Error: "CORS error" en el navegador

**Solución:**
- Verifica que `FRONTEND_URL` en Render sea exactamente la URL de Netlify
- Asegúrate de que no tenga `/` al final
- Reinicia el servicio en Render después de cambiar variables

### ❌ Error: "Puppeteer timeout" o "PDF generation failed"

**Solución:**
- Verifica que `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` esté configurado
- En Render, el plan gratuito puede tener limitaciones de memoria
- Considera aumentar el timeout en `pdfService.js`

### ❌ El backend se "duerme" y tarda mucho en responder

**Solución:**
- Esto es normal en el plan gratuito de Render
- La primera petición después de 15 min de inactividad tarda ~30 seg
- Considera usar un servicio de "ping" para mantenerlo activo (ej: UptimeRobot)

### ❌ Error 404 en Netlify al navegar

**Solución:**
- Verifica que el archivo `netlify.toml` esté en la raíz del repositorio
- Asegúrate de que la configuración de redirecciones esté correcta

### ❌ No puedo subir imágenes

**Solución:**
- Verifica que las carpetas `uploads` existan
- En Render, los archivos se guardan temporalmente
- Considera usar un servicio de almacenamiento (S3, Cloudinary) para producción

---

## 📞 SOPORTE ADICIONAL

Si tienes problemas:

1. Revisa los logs en Render (pestaña "Logs")
2. Revisa los logs en Netlify (pestaña "Deploys" > "Deploy log")
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de que el código esté actualizado en GitHub

---

## ✅ CHECKLIST FINAL

- [ ] Base de datos creada en Railway
- [ ] Tablas creadas (schema.sql ejecutado)
- [ ] Usuario admin creado (seed.sql ejecutado)
- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas en Render
- [ ] Frontend desplegado en Netlify
- [ ] Variable `API_BASE_URL` configurada en Netlify
- [ ] `FRONTEND_URL` actualizada en Render
- [ ] Backend responde correctamente
- [ ] Frontend se conecta al backend
- [ ] Login funciona
- [ ] Todo funciona desde el celular

---

¡Felicitaciones! 🎉 Tu aplicación está desplegada y funcionando.

