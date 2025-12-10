// ============================================================
// CONTROLADOR DE USUARIOS
// Archivo: backend/controllers/userController.js
// Descripción: Maneja la gestión del perfil del usuario
// ============================================================

const db = require('../config/database');
const bcrypt = require('bcrypt');

// ------------------------------------------------------------
// Método para obtener el perfil del usuario actual
// GET /api/users/profile
// ------------------------------------------------------------
const obtenerPerfil = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        
        // Obtener datos del usuario
        const usuario = await db.obtenerUno(
            `SELECT 
                id,
                nombre,
                email,
                creditos,
                es_admin,
                creado_en
            FROM usuarios
            WHERE id = ?`,
            [usuarioId]
        );
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        res.json({
            usuario: {
                ...usuario,
                es_admin: Boolean(usuario.es_admin)
            }
        });
        
    } catch (error) {
        console.error('Error en obtenerPerfil:', error);
        res.status(500).json({
            error: 'Error al obtener perfil',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para actualizar el perfil del usuario
// PUT /api/users/profile
// Body: { nombre?, email?, password? }
// ------------------------------------------------------------
const actualizarPerfil = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { nombre, email, password } = req.body;
        
        // Preparar objeto de actualización
        const datosActualizar = {};
        
        if (nombre !== undefined) {
            if (!nombre.trim()) {
                return res.status(400).json({
                    error: 'Nombre inválido',
                    mensaje: 'El nombre no puede estar vacío'
                });
            }
            datosActualizar.nombre = nombre.trim();
        }
        
        if (email !== undefined) {
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Email inválido',
                    mensaje: 'El formato del email no es válido'
                });
            }
            
            // Verificar que el email no esté en uso por otro usuario
            const emailExistente = await db.obtenerUno(
                'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                [email, usuarioId]
            );
            
            if (emailExistente) {
                return res.status(409).json({
                    error: 'Email en uso',
                    mensaje: 'Este email ya está registrado por otro usuario'
                });
            }
            
            datosActualizar.email = email.trim();
        }
        
        if (password !== undefined) {
            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Contraseña inválida',
                    mensaje: 'La contraseña debe tener al menos 6 caracteres'
                });
            }
            
            // Encriptar nueva contraseña
            const passwordHash = await bcrypt.hash(password, 10);
            datosActualizar.password_hash = passwordHash;
        }
        
        // Si no hay nada que actualizar
        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                error: 'Sin cambios',
                mensaje: 'No se proporcionaron datos para actualizar'
            });
        }
        
        // Actualizar usuario
        await db.actualizar(
            'usuarios',
            datosActualizar,
            'id = ?',
            [usuarioId]
        );
        
        // Obtener usuario actualizado
        const usuarioActualizado = await db.obtenerUno(
            `SELECT 
                id,
                nombre,
                email,
                creditos,
                es_admin,
                creado_en
            FROM usuarios
            WHERE id = ?`,
            [usuarioId]
        );
        
        res.json({
            mensaje: 'Perfil actualizado exitosamente',
            usuario: {
                ...usuarioActualizado,
                es_admin: Boolean(usuarioActualizado.es_admin)
            }
        });
        
    } catch (error) {
        console.error('Error en actualizarPerfil:', error);
        res.status(500).json({
            error: 'Error al actualizar perfil',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Exportar funciones del controlador
// ------------------------------------------------------------
module.exports = {
    obtenerPerfil,
    actualizarPerfil
};

