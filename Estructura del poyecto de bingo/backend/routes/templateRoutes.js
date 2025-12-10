// ============================================================
// RUTAS DE PLANTILLAS
// Archivo: backend/routes/templateRoutes.js
// Descripción: Define todas las rutas relacionadas con
//              la gestión de plantillas de tablas de bingo
// ============================================================

const express = require('express');
const router = express.Router();

// ------------------------------------------------------------
// Importar controlador de plantillas
// ------------------------------------------------------------
const templateController = require('../controllers/templateController');

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
// Ruta: Crear una nueva plantilla
// POST /api/templates
// Body: { nombre, filas, columnas, grid_json, iconos_json, ... }
// ------------------------------------------------------------
router.post('/', templateController.crearPlantilla);

// ------------------------------------------------------------
// Ruta: Listar todas las plantillas del usuario
// GET /api/templates
// ------------------------------------------------------------
router.get('/', templateController.listarPlantillas);

// ------------------------------------------------------------
// Ruta: Obtener una plantilla específica
// GET /api/templates/:id
// ------------------------------------------------------------
router.get('/:id', templateController.obtenerPlantilla);

// ------------------------------------------------------------
// Ruta: Actualizar una plantilla
// PUT /api/templates/:id
// Body: { nombre, grid_json, iconos_json, ... }
// ------------------------------------------------------------
router.put('/:id', templateController.actualizarPlantilla);

// ------------------------------------------------------------
// Ruta: Eliminar una plantilla
// DELETE /api/templates/:id
// ------------------------------------------------------------
router.delete('/:id', templateController.eliminarPlantilla);

// ------------------------------------------------------------
// Exportar router
// ------------------------------------------------------------
module.exports = router;

