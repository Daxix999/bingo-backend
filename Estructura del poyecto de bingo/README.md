# 🎲 Generador de Tablas de Bingo

Sistema completo para generar tablas de bingo personalizadas con PDFs profesionales. Incluye sistema de créditos, panel de administración y diseño responsive para móviles.

## ✨ Características

- ✅ **Plantillas Personalizables**: Crea tablas con cualquier tamaño (filas × columnas)
- ✅ **Selección de Celdas**: Activa/desactiva celdas individuales para diseños únicos
- ✅ **Iconos Personalizados**: Corazón, rombo, cuadrado, letras (A, X, G, etc.)
- ✅ **Encabezados**: Texto o imagen personalizada
- ✅ **PDFs Profesionales**: Genera PDFs de prueba (gratis) y finales (con créditos)
- ✅ **Sin Repetición**: Los números no se repiten dentro de un lote ni entre lotes diferentes
- ✅ **Sistema de Créditos**: Control de créditos internos con panel de administración
- ✅ **Responsive**: Funciona perfectamente en móviles y tablets
- ✅ **Panel Admin**: Gestiona usuarios y créditos desde cualquier dispositivo

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 16+ instalado
- MySQL 8+ instalado (o usar base de datos en la nube)
- npm o yarn

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd "Estructura del poyecto de bingo"
   ```

2. **Instalar dependencias del backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar base de datos:**
   - Crea una base de datos MySQL llamada `bingo_generator`
   - Ejecuta el script `database/schema.sql` en tu base de datos
   - O usa PlanetScale para una base de datos en la nube (ver [DESPLIEGUE.md](docs/DESPLIEGUE.md))

4. **Configurar variables de entorno:**
   ```bash
   cd backend
   cp .env.example .env
   # Edita .env con tus credenciales de base de datos
   ```

5. **Iniciar el servidor:**
   ```bash
   npm start
   # O para desarrollo con auto-reload:
   npm run dev
   ```

6. **Abrir el frontend:**
   - Abre `frontend/index.html` en tu navegador
   - O sirve los archivos estáticos con un servidor HTTP simple

## 📁 Estructura del Proyecto

```
.
├── backend/                 # Servidor Node.js + Express
│   ├── config/             # Configuración de base de datos
│   ├── controllers/        # Controladores de la API
│   ├── middleware/         # Middlewares (auth, admin)
│   ├── routes/            # Rutas de la API
│   ├── services/          # Servicios (PDF, números)
│   ├── uploads/           # Imágenes subidas
│   └── pdfs/              # PDFs generados
├── frontend/               # Interfaz web
│   ├── css/               # Estilos
│   ├── js/                # JavaScript del cliente
│   └── *.html             # Páginas HTML
├── database/               # Scripts SQL
│   └── schema.sql         # Schema de la base de datos
└── docs/                   # Documentación
    └── DESPLIEGUE.md      # Guía de despliegue en la nube
```

## 🔐 Credenciales por Defecto

Después de ejecutar `schema.sql`, puedes iniciar sesión con:

- **Email:** `admin@bingo.com`
- **Contraseña:** `admin123` ⚠️ **Cámbiala inmediatamente**

## 📱 Uso desde Móvil

1. Despliega la aplicación en la nube (ver [DESPLIEGUE.md](docs/DESPLIEGUE.md))
2. Abre la URL en el navegador del móvil
3. Regístrate o inicia sesión
4. Crea plantillas y genera PDFs

## 🎯 Funcionalidades Principales

### Crear Plantilla

1. Ve a "Editor de Plantillas"
2. Selecciona filas y columnas
3. Haz clic en las celdas para activarlas/desactivarlas
4. Personaliza iconos y encabezado
5. Guarda la plantilla

### Generar PDF

1. Selecciona una plantilla guardada
2. Elige cantidad de tablas y tablas por página
3. Selecciona tipo: Prueba (gratis) o Final (requiere créditos)
4. Genera y descarga el PDF

### Panel de Administración

- Buscar usuarios por email
- Agregar/quitar créditos
- Ver estadísticas del sistema
- Gestionar usuarios

## 🌐 Despliegue en la Nube

Consulta la guía completa en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) para desplegar en:
- **Render** (Backend)
- **Vercel** (Frontend)
- **PlanetScale** (Base de datos MySQL)

## 🛠️ Tecnologías Utilizadas

- **Backend:**
  - Node.js + Express
  - MySQL2
  - Puppeteer (generación de PDFs)
  - JWT (autenticación)
  - bcrypt (encriptación de contraseñas)

- **Frontend:**
  - HTML5 + CSS3
  - JavaScript Vanilla
  - Diseño Responsive

## 📝 Notas Importantes

- Los PDFs de prueba son **gratis** (0 créditos)
- Los PDFs finales **cuestan créditos** (configurable, por defecto 5)
- Los números **no se repiten** entre lotes diferentes (configurable)
- El sistema guarda todos los números usados para evitar repeticiones

## 🤝 Contribuir

Este es un proyecto personal, pero si encuentras bugs o mejoras, siéntete libre de sugerirlas.

## 📄 Licencia

Este proyecto es de uso personal/educacional.

---

**Desarrollado con ❤️ para ayudar a generar tablas de bingo profesionales**

