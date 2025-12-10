// ============================================================
// CONTROLADOR DE LOTES
// Archivo: backend/controllers/lotController.js
// Descripción: Maneja la generación de lotes de tablas de bingo,
//              incluyendo validación de créditos y generación de PDFs
// ============================================================

const db = require('../config/database');
const numberGenerator = require('../services/numberGenerator');
const pdfService = require('../services/pdfService');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ------------------------------------------------------------
// Método para generar un nuevo lote de tablas
// POST /api/lots
// Body: { plantilla_id, cantidad_tablas, tablas_por_pagina, tipo_pdf }
// ------------------------------------------------------------
const generarLote = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const {
            plantilla_id,
            cantidad_tablas,
            tablas_por_pagina = 1,
            tipo_pdf = 'prueba'
        } = req.body;
        
        // Validar campos obligatorios
        if (!plantilla_id || !cantidad_tablas) {
            return res.status(400).json({
                error: 'Campos incompletos',
                mensaje: 'plantilla_id y cantidad_tablas son obligatorios'
            });
        }
        
        // Validar cantidad de tablas
        if (!Number.isInteger(cantidad_tablas) || cantidad_tablas < 1 || cantidad_tablas > 10000) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                mensaje: 'La cantidad de tablas debe ser un número entre 1 y 10000'
            });
        }
        
        // Validar tipo de PDF
        if (!['prueba', 'final'].includes(tipo_pdf)) {
            return res.status(400).json({
                error: 'Tipo de PDF inválido',
                mensaje: 'El tipo_pdf debe ser "prueba" o "final"'
            });
        }
        
        // Obtener plantilla
        const plantilla = await db.obtenerUno(
            'SELECT * FROM plantillas WHERE id = ?',
            [plantilla_id]
        );
        
        if (!plantilla) {
            return res.status(404).json({
                error: 'Plantilla no encontrada',
                mensaje: 'La plantilla especificada no existe'
            });
        }
        
        // Verificar permisos: la plantilla debe pertenecer al usuario o ser pública
        // (por ahora solo verificamos que exista)
        
        // Obtener configuración de costos
        const configCostoPrueba = await db.obtenerUno(
            'SELECT valor FROM configuracion WHERE clave = ?',
            ['costo_pdf_prueba']
        );
        const configCostoFinal = await db.obtenerUno(
            'SELECT valor FROM configuracion WHERE clave = ?',
            ['costo_pdf_final']
        );
        
        const costoPrueba = parseInt(configCostoPrueba?.valor || 0);
        const costoFinal = parseInt(configCostoFinal?.valor || 5);
        
        // Calcular costo según tipo de PDF
        const costoCreditos = tipo_pdf === 'final' ? costoFinal : costoPrueba;
        
        // Si es PDF final, verificar créditos del usuario
        if (tipo_pdf === 'final') {
            const usuario = await db.obtenerUno(
                'SELECT creditos FROM usuarios WHERE id = ?',
                [usuarioId]
            );
            
            if (!usuario || usuario.creditos < costoCreditos) {
                return res.status(402).json({
                    error: 'Créditos insuficientes',
                    mensaje: `Necesitas ${costoCreditos} créditos para generar un PDF final. Tienes ${usuario?.creditos || 0} créditos.`,
                    creditos_disponibles: usuario?.creditos || 0,
                    creditos_necesarios: costoCreditos
                });
            }
        }
        
        // Obtener configuración de repetición de números
        const configRepeticion = await db.obtenerUno(
            'SELECT valor FROM configuracion WHERE clave = ?',
            ['permitir_repeticion_numeros']
        );
        const permitirRepeticion = configRepeticion?.valor === '1';
        
        // Crear registro del lote en estado "generando"
        const loteId = await db.insertar('lotes', {
            plantilla_id,
            usuario_id: usuarioId,
            cantidad_tablas,
            tablas_por_pagina,
            tipo_pdf,
            costo_creditos: costoCreditos,
            estado: 'generando'
        });
        
        try {
            // Generar números para las tablas
            const tablas = await numberGenerator.generarNumerosParaLote(
                plantilla,
                cantidad_tablas,
                permitirRepeticion
            );
            
            // Guardar números usados en la base de datos
            await numberGenerator.guardarNumerosUsados(loteId, plantilla_id, tablas);
            
            // Generar PDF
            const nombreArchivo = `bingo_${loteId}_${uuidv4()}.pdf`;
            const pdfPath = await pdfService.generarPDF(
                tablas,
                plantilla,
                tablas_por_pagina,
                nombreArchivo
            );
            
            // Actualizar lote con ruta del PDF y estado completado
            await db.actualizar(
                'lotes',
                {
                    pdf_path: nombreArchivo,
                    estado: 'completado'
                },
                'id = ?',
                [loteId]
            );
            
            // Si es PDF final, descontar créditos
            if (tipo_pdf === 'final') {
                await db.ejecutarTransaccion(async (connection) => {
                    // Descontar créditos
                    await connection.execute(
                        'UPDATE usuarios SET creditos = creditos - ? WHERE id = ?',
                        [costoCreditos, usuarioId]
                    );
                    
                    // Registrar transacción
                    await connection.execute(
                        `INSERT INTO transacciones_creditos 
                        (usuario_id, tipo, cantidad, descripcion)
                        VALUES (?, 'uso', ?, ?)`,
                        [
                            usuarioId,
                            -costoCreditos,
                            `Generación de PDF final - Lote #${loteId} (${cantidad_tablas} tablas)`
                        ]
                    );
                });
            }
            
            // Obtener créditos actualizados del usuario
            const usuarioActualizado = await db.obtenerUno(
                'SELECT creditos FROM usuarios WHERE id = ?',
                [usuarioId]
            );
            
            res.status(201).json({
                mensaje: `Lote generado exitosamente (${tipo_pdf === 'final' ? 'PDF final' : 'PDF de prueba'})`,
                lote: {
                    id: loteId,
                    cantidad_tablas,
                    tipo_pdf,
                    costo_creditos: tipo_pdf === 'final' ? costoCreditos : 0,
                    creditos_restantes: usuarioActualizado?.creditos || 0
                },
                pdf_url: `/api/lots/${loteId}/download`
            });
            
        } catch (error) {
            // Si hay error, actualizar estado del lote
            await db.actualizar(
                'lotes',
                { estado: 'error' },
                'id = ?',
                [loteId]
            );
            
            console.error('Error al generar lote:', error);
            throw error;
        }
        
    } catch (error) {
        console.error('Error en generarLote:', error);
        res.status(500).json({
            error: 'Error al generar lote',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para descargar el PDF de un lote
// GET /api/lots/:id/download
// ------------------------------------------------------------
const descargarPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        
        // Obtener información del lote
        const lote = await db.obtenerUno(
            'SELECT * FROM lotes WHERE id = ?',
            [id]
        );
        
        if (!lote) {
            return res.status(404).json({
                error: 'Lote no encontrado'
            });
        }
        
        // Verificar permisos: el usuario debe ser el dueño del lote o admin
        if (lote.usuario_id !== usuarioId && !req.usuario.es_admin) {
            return res.status(403).json({
                error: 'Acceso denegado',
                mensaje: 'No tienes permisos para descargar este lote'
            });
        }
        
        // Verificar que el PDF existe
        if (!lote.pdf_path || lote.estado !== 'completado') {
            return res.status(404).json({
                error: 'PDF no disponible',
                mensaje: 'El PDF aún no está listo o hubo un error al generarlo'
            });
        }
        
        // Construir ruta del archivo
        const pdfPath = path.join(__dirname, '../pdfs', lote.pdf_path);
        const fs = require('fs');
        
        // Verificar que el archivo existe físicamente
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({
                error: 'Archivo no encontrado',
                mensaje: 'El archivo PDF no existe en el servidor'
            });
        }
        
        // Enviar archivo
        res.download(pdfPath, `bingo_lote_${id}.pdf`, (error) => {
            if (error) {
                console.error('Error al descargar PDF:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Error al descargar PDF'
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('Error en descargarPDF:', error);
        res.status(500).json({
            error: 'Error al descargar PDF',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para listar los lotes del usuario
// GET /api/lots?pagina=1&limite=20
// ------------------------------------------------------------
const listarLotes = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { pagina = 1, limite = 20 } = req.query;
        const offset = (pagina - 1) * limite;
        
        // Obtener lotes del usuario
        const lotes = await db.ejecutarConsulta(
            `SELECT 
                l.id,
                l.cantidad_tablas,
                l.tablas_por_pagina,
                l.tipo_pdf,
                l.costo_creditos,
                l.estado,
                l.creado_en,
                p.nombre as plantilla_nombre,
                p.filas,
                p.columnas
            FROM lotes l
            JOIN plantillas p ON l.plantilla_id = p.id
            WHERE l.usuario_id = ?
            ORDER BY l.creado_en DESC
            LIMIT ? OFFSET ?`,
            [usuarioId, parseInt(limite), offset]
        );
        
        // Contar total
        const [{ total }] = await db.ejecutarConsulta(
            'SELECT COUNT(*) as total FROM lotes WHERE usuario_id = ?',
            [usuarioId]
        );
        
        res.json({
            lotes,
            paginacion: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        });
        
    } catch (error) {
        console.error('Error en listarLotes:', error);
        res.status(500).json({
            error: 'Error al listar lotes',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para obtener información de un lote específico
// GET /api/lots/:id
// ------------------------------------------------------------
const obtenerLote = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        
        // Obtener información del lote
        const lote = await db.obtenerUno(
            `SELECT 
                l.*,
                p.nombre as plantilla_nombre,
                p.filas,
                p.columnas,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM lotes l
            JOIN plantillas p ON l.plantilla_id = p.id
            JOIN usuarios u ON l.usuario_id = u.id
            WHERE l.id = ?`,
            [id]
        );
        
        if (!lote) {
            return res.status(404).json({
                error: 'Lote no encontrado'
            });
        }
        
        // Verificar permisos
        if (lote.usuario_id !== usuarioId && !req.usuario.es_admin) {
            return res.status(403).json({
                error: 'Acceso denegado'
            });
        }
        
        // Obtener números usados en este lote
        const numerosUsados = await db.ejecutarConsulta(
            `SELECT 
                numero,
                tabla_index,
                fila,
                columna
            FROM numeros_usados
            WHERE lote_id = ?
            ORDER BY tabla_index, fila, columna`,
            [id]
        );
        
        res.json({
            lote,
            numeros_usados: numerosUsados,
            total_numeros: numerosUsados.length
        });
        
    } catch (error) {
        console.error('Error en obtenerLote:', error);
        res.status(500).json({
            error: 'Error al obtener lote',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Exportar funciones del controlador
// ------------------------------------------------------------
module.exports = {
    generarLote,
    descargarPDF,
    listarLotes,
    obtenerLote
};
