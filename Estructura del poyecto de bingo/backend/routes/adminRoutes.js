// ============================================================
// RUTAS DE ADMINISTRACIÓN
// Archivo: backend/routes/adminRoutes.js
// Descripción: Define todas las rutas relacionadas con
//              funciones administrativas del sistema
// ============================================================

const express = require('express');
const router = express.Router();

// ------------------------------------------------------------
// Importar controlador de administración
// ------------------------------------------------------------
const adminController = require('../controllers/adminController');

// ------------------------------------------------------------
// Importar middlewares de autenticación y autorización
// ------------------------------------------------------------
const verificarAuth = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// ------------------------------------------------------------
// Aplicar middleware de autenticación y admin a todas las rutas
// Todas las rutas de admin requieren estar autenticado y ser admin
// ------------------------------------------------------------
router.use(verificarAuth);
router.use(verificarAdmin);

// ------------------------------------------------------------
// Ruta: Buscar usuarios por email o nombre
// GET /api/admin/users/search?q=email@ejemplo.com
// ------------------------------------------------------------
router.get('/users/search', adminController.buscarUsuarios);

// ------------------------------------------------------------
// Ruta: Listar todos los usuarios (con paginación)
// GET /api/admin/users?pagina=1&limite=20
// ------------------------------------------------------------
router.get('/users', adminController.listarUsuarios);

// ------------------------------------------------------------
// Ruta: Obtener información de un usuario específico
// GET /api/admin/users/:id
// ------------------------------------------------------------
router.get('/users/:id', adminController.obtenerUsuario);

// ------------------------------------------------------------
// Ruta: Agregar créditos a un usuario
// POST /api/admin/users/:id/credits
// Body: { cantidad: 20, descripcion: "Créditos regalados" }
// ------------------------------------------------------------
router.post('/users/:id/credits', adminController.agregarCreditos);

// ------------------------------------------------------------
// Ruta: Quitar créditos a un usuario
// POST /api/admin/users/:id/credits/remove
// Body: { cantidad: 10, descripcion: "Ajuste de créditos" }
// ------------------------------------------------------------
router.post('/users/:id/credits/remove', adminController.quitarCreditos);

// ------------------------------------------------------------
// Ruta: Activar/desactivar un usuario
// PATCH /api/admin/users/:id/status
// Body: { activo: true/false }
// ------------------------------------------------------------
router.patch('/users/:id/status', adminController.cambiarEstadoUsuario);

// ------------------------------------------------------------
// Ruta: Obtener estadísticas generales del sistema
// GET /api/admin/stats
// ------------------------------------------------------------
router.get('/stats', adminController.obtenerEstadisticas);

// ------------------------------------------------------------
// Exportar router
// ------------------------------------------------------------
module.exports = router;

