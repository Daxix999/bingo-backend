// ============================================================
// CONTROLADOR DE CRÉDITOS
// Archivo: backend/controllers/creditController.js
// Descripción: Maneja consultas y transacciones de créditos
// ============================================================

const db = require('../config/database');

// ------------------------------------------------------------
// Método para obtener el saldo de créditos del usuario
// GET /api/credits/balance
// ------------------------------------------------------------
const obtenerSaldo = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        
        // Consultar créditos actuales del usuario
        const usuario = await db.obtenerUno(
            'SELECT creditos FROM usuarios WHERE id = ?',
            [usuarioId]
        );
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        res.json({
            creditos: usuario.creditos
        });
        
    } catch (error) {
        console.error('Error en obtenerSaldo:', error);
        res.status(500).json({
            error: 'Error al obtener saldo de créditos'
        });
    }
};

// ------------------------------------------------------------
// Método para obtener historial de transacciones
// GET /api/credits/history
// ------------------------------------------------------------
const obtenerHistorial = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { limite = 50, pagina = 1 } = req.query;
        
        const offset = (pagina - 1) * limite;
        
        // Consultar transacciones del usuario
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
            LIMIT ? OFFSET ?`,
            [usuarioId, parseInt(limite), offset]
        );
        
        // Contar total de transacciones
        const [{ total }] = await db.ejecutarConsulta(
            'SELECT COUNT(*) as total FROM transacciones_creditos WHERE usuario_id = ?',
            [usuarioId]
        );
        
        res.json({
            transacciones,
            paginacion: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total,
                totalPaginas: Math.ceil(total / limite)
            }
        });
        
    } catch (error) {
        console.error('Error en obtenerHistorial:', error);
        res.status(500).json({
            error: 'Error al obtener historial'
        });
    }
};

// ------------------------------------------------------------
// Exportar funciones del controlador
// ------------------------------------------------------------
module.exports = {
    obtenerSaldo,
    obtenerHistorial
};