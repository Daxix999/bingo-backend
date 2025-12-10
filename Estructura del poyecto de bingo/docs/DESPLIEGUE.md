# 🚀 Guía de Despliegue - Generador de Tablas de Bingo

Esta guía te ayudará a desplegar tu aplicación en la nube para que tu hermano pueda usarla desde su teléfono sin necesidad de que tu PC esté encendida.

## 📋 Índice

1. [Opciones de Hosting](#opciones-de-hosting)
2. [Base de Datos en la Nube](#base-de-datos-en-la-nube)
3. [Desplegar Backend](#desplegar-backend)
4. [Desplegar Frontend](#desplegar-frontend)
5. [Configuración Final](#configuración-final)

---

## 🌐 Opciones de Hosting

### **Opción 1: Render (Recomendado - Gratis)**

Render ofrece hosting gratuito para Node.js y bases de datos MySQL.

**Ventajas:**
- ✅ Gratis para proyectos pequeños
- ✅ Fácil de usar
- ✅ Base de datos MySQL incluida
- ✅ SSL automático (HTTPS)
- ✅ Despliegue automático desde GitHub

**Pasos:**

1. **Crear cuenta en Render:**
   - Ve a [render.com](https://render.com)
   - Regístrate con GitHub

2. **Crear Base de Datos MySQL:**
   - En el dashboard, click en "New +" → "PostgreSQL" (o busca MySQL)
   - O mejor aún, usa **PlanetScale** (ver opción 2)

3. **Desplegar Backend:**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Build Command:** `cd backend && npm install`
     - **Start Command:** `cd backend && node server.js`
     - **Environment Variables:** (ver más abajo)

---

### **Opción 2: PlanetScale (Base de Datos MySQL Gratis)**

PlanetScale ofrece MySQL en la nube completamente gratis.

**Pasos:**

1. **Crear cuenta:**
   - Ve a [planetscale.com](https://planetscale.com)
   - Regístrate (puedes usar GitHub)

2. **Crear Base de Datos:**
   - Click en "Create database"
   - Nombre: `bingo_generator`
   - Región: Elige la más cercana a ti
   - Plan: Free

3. **Obtener Credenciales:**
   - Ve a "Settings" → "Passwords"
   - Click en "Create password"
   - Guarda el **Host**, **Username**, **Password** y **Database name**

4. **Ejecutar Schema:**
   - Ve a "Console" en PlanetScale
   - Copia el contenido de `database/schema.sql`
   - Ejecuta el script completo

---

### **Opción 3: Vercel + Supabase (Alternativa)**

- **Frontend:** Vercel (gratis)
- **Backend:** Vercel Serverless Functions
- **Base de Datos:** Supabase (PostgreSQL gratis)

---

## 🗄️ Base de Datos en la Nube

### **Usando PlanetScale (Recomendado)**

1. Después de crear la base de datos en PlanetScale, obtén las credenciales:
   ```
   Host: xxxxx.psdb.cloud
   Username: xxxxx
   Password: xxxxx
   Database: bingo_generator
   ```

2. Ejecuta el schema SQL:
   - Ve a la consola de PlanetScale
   - Copia y pega el contenido de `database/schema.sql`
   - Ejecuta el script

---

## 🔧 Desplegar Backend

### **En Render:**

1. **Preparar el proyecto:**
   - Asegúrate de tener un archivo `.env.example` en la carpeta `backend/`
   - Crea un archivo `render.yaml` en la raíz del proyecto:

```yaml
services:
  - type: web
    name: bingo-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: DB_HOST
        sync: false  # Configurar manualmente
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: DB_NAME
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
      - key: FRONTEND_URL
        value: https://tu-frontend.vercel.app
```

2. **Configurar Variables de Entorno en Render:**
   - Ve a tu servicio en Render
   - Click en "Environment"
   - Agrega las variables:
     ```
     DB_HOST=xxxxx.psdb.cloud
     DB_USER=xxxxx
     DB_PASSWORD=xxxxx
     DB_NAME=bingo_generator
     DB_PORT=3306
     JWT_SECRET=tu_secreto_super_seguro_aqui
     JWT_EXPIRE=7d
     FRONTEND_URL=https://tu-frontend.vercel.app
     ```

3. **Conectar con GitHub:**
   - En Render, conecta tu repositorio
   - Render desplegará automáticamente cada vez que hagas push

---

## 🎨 Desplegar Frontend

### **En Vercel (Recomendado):**

1. **Preparar el proyecto:**
   - Asegúrate de que `frontend/` tenga todos los archivos

2. **Desplegar:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Root Directory:** `frontend`
     - **Build Command:** (dejar vacío, es HTML estático)
     - **Output Directory:** `.`

3. **Configurar Variables de Entorno:**
   - En Vercel, ve a Settings → Environment Variables
   - Agrega:
     ```
     VITE_API_URL=https://tu-backend.onrender.com/api
     ```
   - (Nota: Si usas variables en el frontend, necesitarás un bundler como Vite)

4. **Actualizar API_BASE en utils.js:**
   - Edita `frontend/js/utils.js`
   - Cambia `API_BASE` a la URL de tu backend:
     ```javascript
     const API_BASE = 'https://tu-backend.onrender.com/api';
     ```

---

## ⚙️ Configuración Final

### **1. Actualizar URLs en el Frontend:**

Edita `frontend/js/utils.js`:

```javascript
const API_BASE = 'https://tu-backend.onrender.com/api';
```

### **2. Configurar CORS en el Backend:**

En `backend/server.js`, asegúrate de que CORS permita tu dominio:

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://tu-frontend.vercel.app',
    credentials: true
}));
```

### **3. Crear Usuario Administrador:**

Después de desplegar, ejecuta este SQL en tu base de datos:

```sql
-- Cambiar la contraseña después
UPDATE usuarios 
SET password_hash = '$2b$10$nuevo_hash_aqui' 
WHERE email = 'admin@bingo.com';
```

O mejor aún, crea un nuevo admin desde la consola de la base de datos.

---

## 🔐 Seguridad

1. **Cambiar JWT_SECRET:**
   - Genera un secreto seguro:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Úsalo como `JWT_SECRET` en Render

2. **Cambiar contraseña del admin:**
   - Usa bcrypt para generar un hash:
     ```javascript
     const bcrypt = require('bcrypt');
     bcrypt.hash('tu_nueva_contraseña', 10).then(console.log);
     ```

---

## 📱 Probar desde el Móvil

1. Abre la URL de tu frontend en el navegador del móvil
2. Regístrate con una cuenta nueva
3. Prueba crear una plantilla y generar un PDF

---

## 🆘 Solución de Problemas

### **Error de conexión a la base de datos:**
- Verifica que las credenciales en Render sean correctas
- Asegúrate de que PlanetScale permita conexiones desde Render

### **Error CORS:**
- Verifica que `FRONTEND_URL` en Render sea correcta
- Asegúrate de que el frontend use HTTPS

### **PDFs no se generan:**
- Render puede tener límites de tiempo para funciones largas
- Considera usar un servicio de cola (como Bull) para generar PDFs en background

---

## 📞 Soporte

Si tienes problemas, revisa los logs en:
- **Render:** Dashboard → Tu servicio → Logs
- **Vercel:** Dashboard → Tu proyecto → Deployments → Logs

---

## ✅ Checklist Final

- [ ] Base de datos creada y schema ejecutado
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] Usuario admin creado
- [ ] Probado desde el móvil
- [ ] SSL/HTTPS funcionando

---

¡Listo! Tu aplicación debería estar funcionando en la nube. 🎉

