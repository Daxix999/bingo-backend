// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN
// Archivo: backend/middleware/auth.js
// Descripción: Verifica que el usuario tenga un token JWT válido
// ============================================================

const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ------------------------------------------------------------
// Middleware para verificar token JWT en las peticiones
// Se ejecuta antes de los controladores protegidos
// ------------------------------------------------------------
const verificarAuth = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'No autorizado',
                mensaje: 'Token no proporcionado'
            });
        }
        
        // El formato esperado es: "Bearer TOKEN_AQUI"
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'No autorizado',
                mensaje: 'Formato de token inválido'
            });
        }
        
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario existe y está activo
        const usuario = await db.obtenerUno(
            'SELECT id, email, es_admin, activo FROM usuarios WHERE id = ?',
            [decoded.id]
        );
        
        if (!usuario) {
            return res.status(401).json({
                error: 'No autorizado',
                mensaje: 'Usuario no encontrado'
            });
        }
        
        if (!usuario.activo) {
            return res.status(403).json({
                error: 'Cuenta inactiva',
                mensaje: 'Tu cuenta ha sido desactivada'
            });
        }
        
        // Agregar información del usuario al request
        req.usuario = {
            id: usuario.id,
            email: usuario.email,
            es_admin: Boolean(usuario.es_admin)
        };
        
        // Continuar con el siguiente middleware o controlador
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                mensaje: 'El token proporcionado no es válido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                mensaje: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente'
            });
        }
        
        console.error('Error en verificarAuth:', error);
        res.status(500).json({
            error: 'Error de autenticación',
            mensaje: 'Ocurrió un error al verificar la autenticación'
        });
    }
};

module.exports = verificarAuth;