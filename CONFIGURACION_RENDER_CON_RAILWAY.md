# 🔗 CONFIGURACIÓN DE RENDER CON TUS DATOS DE RAILWAY

Basado en tus variables de Railway, aquí están los valores exactos que debes poner en Render:

---

## ✅ VARIABLES PARA RENDER

### 1️⃣ NODE_ENV
```
NOMBRE: NODE_ENV
VALOR: production
```

### 2️⃣ PORT
```
NOMBRE: PORT
VALOR: 10000
```

### 3️⃣ DB_HOST
```
NOMBRE: DB_HOST
VALOR: shortline.proxy.rlwy.net
```
**⚠️ IMPORTANTE:** Usa el host de la URL pública, NO el interno

### 4️⃣ DB_PORT
```
NOMBRE: DB_PORT
VALOR: 51146
```
**⚠️ IMPORTANTE:** Usa el puerto de la URL pública (51146), NO 3306

### 5️⃣ DB_USER
```
NOMBRE: DB_USER
VALOR: root
```

### 6️⃣ DB_PASSWORD
```
NOMBRE: DB_PASSWORD
VALOR: MAEeBmDLPUILxYYtuRwJtcpGZuSVtenG
```
**⚠️ IMPORTANTE:** Copia exactamente, sin espacios

### 7️⃣ DB_NAME
```
NOMBRE: DB_NAME
VALOR: railway
```

### 8️⃣ JWT_SECRET
```
NOMBRE: JWT_SECRET
VALOR: [Genera uno nuevo con: openssl rand -base64 32]
```
**⚠️ IMPORTANTE:** Este NO viene de Railway, debes generarlo tú

### 9️⃣ JWT_EXPIRES_IN
```
NOMBRE: JWT_EXPIRES_IN
VALOR: 7d
```

### 🔟 FRONTEND_URL
```
NOMBRE: FRONTEND_URL
VALOR: https://tu-sitio-de-netlify.netlify.app
```
**⚠️ IMPORTANTE:** 
- Reemplaza con la URL real de Netlify
- NO incluyas `/` al final
- Ejemplo: `https://superbingo.netlify.app`

### 1️⃣1️⃣ PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
```
NOMBRE: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
VALOR: true
```

### 1️⃣2️⃣ COSTO_PDF_FINAL
```
NOMBRE: COSTO_PDF_FINAL
VALOR: 5
```

### 1️⃣3️⃣ CREDITOS_INICIALES
```
NOMBRE: CREDITOS_INICIALES
VALOR: 0
```

---

## 📋 RESUMEN RÁPIDO

Copia y pega estos valores en Render:

| Variable | Valor |
|----------|-------|
| NODE_ENV | production |
| PORT | 10000 |
| DB_HOST | shortline.proxy.rlwy.net |
| DB_PORT | 51146 |
| DB_USER | root |
| DB_PASSWORD | MAEeBmDLPUILxYYtuRwJtcpGZuSVtenG |
| DB_NAME | railway |
| JWT_SECRET | [genera uno nuevo] |
| JWT_EXPIRES_IN | 7d |
| FRONTEND_URL | [URL de Netlify] |
| PUPPETEER_SKIP_CHROMIUM_DOWNLOAD | true |
| COSTO_PDF_FINAL | 5 |
| CREDITOS_INICIALES | 0 |

---

## ⚠️ NOTAS IMPORTANTES

1. **DB_HOST y DB_PORT:** 
   - Usa `shortline.proxy.rlwy.net` y puerto `51146` (de la URL pública)
   - NO uses `mysql.railway.internal` (ese es solo para servicios dentro de Railway)

2. **JWT_SECRET:**
   - Este NO viene de Railway
   - Debes generarlo tú con: `openssl rand -base64 32`
   - O usa cualquier string largo y aleatorio

3. **FRONTEND_URL:**
   - Configúralo DESPUÉS de que Netlify te dé la URL
   - O déjalo vacío por ahora y lo actualizas después

---

## 🚀 PASOS PARA CONFIGURAR

1. Ve a Render y crea tu servicio web
2. En la sección "Variables de entorno", agrega las 13 variables
3. Para JWT_SECRET, genera uno nuevo (no uses el de Railway)
4. Para FRONTEND_URL, usa la URL de Netlify cuando la tengas
5. Haz clic en "Create Web Service"
6. ¡Listo! Render se conectará a tu base de datos de Railway

---

¡Con estos valores tu backend se conectará perfectamente a Railway! 🎉


