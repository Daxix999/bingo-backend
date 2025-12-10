// ============================================================
// CONTROLADOR DE ADMINISTRACIÓN
// Archivo: backend/controllers/adminController.js
// Descripción: Maneja todas las funciones administrativas:
//              - Gestión de usuarios
//              - Agregar/quitar créditos
//              - Ver historial de transacciones
//              - Ver estadísticas del sistema
// ============================================================

const db = require('../config/database');
const bcrypt = require('bcrypt');

// ------------------------------------------------------------
// Método para buscar usuarios por email o nombre
// GET /api/admin/users/search?q=email@ejemplo.com
// ------------------------------------------------------------
const buscarUsuarios = async (req, res) => {
    try {
        const { q = '' } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                error: 'Búsqueda inválida',
                mensaje: 'Debes proporcionar al menos 2 caracteres para buscar'
            });
        }
        
        // Buscar usuarios por email o nombre
        const usuarios = await db.ejecutarConsulta(
            `SELECT 
                id,
                nombre,
                email,
                creditos,
                es_admin,
                activo,
                creado_en
            FROM usuarios
            WHERE email LIKE ? OR nombre LIKE ?
            ORDER BY creado_en DESC
            LIMIT 50`,
            [`%${q}%`, `%${q}%`]
        );
        
        res.json({
            usuarios,
            total: usuarios.length
        });
        
    } catch (error) {
        console.error('Error en buscarUsuarios:', error);
        res.status(500).json({
            error: 'Error al buscar usuarios',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para obtener información de un usuario específico
// GET /api/admin/users/:id
// ------------------------------------------------------------
const obtenerUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener datos del usuario
        const usuario = await db.obtenerUno(
            `SELECT 
                id,
                nombre,
                email,
                creditos,
                es_admin,
                activo,
                creado_en,
                actualizado_en
            FROM usuarios
            WHERE id = ?`,
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // Obtener estadísticas del usuario
        const estadisticas = await db.obtenerUno(
            `SELECT 
                COUNT(*) as total_lotes,
                SUM(cantidad_tablas) as total_tablas,
                SUM(CASE WHEN tipo_pdf = 'final' THEN 1 ELSE 0 END) as lotes_finales,
                SUM(costo_creditos) as total_creditos_gastados
            FROM lotes
            WHERE usuario_id = ?`,
            [id]
        );
        
        // Obtener últimas transacciones
        const transacciones = await db.ejecutarConsulta(
            `SELECT 
                id,
                tipo,
                cantidad,
                descripcion,
                fecha
            FROM transacciones_creditos
            WHERE usuario_id = ?
            ORDER BY fecha DESC
            LIMIT 10`,
            [id]
        );
        
        res.json({
            usuario,
            estadisticas: {
                total_lotes: estadisticas.total_lotes || 0,
                total_tablas: estadisticas.total_tablas || 0,
                lotes_finales: estadisticas.lotes_finales || 0,
                total_creditos_gastados: estadisticas.total_creditos_gastados || 0
            },
            ultimas_transacciones: transacciones
        });
        
    } catch (error) {
        console.error('Error en obtenerUsuario:', error);
        res.status(500).json({
            error: 'Error al obtener usuario',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para agregar créditos a un usuario
// POST /api/admin/users/:id/credits
// Body: { cantidad: 20, descripcion: "Créditos regalados" }
// ------------------------------------------------------------
const agregarCreditos = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, descripcion = 'Créditos agregados por administrador' } = req.body;
        const adminId = req.usuario.id;
        
        // Validar cantidad
        if (!cantidad || cantidad <= 0 || !Number.isInteger(cantidad)) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                mensaje: 'La cantidad debe ser un número entero positivo'
            });
        }
        
        // Verificar que el usuario existe
        const usuario = await db.obtenerUno(
            'SELECT id, nombre, email, creditos FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // Usar transacción para asegurar consistencia
        await db.ejecutarTransaccion(async (connection) => {
            // Actualizar créditos del usuario
            await connection.execute(
                'UPDATE usuarios SET creditos = creditos + ? WHERE id = ?',
                [cantidad, id]
            );
            
            // Registrar transacción
            await connection.execute(
                `INSERT INTO transacciones_creditos 
                (usuario_id, tipo, cantidad, descripcion, admin_id)
                VALUES (?, 'regalo', ?, ?, ?)`,
                [id, cantidad, descripcion, adminId]
            );
        });
        
        // Obtener créditos actualizados
        const usuarioActualizado = await db.obtenerUno(
            'SELECT creditos FROM usuarios WHERE id = ?',
            [id]
        );
        
        res.json({
            mensaje: 'Créditos agregados exitosamente',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                creditos_anteriores: usuario.creditos,
                creditos_agregados: cantidad,
                creditos_actuales: usuarioActualizado.creditos
            }
        });
        
    } catch (error) {
        console.error('Error en agregarCreditos:', error);
        res.status(500).json({
            error: 'Error al agregar créditos',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para quitar créditos a un usuario
// POST /api/admin/users/:id/credits/remove
// Body: { cantidad: 10, descripcion: "Ajuste de créditos" }
// ------------------------------------------------------------
const quitarCreditos = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, descripcion = 'Créditos removidos por administrador' } = req.body;
        const adminId = req.usuario.id;
        
        // Validar cantidad
        if (!cantidad || cantidad <= 0 || !Number.isInteger(cantidad)) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                mensaje: 'La cantidad debe ser un número entero positivo'
            });
        }
        
        // Verificar que el usuario existe y tiene suficientes créditos
        const usuario = await db.obtenerUno(
            'SELECT id, nombre, email, creditos FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        if (usuario.creditos < cantidad) {
            return res.status(400).json({
                error: 'Créditos insuficientes',
                mensaje: `El usuario solo tiene ${usuario.creditos} créditos`
            });
        }
        
        // Usar transacción
        await db.ejecutarTransaccion(async (connection) => {
            // Actualizar créditos del usuario
            await connection.execute(
                'UPDATE usuarios SET creditos = creditos - ? WHERE id = ?',
                [cantidad, id]
            );
            
            // Registrar transacción
            await connection.execute(
                `INSERT INTO transacciones_creditos 
                (usuario_id, tipo, cantidad, descripcion, admin_id)
                VALUES (?, 'ajuste', ?, ?, ?)`,
                [id, -cantidad, descripcion, adminId]
            );
        });
        
        // Obtener créditos actualizados
        const usuarioActualizado = await db.obtenerUno(
            'SELECT creditos FROM usuarios WHERE id = ?',
            [id]
        );
        
        res.json({
            mensaje: 'Créditos removidos exitosamente',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                creditos_anteriores: usuario.creditos,
                creditos_removidos: cantidad,
                creditos_actuales: usuarioActualizado.creditos
            }
        });
        
    } catch (error) {
        console.error('Error en quitarCreditos:', error);
        res.status(500).json({
            error: 'Error al quitar créditos',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para activar/desactivar un usuario
// PATCH /api/admin/users/:id/status
// Body: { activo: true/false }
// ------------------------------------------------------------
const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        
        if (typeof activo !== 'boolean') {
            return res.status(400).json({
                error: 'Estado inválido',
                mensaje: 'El campo "activo" debe ser true o false'
            });
        }
        
        // Verificar que el usuario existe
        const usuario = await db.obtenerUno(
            'SELECT id, nombre, email, activo FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // No permitir desactivarse a sí mismo
        if (parseInt(id) === req.usuario.id && !activo) {
            return res.status(400).json({
                error: 'Operación no permitida',
                mensaje: 'No puedes desactivar tu propia cuenta'
            });
        }
        
        // Actualizar estado
        await db.actualizar(
            'usuarios',
            { activo: activo ? 1 : 0 },
            'id = ?',
            [id]
        );
        
        res.json({
            mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                activo: activo
            }
        });
        
    } catch (error) {
        console.error('Error en cambiarEstadoUsuario:', error);
        res.status(500).json({
            error: 'Error al cambiar estado del usuario',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para obtener estadísticas generales del sistema
// GET /api/admin/stats
// ------------------------------------------------------------
const obtenerEstadisticas = async (req, res) => {
    try {
        // Estadísticas de usuarios
        const statsUsuarios = await db.obtenerUno(
            `SELECT 
                COUNT(*) as total_usuarios,
                SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as usuarios_activos,
                SUM(CASE WHEN es_admin = 1 THEN 1 ELSE 0 END) as total_admins,
                SUM(creditos) as total_creditos_sistema
            FROM usuarios`
        );
        
        // Estadísticas de lotes
        const statsLotes = await db.obtenerUno(
            `SELECT 
                COUNT(*) as total_lotes,
                SUM(cantidad_tablas) as total_tablas_generadas,
                SUM(CASE WHEN tipo_pdf = 'prueba' THEN 1 ELSE 0 END) as lotes_prueba,
                SUM(CASE WHEN tipo_pdf = 'final' THEN 1 ELSE 0 END) as lotes_finales,
                SUM(costo_creditos) as total_creditos_gastados
            FROM lotes`
        );
        
        // Estadísticas de plantillas
        const statsPlantillas = await db.obtenerUno(
            `SELECT COUNT(*) as total_plantillas FROM plantillas`
        );
        
        // Estadísticas de transacciones
        const statsTransacciones = await db.obtenerUno(
            `SELECT 
                COUNT(*) as total_transacciones,
                SUM(CASE WHEN tipo = 'regalo' THEN cantidad ELSE 0 END) as creditos_regalados,
                SUM(CASE WHEN tipo = 'uso' THEN ABS(cantidad) ELSE 0 END) as creditos_usados
            FROM transacciones_creditos`
        );
        
        // Últimos lotes generados
        const ultimosLotes = await db.ejecutarConsulta(
            `SELECT 
                l.id,
                l.cantidad_tablas,
                l.tipo_pdf,
                l.creado_en,
                u.nombre as usuario_nombre,
                u.email as usuario_email,
                p.nombre as plantilla_nombre
            FROM lotes l
            JOIN usuarios u ON l.usuario_id = u.id
            JOIN plantillas p ON l.plantilla_id = p.id
            ORDER BY l.creado_en DESC
            LIMIT 10`
        );
        
        res.json({
            usuarios: statsUsuarios,
            lotes: statsLotes,
            plantillas: statsPlantillas,
            transacciones: statsTransacciones,
            ultimos_lotes: ultimosLotes
        });
        
    } catch (error) {
        console.error('Error en obtenerEstadisticas:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para listar todos los usuarios (con paginación)
// GET /api/admin/users?pagina=1&limite=20
// ------------------------------------------------------------
const listarUsuarios = async (req, res) => {
    try {
        const { pagina = 1, limite = 20 } = req.query;
        const offset = (pagina - 1) * limite;
        
        // Obtener usuarios
        const usuarios = await db.ejecutarConsulta(
            `SELECT 
                id,
                nombre,
                email,
                creditos,
                es_admin,
                activo,
                creado_en
            FROM usuarios
            ORDER BY creado_en DESC
            LIMIT ? OFFSET ?`,
            [parseInt(limite), offset]
        );
        
        // Contar total
        const [{ total }] = await db.ejecutarConsulta(
            'SELECT COUNT(*) as total FROM usuarios'
        );
        
        res.json({
            usuarios,
            paginacion: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        });
        
    } catch (error) {
        console.error('Error en listarUsuarios:', error);
        res.status(500).json({
            error: 'Error al listar usuarios',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Exportar funciones del controlador
// ------------------------------------------------------------
module.exports = {
    buscarUsuarios,
    obtenerUsuario,
    agregarCreditos,
    quitarCreditos,
    cambiarEstadoUsuario,
    obtenerEstadisticas,
    listarUsuarios
};

