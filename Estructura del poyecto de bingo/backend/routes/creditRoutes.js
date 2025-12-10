// ============================================================
// RUTAS DE CRÉDITOS
// Archivo: backend/routes/creditRoutes.js
// Descripción: Define todas las rutas relacionadas con
//              consulta de créditos y transacciones
// ============================================================

const express = require('express');
const router = express.Router();

// ------------------------------------------------------------
// Importar controlador de créditos
// ------------------------------------------------------------
const creditController = require('../controllers/creditController');

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
// Ruta: Obtener el saldo de créditos del usuario
// GET /api/credits/balance
// ------------------------------------------------------------
router.get('/balance', creditController.obtenerSaldo);

// ------------------------------------------------------------
// Ruta: Obtener historial de transacciones
// GET /api/credits/history?pagina=1&limite=50
// ------------------------------------------------------------
router.get('/history', creditController.obtenerHistorial);

// ------------------------------------------------------------
// Exportar router
// ------------------------------------------------------------
module.exports = router;

