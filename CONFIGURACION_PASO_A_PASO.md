# 📝 CONFIGURACIÓN PASO A PASO - NETLIFY Y RENDER

Guía visual con los valores exactos que debes poner en cada campo.

---

## 🌐 NETLIFY - CONFIGURACIÓN DEL FRONTEND

### Paso 1: Conectar Repositorio
1. Ve a https://app.netlify.com
2. Haz clic en **"Add new site"** > **"Import an existing project"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio con tu código

### Paso 2: Configurar Build Settings

En la página de configuración de Netlify, completa estos campos:

#### ✅ **Branch to deploy:**
```
main
```
*(O la rama que uses, generalmente "main" o "master")*

#### ✅ **Base directory:**
```
frontend
```
**⚠️ IMPORTANTE:** Pon exactamente `frontend` (sin espacios, sin barras)

#### ✅ **Build command:**
```
(DEJAR VACÍO)
```
**⚠️ IMPORTANTE:** No pongas nada aquí, déjalo completamente vacío. Tu frontend no necesita build.

#### ✅ **Publish directory:**
```
frontend
```
**⚠️ IMPORTANTE:** Pon exactamente `frontend` (sin espacios, sin barras)

#### ✅ **Functions directory:**
```
netlify/functions
```
*(Este viene por defecto, déjalo así)*

### Paso 3: Configurar Variables de Entorno

1. Después de crear el sitio, ve a **"Site settings"** (Configuración del sitio)
2. Ve a **"Environment variables"** (Variables de entorno)
3. Haz clic en **"Add variable"** (Agregar variable)
4. Agrega esta variable:

**Key (Nombre):**
```
API_BASE_URL
```

**Value (Valor):**
```
https://tu-backend-de-render.onrender.com/api
```
**⚠️ IMPORTANTE:** 
- Reemplaza `tu-backend-de-render` con la URL real que te da Render
- Debe incluir `/api` al final
- Ejemplo: `https://bingo-backend-3.onrender.com/api`

5. Haz clic en **"Save"** (Guardar)

### Paso 4: Desplegar

1. Haz clic en **"Deploy site"** (Desplegar sitio)
2. Espera a que termine (1-2 minutos)
3. Copia la URL que te da Netlify (ej: `https://random-name-123.netlify.app`)

---

## 🚀 RENDER - CONFIGURACIÓN DEL BACKEND

### Paso 1: Crear Nuevo Servicio Web

1. Ve a https://dashboard.render.com
2. Haz clic en **"+ New"** > **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio con tu código

### Paso 2: Configurar el Servicio

#### ✅ **Nombre:**
```
bingo-generator-backend
```
*(O el nombre que prefieras, debe ser único)*

#### ✅ **Idioma (Language):**
```
Nodo
```
*(Selecciona "Node" o "Nodo" del dropdown)*

#### ✅ **Rama (Branch):**
```
principal
```
*(O "main" si tu rama se llama así)*

#### ✅ **Región (Region):**
```
Virginia (este de EE. UU.)
```
*(O la región más cercana a ti)*

### Paso 3: Configurar Directorios y Comandos

#### ✅ **Directorio raíz (Root Directory):**
```
backend
```
**⚠️ IMPORTANTE:** Pon exactamente `backend` (sin espacios, sin barras)

#### ✅ **Comando de construcción (Build Command):**
```
npm install
```
**⚠️ IMPORTANTE:** Pon exactamente `npm install` (sin el símbolo $)

#### ✅ **Comando de inicio (Start Command):**
```
npm start
```
**⚠️ IMPORTANTE:** Pon exactamente `npm start` (sin el símbolo $)

#### ✅ **Tipo de instancia (Instance Type):**
```
Gratis
```
*(Selecciona el plan "Free" o "Gratis")*

### Paso 4: Configurar Variables de Entorno

**⚠️ IMPORTANTE:** NO las pongas en el formulario inicial. Después de crear el servicio:

1. Ve a tu servicio en el dashboard de Render
2. Haz clic en **"Environment"** (Entorno) en el menú lateral
3. Haz clic en **"Add Environment Variable"** (Agregar variable de entorno)
4. Agrega estas variables UNA POR UNA:

#### Variable 1:
**Key:**
```
NODE_ENV
```
**Value:**
```
production
```

#### Variable 2:
**Key:**
```
PORT
```
**Value:**
```
10000
```

#### Variable 3:
**Key:**
```
DB_HOST
```
**Value:**
```
[Tu host de Railway]
```
*(Ejemplo: `containers-us-west-xxx.railway.app`)*

