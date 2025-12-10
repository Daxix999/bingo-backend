// ============================================================
// SERVIDOR PRINCIPAL - GENERADOR DE TABLAS DE BINGO
// Archivo: backend/server.js
// Descripción: Punto de entrada principal del servidor Node.js
// ============================================================

// ------------------------------------------------------------
// Importar dependencias necesarias
// ------------------------------------------------------------
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// ------------------------------------------------------------
// Importar rutas de la aplicación
// ------------------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const creditRoutes = require('./routes/creditRoutes');
const templateRoutes = require('./routes/templateRoutes');
const lotRoutes = require('./routes/lotRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ------------------------------------------------------------
// Crear instancia de la aplicación Express
// ------------------------------------------------------------
const app = express();

// ------------------------------------------------------------
// Configuración del puerto del servidor
// Usa el puerto de la variable de entorno o 5000 por defecto
// ------------------------------------------------------------
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

// ------------------------------------------------------------
// Middleware de seguridad con Helmet
// Protege la aplicación de vulnerabilidades conocidas
// ------------------------------------------------------------
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar para desarrollo
    crossOriginEmbedderPolicy: false
}));

// ------------------------------------------------------------
// Middleware CORS (Cross-Origin Resource Sharing)
// Permite que el frontend (en otro dominio) acceda al backend
// ------------------------------------------------------------
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // URL del frontend
    credentials: true, // Permitir envío de cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ------------------------------------------------------------
// Middleware para parsear JSON en las peticiones
// ------------------------------------------------------------
app.use(express.json({ limit: '50mb' })); // Límite de 50MB para archivos grandes

// ------------------------------------------------------------
// Middleware para parsear datos de formularios URL-encoded
// ------------------------------------------------------------
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ------------------------------------------------------------
// Middleware para manejar subida de archivos
// Usado para subir imágenes de encabezados
// ------------------------------------------------------------
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10MB por archivo
    abortOnLimit: true,
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// ------------------------------------------------------------
// Middleware de logging (registrar peticiones HTTP)
// Útil para depuración y monitoreo
// ------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Formato detallado para desarrollo
} else {
    app.use(morgan('combined')); // Formato estándar para producción
}

// ------------------------------------------------------------
// Servir archivos estáticos (imágenes, PDFs, etc.)
// ------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// ============================================================
// RUTAS DE LA API
// ============================================================

// ------------------------------------------------------------
// Ruta de prueba (health check)
// Verifica que el servidor esté funcionando
// ------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({
        mensaje: '🎲 API del Generador de Tablas de Bingo',
        version: '1.0.0',
        estado: 'activo',
        timestamp: new Date().toISOString()
    });
});

// ------------------------------------------------------------
// Rutas de autenticación (login, registro, logout)
// Prefijo: /api/auth
// ------------------------------------------------------------
app.use('/api/auth', authRoutes);

// ------------------------------------------------------------
// Rutas de usuarios (perfil, actualizar datos)
// Prefijo: /api/users
// ------------------------------------------------------------
app.use('/api/users', userRoutes);

// ------------------------------------------------------------
// Rutas de créditos (consultar saldo, historial)
// Prefijo: /api/credits
// ------------------------------------------------------------
app.use('/api/credits', creditRoutes);

// ------------------------------------------------------------
// Rutas de plantillas (crear, editar, eliminar, listar)
// Prefijo: /api/templates
// ------------------------------------------------------------
app.use('/api/templates', templateRoutes);

// ------------------------------------------------------------
// Rutas de lotes (generar, descargar, listar)
// Prefijo: /api/lots
// ------------------------------------------------------------
app.use('/api/lots', lotRoutes);

// ------------------------------------------------------------
// Rutas de administración (gestión de usuarios, créditos)
// Prefijo: /api/admin
// ------------------------------------------------------------
app.use('/api/admin', adminRoutes);

// ============================================================
// MANEJO DE ERRORES
// ============================================================

// ------------------------------------------------------------
// Middleware para rutas no encontradas (404)
// ------------------------------------------------------------
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        mensaje: `La ruta ${req.originalUrl} no existe en este servidor`,
        metodo: req.method
    });
});

// ------------------------------------------------------------
// Middleware para manejo global de errores
// Captura todos los errores que ocurran en la aplicación
// ------------------------------------------------------------
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Error de validación de JWT
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Token inválido o expirado',
            mensaje: 'Debes iniciar sesión nuevamente'
        });
    }
    
    // Error de validación de datos
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            mensaje: err.message
        });
    }
    
    // Error de base de datos
    if (err.code && err.code.startsWith('ER_')) {
        return res.status(500).json({
            error: 'Error de base de datos',
            mensaje: 'Ocurrió un error al procesar la solicitud'
        });
    }
    
    // Error genérico
    res.status(err.status || 500).json({
        error: 'Error del servidor',
        mensaje: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Ocurrió un error inesperado',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

// ------------------------------------------------------------
// Función para iniciar el servidor
// ------------------------------------------------------------
const iniciarServidor = async () => {
    try {
        // ------------------------------------------------------------
        // Verificar conexión a la base de datos
        // ------------------------------------------------------------
        const db = require('./config/database');
        await db.verificarConexion();
        console.log('✅ Conexión a la base de datos exitosa');
        
        // Crear carpetas necesarias si no existen
        const fs = require('fs').promises;
        const carpetas = ['uploads', 'pdfs', 'uploads/encabezados', 'pdfs/temp'];
        
        for (const carpeta of carpetas) {
            const rutaCarpeta = path.join(__dirname, carpeta);
            try {
                await fs.access(rutaCarpeta);
            } catch {
                await fs.mkdir(rutaCarpeta, { recursive: true });
                console.log(`📁 Carpeta creada: ${carpeta}`);
            }
        }
        
        // Iniciar el servidor en el puerto especificado
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════');
            console.log('🎲 SERVIDOR DE BINGO INICIADO CORRECTAMENTE');
            console.log('═══════════════════════════════════════════════');
            console.log(`📡 Puerto: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`⏰ Hora: ${new Date().toLocaleString()}`);
            console.log('═══════════════════════════════════════════════');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1); // Salir con código de error
    }
};

// ------------------------------------------------------------
// Manejo de errores no capturados
// ------------------------------------------------------------
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado (Promise):', error);
    // No cerrar el servidor en desarrollo
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    // No cerrar el servidor en desarrollo
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// ------------------------------------------------------------
// Manejo de cierre graceful del servidor
// ------------------------------------------------------------
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⚠️  SIGINT recibido. Cerrando servidor...');
    process.exit(0);
});

// ------------------------------------------------------------
// Ejecutar servidor
// ------------------------------------------------------------
iniciarServidor();

// Exportar la app para testing
module.exports = app;