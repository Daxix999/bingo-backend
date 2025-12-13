# 🔐 VARIABLES DE ENTORNO EN RENDER - GUÍA COMPLETA

## 📍 DÓNDE AGREGAR LAS VARIABLES

En Render puedes agregar variables de entorno de **DOS formas**:

### Opción 1: En el formulario inicial (RECOMENDADO) ✅
Cuando estás creando el servicio, hay una sección que dice:
```
Variables de entorno
Establezca la configuración y los secretos específicos del entorno
```

**Puedes agregarlas ahí directamente** antes de hacer clic en "Create Web Service".

### Opción 2: Después de crear el servicio
1. Ve a tu servicio en el dashboard
2. Haz clic en **"Environment"** (Entorno) en el menú lateral
3. Haz clic en **"Add Environment Variable"**

---

## ✅ VARIABLES QUE DEBES AGREGAR

Agrega estas variables **UNA POR UNA**:

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
VALOR: [Tu host de Railway]
```
**Ejemplo:** `containers-us-west-123.railway.app`

### 4️⃣ DB_PORT
```
NOMBRE: DB_PORT
VALOR: 3306
```

### 5️⃣ DB_USER
```
NOMBRE: DB_USER
VALOR: [Tu usuario de Railway]
```
**Generalmente:** `root`

### 6️⃣ DB_PASSWORD
```
NOMBRE: DB_PASSWORD
VALOR: [Tu contraseña de Railway]
```
**⚠️ IMPORTANTE:** Cópiala exactamente, sin espacios

### 7️⃣ DB_NAME
```
NOMBRE: DB_NAME
VALOR: [Tu nombre de base de datos]
```
**Generalmente:** `railway`

### 8️⃣ JWT_SECRET
```
NOMBRE: JWT_SECRET
VALOR: [Genera uno seguro]
```

**Para generar uno seguro, ejecuta en tu terminal:**
```bash
openssl rand -base64 32
```
Copia el resultado y pégalo aquí.

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

## 📝 EJEMPLO VISUAL

En el formulario de Render, verás algo así:

```
Variables de entorno
┌─────────────────────────────────────┐
│ NOMBRE_DE_LA_VARIABLE    valor     │
├─────────────────────────────────────┤
│ NODE_ENV                production │
│ PORT                    10000      │
│ DB_HOST                 [tu host]  │
│ DB_PORT                 3306       │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST

- [ ] NODE_ENV = production
- [ ] PORT = 10000
- [ ] DB_HOST = [de Railway]
- [ ] DB_PORT = 3306
- [ ] DB_USER = [de Railway]
- [ ] DB_PASSWORD = [de Railway]
- [ ] DB_NAME = [de Railway]
- [ ] JWT_SECRET = [generado]
- [ ] JWT_EXPIRES_IN = 7d
- [ ] FRONTEND_URL = [URL de Netlify]
- [ ] PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true
- [ ] COSTO_PDF_FINAL = 5
- [ ] CREDITOS_INICIALES = 0

---

## 🆘 PREGUNTAS FRECUENTES

### ¿Puedo agregar las variables después?
**Sí**, pero es mejor hacerlo antes para que el primer despliegue funcione correctamente.

### ¿Qué pasa si olvido una variable?
Render te dará un error cuando intente iniciar. Simplemente agrega la variable faltante y se reiniciará automáticamente.

### ¿Puedo cambiar los valores después?
**Sí**, puedes editarlas o eliminarlas en cualquier momento desde "Environment".

### ¿Las variables son visibles para otros?
**No**, las variables están encriptadas y solo tú puedes verlas.

---

¡Agrega todas las variables y tu backend funcionará perfectamente! 🚀


