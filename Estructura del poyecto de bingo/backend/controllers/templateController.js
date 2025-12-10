// ============================================================
// CONTROLADOR DE PLANTILLAS
// Archivo: backend/controllers/templateController.js
// Descripción: Maneja la creación, edición, eliminación y
//              consulta de plantillas de tablas de bingo
// ============================================================

const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// ------------------------------------------------------------
// Método para crear una nueva plantilla
// POST /api/templates
// Body: { nombre, filas, columnas, grid_json, iconos_json, ... }
// ------------------------------------------------------------
const crearPlantilla = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const {
            nombre,
            filas,
            columnas,
            grid_json,
            iconos_json,
            encabezado_texto,
            numero_min = 1,
            numero_max = 90,
            usa_columnas_especificas = false,
            rangos_columnas_json
        } = req.body;
        
        // Validar campos obligatorios
        if (!nombre || !filas || !columnas || !grid_json) {
            return res.status(400).json({
                error: 'Campos incompletos',
                mensaje: 'Nombre, filas, columnas y grid_json son obligatorios'
            });
        }
        
        // Validar que filas y columnas sean números positivos
        if (!Number.isInteger(filas) || filas < 1 || filas > 50) {
            return res.status(400).json({
                error: 'Filas inválidas',
                mensaje: 'Las filas deben ser un número entre 1 y 50'
            });
        }
        
        if (!Number.isInteger(columnas) || columnas < 1 || columnas > 50) {
            return res.status(400).json({
                error: 'Columnas inválidas',
                mensaje: 'Las columnas deben ser un número entre 1 y 50'
            });
        }
        
        // Validar formato de grid_json
        let grid;
        try {
            grid = typeof grid_json === 'string' ? JSON.parse(grid_json) : grid_json;
            
            // Verificar que sea un array 2D con las dimensiones correctas
            if (!Array.isArray(grid) || grid.length !== filas) {
                throw new Error('Grid no coincide con número de filas');
            }
            
            for (let fila of grid) {
                if (!Array.isArray(fila) || fila.length !== columnas) {
                    throw new Error('Grid no coincide con número de columnas');
                }
            }
        } catch (error) {
            return res.status(400).json({
                error: 'Grid inválido',
                mensaje: 'El grid_json debe ser un array 2D válido con las dimensiones correctas'
            });
        }
        
        // Validar iconos_json si se proporciona
        let iconos = null;
        if (iconos_json) {
            try {
                iconos = typeof iconos_json === 'string' ? JSON.parse(iconos_json) : iconos_json;
                
                // Verificar que tenga las mismas dimensiones que el grid
                if (Array.isArray(iconos) && iconos.length === filas) {
                    for (let i = 0; i < iconos.length; i++) {
                        if (!Array.isArray(iconos[i]) || iconos[i].length !== columnas) {
                            throw new Error('Iconos no coinciden con dimensiones del grid');
                        }
                    }
                } else {
                    throw new Error('Iconos no coinciden con dimensiones del grid');
                }
            } catch (error) {
                return res.status(400).json({
                    error: 'Iconos inválidos',
                    mensaje: 'El iconos_json debe tener las mismas dimensiones que el grid'
                });
            }
        }
        
        // Validar rangos de números
        if (numero_min < 1 || numero_max > 999 || numero_min >= numero_max) {
            return res.status(400).json({
                error: 'Rango de números inválido',
                mensaje: 'El rango debe ser válido (min >= 1, max <= 999, min < max)'
            });
        }
        
        // Validar rangos por columna si se usa
        if (usa_columnas_especificas && rangos_columnas_json) {
            try {
                const rangos = typeof rangos_columnas_json === 'string' 
                    ? JSON.parse(rangos_columnas_json) 
                    : rangos_columnas_json;
                
                if (!Array.isArray(rangos) || rangos.length !== columnas) {
                    throw new Error('Rangos por columna inválidos');
                }
                
                for (let rango of rangos) {
                    if (!Array.isArray(rango) || rango.length !== 2) {
                        throw new Error('Cada rango debe ser [min, max]');
                    }
                }
            } catch (error) {
                return res.status(400).json({
                    error: 'Rangos por columna inválidos',
                    mensaje: error.message
                });
            }
        }
        
        // Manejar imagen de encabezado si se subió
        let encabezado_img = null;
        if (req.files && req.files.encabezado_img) {
            const archivo = req.files.encabezado_img;
            const extension = path.extname(archivo.name).toLowerCase();
            const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            
            if (!extensionesPermitidas.includes(extension)) {
                return res.status(400).json({
                    error: 'Formato de imagen inválido',
                    mensaje: 'Solo se permiten imágenes JPG, PNG, GIF o WEBP'
                });
            }
            
            // Generar nombre único para el archivo
            const nombreArchivo = `encabezado_${usuarioId}_${Date.now()}${extension}`;
            const rutaDestino = path.join(__dirname, '../uploads/encabezados', nombreArchivo);
            
            // Crear carpeta si no existe
            await fs.mkdir(path.dirname(rutaDestino), { recursive: true });
            
            // Guardar archivo
            await archivo.mv(rutaDestino);
            encabezado_img = nombreArchivo;
        }
        
        // Insertar plantilla en la base de datos
        const plantillaId = await db.insertar('plantillas', {
            usuario_id: usuarioId,
            nombre,
            filas,
            columnas,
            grid_json: JSON.stringify(grid),
            iconos_json: iconos ? JSON.stringify(iconos) : null,
            encabezado_img,
            encabezado_texto: encabezado_texto || null,
            numero_min,
            numero_max,
            usa_columnas_especificas: usa_columnas_especificas ? 1 : 0,
            rangos_columnas_json: rangos_columnas_json 
                ? (typeof rangos_columnas_json === 'string' 
                    ? rangos_columnas_json 
                    : JSON.stringify(rangos_columnas_json))
                : null
        });
        
        // Obtener plantilla creada
        const plantilla = await db.obtenerUno(
            'SELECT * FROM plantillas WHERE id = ?',
            [plantillaId]
        );
        
        res.status(201).json({
            mensaje: 'Plantilla creada exitosamente',
            plantilla: {
                ...plantilla,
                grid_json: JSON.parse(plantilla.grid_json),
                iconos_json: plantilla.iconos_json ? JSON.parse(plantilla.iconos_json) : null,
                rangos_columnas_json: plantilla.rangos_columnas_json 
                    ? JSON.parse(plantilla.rangos_columnas_json) 
                    : null
            }
        });
        
    } catch (error) {
        console.error('Error en crearPlantilla:', error);
        res.status(500).json({
            error: 'Error al crear plantilla',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para obtener todas las plantillas del usuario
// GET /api/templates
// ------------------------------------------------------------
const listarPlantillas = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        
        // Obtener plantillas del usuario
        const plantillas = await db.ejecutarConsulta(
            `SELECT 
                id,
                nombre,
                filas,
                columnas,
                encabezado_texto,
                numero_min,
                numero_max,
                creado_en,
                actualizado_en
            FROM plantillas
            WHERE usuario_id = ?
            ORDER BY actualizado_en DESC`,
            [usuarioId]
        );
        
        res.json({
            plantillas,
            total: plantillas.length
        });
        
    } catch (error) {
        console.error('Error en listarPlantillas:', error);
        res.status(500).json({
            error: 'Error al listar plantillas',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para obtener una plantilla específica
// GET /api/templates/:id
// ------------------------------------------------------------
const obtenerPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        
        // Obtener plantilla
        const plantilla = await db.obtenerUno(
            'SELECT * FROM plantillas WHERE id = ? AND usuario_id = ?',
            [id, usuarioId]
        );
        
        if (!plantilla) {
            return res.status(404).json({
                error: 'Plantilla no encontrada',
                mensaje: 'La plantilla no existe o no tienes permisos para acceder a ella'
            });
        }
        
        // Parsear JSONs
        const plantillaParsed = {
            ...plantilla,
            grid_json: JSON.parse(plantilla.grid_json),
            iconos_json: plantilla.iconos_json ? JSON.parse(plantilla.iconos_json) : null,
            rangos_columnas_json: plantilla.rangos_columnas_json 
                ? JSON.parse(plantilla.rangos_columnas_json) 
                : null,
            usa_columnas_especificas: Boolean(plantilla.usa_columnas_especificas)
        };
        
        res.json({
            plantilla: plantillaParsed
        });
        
    } catch (error) {
        console.error('Error en obtenerPlantilla:', error);
        res.status(500).json({
            error: 'Error al obtener plantilla',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para actualizar una plantilla
// PUT /api/templates/:id
// ------------------------------------------------------------
const actualizarPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        
        // Verificar que la plantilla existe y pertenece al usuario
        const plantillaExistente = await db.obtenerUno(
            'SELECT * FROM plantillas WHERE id = ? AND usuario_id = ?',
            [id, usuarioId]
        );
        
        if (!plantillaExistente) {
            return res.status(404).json({
                error: 'Plantilla no encontrada'
            });
        }
        
        // Obtener datos a actualizar
        const {
            nombre,
            grid_json,
            iconos_json,
            encabezado_texto,
            numero_min,
            numero_max,
            usa_columnas_especificas,
            rangos_columnas_json
        } = req.body;
        
        // Preparar objeto de actualización
        const datosActualizar = {};
        
        if (nombre !== undefined) datosActualizar.nombre = nombre;
        if (encabezado_texto !== undefined) datosActualizar.encabezado_texto = encabezado_texto;
        if (numero_min !== undefined) datosActualizar.numero_min = numero_min;
        if (numero_max !== undefined) datosActualizar.numero_max = numero_max;
        if (usa_columnas_especificas !== undefined) {
            datosActualizar.usa_columnas_especificas = usa_columnas_especificas ? 1 : 0;
        }
        
        if (grid_json !== undefined) {
            datosActualizar.grid_json = typeof grid_json === 'string' 
                ? grid_json 
                : JSON.stringify(grid_json);
        }
        
        if (iconos_json !== undefined) {
            datosActualizar.iconos_json = iconos_json 
                ? (typeof iconos_json === 'string' 
                    ? iconos_json 
                    : JSON.stringify(iconos_json))
                : null;
        }
        
        if (rangos_columnas_json !== undefined) {
            datosActualizar.rangos_columnas_json = rangos_columnas_json
                ? (typeof rangos_columnas_json === 'string'
                    ? rangos_columnas_json
                    : JSON.stringify(rangos_columnas_json))
                : null;
        }
        
        // Manejar nueva imagen de encabezado si se subió
        if (req.files && req.files.encabezado_img) {
            const archivo = req.files.encabezado_img;
            const extension = path.extname(archivo.name).toLowerCase();
            const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            
            if (!extensionesPermitidas.includes(extension)) {
                return res.status(400).json({
                    error: 'Formato de imagen inválido'
                });
            }
            
            // Eliminar imagen anterior si existe
            if (plantillaExistente.encabezado_img) {
                try {
                    const rutaAnterior = path.join(
                        __dirname, 
                        '../uploads/encabezados', 
                        plantillaExistente.encabezado_img
                    );
                    await fs.unlink(rutaAnterior);
                } catch (error) {
                    console.warn('No se pudo eliminar imagen anterior:', error);
                }
            }
            
            // Guardar nueva imagen
            const nombreArchivo = `encabezado_${usuarioId}_${Date.now()}${extension}`;
            const rutaDestino = path.join(__dirname, '../uploads/encabezados', nombreArchivo);
            await fs.mkdir(path.dirname(rutaDestino), { recursive: true });
            await archivo.mv(rutaDestino);
            datosActualizar.encabezado_img = nombreArchivo;
        }
        
        // Actualizar en la base de datos
        await db.actualizar(
            'plantillas',
            datosActualizar,
            'id = ?',
            [id]
        );
        
        // Obtener plantilla actualizada
        const plantillaActualizada = await db.obtenerUno(
            'SELECT * FROM plantillas WHERE id = ?',
            [id]
        );
        
        res.json({
            mensaje: 'Plantilla actualizada exitosamente',
            plantilla: {
                ...plantillaActualizada,
                grid_json: JSON.parse(plantillaActualizada.grid_json),
                iconos_json: plantillaActualizada.iconos_json 
                    ? JSON.parse(plantillaActualizada.iconos_json) 
                    : null,
                rangos_columnas_json: plantillaActualizada.rangos_columnas_json
                    ? JSON.parse(plantillaActualizada.rangos_columnas_json)
                    : null
            }
        });
        
    } catch (error) {
        console.error('Error en actualizarPlantilla:', error);
        res.status(500).json({
            error: 'Error al actualizar plantilla',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para eliminar una plantilla
// DELETE /api/templates/:id
// ------------------------------------------------------------
const eliminarPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        
        // Verificar que la plantilla existe y pertenece al usuario
        const plantilla = await db.obtenerUno(
            'SELECT * FROM plantillas WHERE id = ? AND usuario_id = ?',
            [id, usuarioId]
        );
        
        if (!plantilla) {
            return res.status(404).json({
                error: 'Plantilla no encontrada'
            });
        }
        
        // Verificar si hay lotes usando esta plantilla
        const lotesUsandoPlantilla = await db.ejecutarConsulta(
            'SELECT COUNT(*) as total FROM lotes WHERE plantilla_id = ?',
            [id]
        );
        
        if (lotesUsandoPlantilla[0].total > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar',
                mensaje: 'Esta plantilla está siendo usada por uno o más lotes. Elimina los lotes primero.'
            });
        }
        
        // Eliminar imagen de encabezado si existe
        if (plantilla.encabezado_img) {
            try {
                const rutaImagen = path.join(
                    __dirname,
                    '../uploads/encabezados',
                    plantilla.encabezado_img
                );
                await fs.unlink(rutaImagen);
            } catch (error) {
                console.warn('No se pudo eliminar imagen:', error);
            }
        }
        
        // Eliminar plantilla
        await db.eliminar('plantillas', 'id = ?', [id]);
        
        res.json({
            mensaje: 'Plantilla eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error en eliminarPlantilla:', error);
        res.status(500).json({
            error: 'Error al eliminar plantilla',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Exportar funciones del controlador
// ------------------------------------------------------------
module.exports = {
    crearPlantilla,
    listarPlantillas,
    obtenerPlantilla,
    actualizarPlantilla,
    eliminarPlantilla
};

