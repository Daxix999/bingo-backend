// ============================================================
// MIDDLEWARE DE ADMINISTRADOR
// Archivo: backend/middleware/admin.js
// Descripción: Verifica que el usuario sea administrador
// ============================================================

// ------------------------------------------------------------
// Middleware para verificar que el usuario sea admin
// Debe usarse DESPUÉS del middleware verificarAuth
// ------------------------------------------------------------
const verificarAdmin = (req, res, next) => {
    try {
        // Verificar que existe la información del usuario (del middleware anterior)
        if (!req.usuario) {
            return res.status(401).json({
                error: 'No autorizado',
                mensaje: 'Debes estar autenticado'
            });
        }
        
        // Verificar que el usuario sea administrador
        if (!req.usuario.es_admin) {
            return res.status(403).json({
                error: 'Acceso denegado',
                mensaje: 'No tienes permisos de administrador'
            });
        }
        
        // El usuario es admin, continuar
        next();
        
    } catch (error) {
        console.error('Error en verificarAdmin:', error);
        res.status(500).json({
            error: 'Error de autorización'
        });
    }
};

module.exports = verificarAdmin;