#### Variable 4:
**Key:**
```
DB_PORT
```
**Value:**
```
3306
```

#### Variable 5:
**Key:**
```
DB_USER
```
**Value:**
```
[Tu usuario de Railway]
```
*(Generalmente `root`)*

#### Variable 6:
**Key:**
```
DB_PASSWORD
```
**Value:**
```
[Tu contraseña de Railway]
```
*(Cópiala exactamente de Railway)*

#### Variable 7:
**Key:**
```
DB_NAME
```
**Value:**
```
[Tu nombre de base de datos de Railway]
```
*(Generalmente `railway`)*

#### Variable 8:
**Key:**
```
JWT_SECRET
```
**Value:**
```
[Genera uno seguro]
```
**Para generar uno seguro, ejecuta en tu terminal:**
```bash
openssl rand -base64 32
```
*(Copia el resultado y pégalo aquí)*

#### Variable 9:
**Key:**
```
JWT_EXPIRES_IN
```
**Value:**
```
7d
```

#### Variable 10:
**Key:**
```
FRONTEND_URL
```
**Value:**
```
https://tu-sitio-de-netlify.netlify.app
```
**⚠️ IMPORTANTE:** 
- Reemplaza con la URL real de Netlify
- NO incluyas `/` al final
- Ejemplo: `https://random-name-123.netlify.app`

#### Variable 11:
**Key:**
```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
```
**Value:**
```
true
```

#### Variable 12:
**Key:**
```
COSTO_PDF_FINAL
```
**Value:**
```
5
```

#### Variable 13:
**Key:**
```
CREDITOS_INICIALES
```
**Value:**
```
0
```

### Paso 5: Crear y Desplegar

1. Haz clic en **"Create Web Service"** (Crear servicio web)
2. Render comenzará a construir y desplegar
3. Espera a que termine (5-10 minutos la primera vez)
4. Copia la URL que te da Render (ej: `https://bingo-backend-3.onrender.com`)

---

## ✅ CHECKLIST FINAL

### Netlify:
- [ ] Repositorio conectado
- [ ] Base directory: `frontend`
- [ ] Build command: (vacío)
- [ ] Publish directory: `frontend`
- [ ] Variable `API_BASE_URL` configurada con URL de Render + `/api`
- [ ] Sitio desplegado y funcionando

### Render:
- [ ] Repositorio conectado
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Todas las 13 variables de entorno configuradas
- [ ] Servicio desplegado y funcionando

### Verificación:
- [ ] Abrir URL de Render en navegador → Debe mostrar JSON con mensaje de API
- [ ] Abrir URL de Netlify en navegador → Debe mostrar la página principal
- [ ] Probar login desde Netlify → Debe conectarse al backend

---

## 🔄 ACTUALIZAR URLs DESPUÉS DEL DESPLIEGUE

### Paso 1: Obtener URLs
1. **Netlify:** Copia la URL de tu sitio (ej: `https://random-123.netlify.app`)
2. **Render:** Copia la URL de tu backend (ej: `https://bingo-backend-3.onrender.com`)

### Paso 2: Actualizar Netlify
1. Ve a Netlify > Site settings > Environment variables
2. Actualiza `API_BASE_URL` con: `https://bingo-backend-3.onrender.com/api`

### Paso 3: Actualizar Render
1. Ve a Render > Tu servicio > Environment
2. Actualiza `FRONTEND_URL` con: `https://random-123.netlify.app`
3. Render se reiniciará automáticamente

---

## 🆘 PROBLEMAS COMUNES

### ❌ Error: "Build failed" en Netlify
**Solución:** Verifica que:
- Base directory sea exactamente `frontend` (sin espacios)
- Build command esté vacío
- Publish directory sea exactamente `frontend`

### ❌ Error: "Build failed" en Render
**Solución:** Verifica que:
- Root Directory sea exactamente `backend` (sin espacios)
- Build Command sea exactamente `npm install` (sin el $)
- Start Command sea exactamente `npm start` (sin el $)

### ❌ Error: "Cannot connect to API" en el navegador
**Solución:** Verifica que:
- `API_BASE_URL` en Netlify tenga la URL completa de Render + `/api`
- `FRONTEND_URL` en Render tenga la URL de Netlify (sin `/` al final)
- Ambas URLs no tengan espacios ni caracteres extra

### ❌ Error: "Database connection failed" en Render
**Solución:** Verifica que:
- Todas las variables de base de datos estén correctas
- Los valores de Railway estén copiados exactamente
- No haya espacios extra en los valores

---

¡Listo! Con estos valores exactos debería funcionar perfectamente. 🎉


