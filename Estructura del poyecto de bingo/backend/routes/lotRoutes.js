// ============================================================
// RUTAS DE LOTES
// Archivo: backend/routes/lotRoutes.js
// Descripción: Define todas las rutas relacionadas con
//              la generación y gestión de lotes de tablas
// ============================================================

const express = require('express');
const router = express.Router();

// ------------------------------------------------------------
// Importar controlador de lotes
// ------------------------------------------------------------
const lotController = require('../controllers/lotController');

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
// Ruta: Generar un nuevo lote de tablas
// POST /api/lots
// Body: { plantilla_id, cantidad_tablas, tablas_por_pagina, tipo_pdf }
// ------------------------------------------------------------
router.post('/', lotController.generarLote);

// ------------------------------------------------------------
// Ruta: Listar los lotes del usuario
// GET /api/lots?pagina=1&limite=20
// ------------------------------------------------------------
router.get('/', lotController.listarLotes);

// ------------------------------------------------------------
// Ruta: Obtener información de un lote específico
// GET /api/lots/:id
// ------------------------------------------------------------
router.get('/:id', lotController.obtenerLote);

// ------------------------------------------------------------
// Ruta: Descargar el PDF de un lote
// GET /api/lots/:id/download
// ------------------------------------------------------------
router.get('/:id/download', lotController.descargarPDF);

// ------------------------------------------------------------
// Exportar router
// ------------------------------------------------------------
module.exports = router;

