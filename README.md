# 🎲 GENERADOR DE TABLAS DE BINGO

Sistema completo para generar tablas de bingo personalizadas con PDFs, sistema de créditos, y panel de administración.

---

## 📋 CARACTERÍSTICAS

✅ **Generación de Tablas Personalizadas**
- Diseña tu propia plantilla (filas × columnas)
- Activa/desactiva celdas individuales
- Personaliza iconos (corazón, rombo, cuadrado, letras, etc.)
- Agrega encabezados personalizados

✅ **Sistema de Créditos**
- Los usuarios necesitan créditos para generar PDFs finales
- PDFs de prueba son gratuitos
- Panel admin para regalar créditos

✅ **Sin Repetición de Números**
- Los números no se repiten dentro de un lote
- Los números no se repiten entre lotes diferentes
- Control total de la numeración

✅ **Responsive y Multi-dispositivo**
- Funciona en PC, tablet y celular
- Interfaz adaptada para móviles

✅ **Panel de Administración**
- Gestiona usuarios
- Agrega créditos gratis
- Ve historial de lotes generados
- Estadísticas del sistema

---

## 🗂️ ESTRUCTURA DEL PROYECTO

```
bingo-generator/
├── backend/              # Servidor Node.js + Express
│   ├── config/          # Configuración de base de datos
│   ├── controllers/     # Controladores de la API
│   ├── middleware/      # Middlewares (auth, admin)
│   ├── routes/          # Rutas de la API
│   ├── services/        # Servicios (PDF, números)
│   ├── uploads/         # Imágenes subidas
│   ├── pdfs/            # PDFs generados
│   └── server.js        # Servidor principal
│
├── frontend/            # Aplicación web (HTML/CSS/JS)
│   ├── css/            # Estilos
│   ├── js/             # JavaScript
│   ├── images/         # Imágenes
│   └── *.html          # Páginas HTML
│
├── database/            # Scripts de base de datos
│   ├── schema.sql      # Estructura de tablas
│   └── seed.sql        # Datos iniciales
│
├── docs/               # Documentación
├── netlify.toml        # Configuración Netlify
├── render.yaml         # Configuración Render
└── README.md           # Este archivo
```

---

## 🚀 INSTALACIÓN LOCAL

### Requisitos

- Node.js 16+ instalado
- MySQL 8+ instalado y corriendo
- Git

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone [tu-repositorio]
   cd bingo-generator
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar base de datos**
   - Crea una base de datos MySQL llamada `bingo_generator`
   - Ejecuta los scripts:
     ```bash
     mysql -u root -p bingo_generator < ../database/schema.sql
     mysql -u root -p bingo_generator < ../database/seed.sql
     ```

4. **Configurar variables de entorno**
   ```bash
   cd backend
   cp env.example .env
   ```
   Edita `.env` y completa los valores necesarios.

5. **Iniciar el servidor**
   ```bash
   npm start
   # O para desarrollo con auto-reload:
   npm run dev
   ```

6. **Abrir el frontend**
   - Abre `frontend/index.html` en tu navegador
   - O usa un servidor local:
     ```bash
     cd frontend
     npx live-server
     ```

---

## 🌐 DESPLIEGUE EN LA NUBE

Para desplegar en producción (Netlify + Render + Railway), sigue la guía completa:

👉 **[GUÍA DE DESPLIEGUE](GUIA_DESPLIEGUE.md)**

**Resumen rápido:**
1. Base de datos en **Railway.app** (MySQL gratis)
2. Backend en **Render.com** (Node.js gratis)
3. Frontend en **Netlify.com** (hosting estático gratis)

---

## 📖 USO

### Para Usuarios

1. **Registrarse** en la plataforma
2. **Crear una plantilla** de bingo personalizada
3. **Generar PDF de prueba** (gratis) para ver cómo queda
4. **Solicitar créditos** al administrador
5. **Generar PDF final** usando créditos

### Para Administradores

1. Inicia sesión con las credenciales de admin
2. Ve al **Panel de Administración**
3. Busca usuarios por email
4. Agrega créditos gratis a los usuarios
5. Ve estadísticas y historial

---

## 🔧 CONFIGURACIÓN

### Variables de Entorno (Backend)

Ver `backend/env.example` para todas las variables necesarias.

**Principales:**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Base de datos
- `JWT_SECRET` - Secreto para tokens JWT
- `FRONTEND_URL` - URL del frontend
- `COSTO_PDF_FINAL` - Créditos necesarios para PDF final

### Variables de Entorno (Frontend)

En Netlify, configura:
- `API_BASE_URL` - URL del backend (ej: `https://tu-backend.onrender.com/api`)

---

## 🛠️ TECNOLOGÍAS

- **Backend:** Node.js + Express
- **Base de Datos:** MySQL
- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla)
- **PDFs:** Puppeteer
- **Autenticación:** JWT (JSON Web Tokens)
- **Hosting:** Netlify (frontend) + Render (backend) + Railway (DB)

---

## 📝 API ENDPOINTS

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual

### Plantillas
- `GET /api/templates` - Listar plantillas
- `POST /api/templates` - Crear plantilla
- `PUT /api/templates/:id` - Actualizar plantilla
- `DELETE /api/templates/:id` - Eliminar plantilla

### Lotes
- `GET /api/lots` - Listar lotes del usuario
- `POST /api/lots` - Generar nuevo lote
- `GET /api/lots/:id/download` - Descargar PDF

### Créditos
- `GET /api/credits/balance` - Ver saldo
- `GET /api/credits/history` - Historial de transacciones

### Admin
- `GET /api/admin/users/search` - Buscar usuarios
- `POST /api/admin/users/:id/credits` - Agregar créditos
- `GET /api/admin/stats` - Estadísticas

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Revisa las credenciales en `.env`

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend sea correcta
- Asegúrate de que no tenga `/` al final

### Puppeteer no funciona
- En Render, configura `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- Verifica que el servicio tenga suficiente memoria

---

## 📄 LICENCIA

Este proyecto es de uso personal/educativo.

---

## 👨‍💻 DESARROLLADO POR

Sistema desarrollado para ayudar a generar tablas de bingo de forma profesional y gratuita.

---

## 📞 SOPORTE

Para problemas o preguntas:
1. Revisa la [Guía de Despliegue](GUIA_DESPLIEGUE.md)
2. Verifica los logs en Render/Netlify
3. Revisa que todas las variables de entorno estén configuradas

---

¡Disfruta generando tablas de bingo! 🎲🎉
