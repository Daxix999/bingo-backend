// ============================================================
// RUTAS DE USUARIOS
// Archivo: backend/routes/userRoutes.js
// Descripción: Define todas las rutas relacionadas con
//              la gestión del perfil del usuario
// ============================================================

const express = require('express');
const router = express.Router();

// ------------------------------------------------------------
// Importar controlador de usuarios
// ------------------------------------------------------------
const userController = require('../controllers/userController');

// ------------------------------------------------------------
// Importar middleware de autenticación
// Todas las rutas requieren estar autenticado
// ------------------------------------------------------------
const verificarAuth = require('../middleware/auth');

// ------------------------------------------------------------
// Aplicar middleware de autenticación a todas las rutas
// ------------------------------------------------------------
router.use(verificarAuth);

// ------------------------------------------------------------
// Ruta: Obtener perfil del usuario actual
// GET /api/users/profile
// ------------------------------------------------------------
router.get('/profile', userController.obtenerPerfil);

// ------------------------------------------------------------
// Ruta: Actualizar perfil del usuario
// PUT /api/users/profile
// Body: { nombre, email, password }
// ------------------------------------------------------------
router.put('/profile', userController.actualizarPerfil);

// ------------------------------------------------------------
// Exportar router
// ------------------------------------------------------------
module.exports = router;

