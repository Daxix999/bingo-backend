// ============================================================
// RUTAS DE AUTENTICACIÓN
// Archivo: backend/routes/authRoutes.js
// Descripción: Define todas las rutas relacionadas con
//              registro, login y verificación de tokens
// ============================================================

const express = require('express');
const router = express.Router();

// ------------------------------------------------------------
// Importar controlador de autenticación
// ------------------------------------------------------------
const authController = require('../controllers/authController');

// ------------------------------------------------------------
// Importar middleware de autenticación (solo para verify)
// ------------------------------------------------------------
const verificarAuth = require('../middleware/auth');

// ------------------------------------------------------------
// Ruta: Registrar un nuevo usuario
// POST /api/auth/register
// Body: { nombre, email, password }
// ------------------------------------------------------------
router.post('/register', authController.registrarUsuario);

// ------------------------------------------------------------
// Ruta: Iniciar sesión (login)
// POST /api/auth/login
// Body: { email, password }
// ------------------------------------------------------------
router.post('/login', authController.login);

// ------------------------------------------------------------
// Ruta: Verificar token actual
// GET /api/auth/verify
// Requiere: Header Authorization con Bearer token
// ------------------------------------------------------------
router.get('/verify', verificarAuth, authController.verificarToken);

// ------------------------------------------------------------
// Exportar router
// ------------------------------------------------------------
module.exports = router;
