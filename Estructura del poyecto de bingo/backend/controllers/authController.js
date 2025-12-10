// ============================================================
// CONTROLADOR DE AUTENTICACIÓN
// Archivo: backend/controllers/authController.js
// Descripción: Maneja registro, login y logout de usuarios
// ============================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ------------------------------------------------------------
// Método para registrar un nuevo usuario
// POST /api/auth/register
// ------------------------------------------------------------
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        
        // Validar que todos los campos estén presentes
        if (!nombre || !email || !password) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de email inválido'
            });
        }
        
        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Verificar si el email ya existe
        const usuarioExistente = await db.obtenerUno(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (usuarioExistente) {
            return res.status(409).json({
                error: 'Este email ya está registrado'
            });
        }
        
        // Encriptar contraseña con bcrypt (10 rondas)
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Obtener créditos iniciales de la configuración
        const config = await db.obtenerUno(
            'SELECT valor FROM configuracion WHERE clave = ?',
            ['creditos_inicial']
        );
        const creditosIniciales = parseInt(config?.valor || 0);
        
        // Insertar nuevo usuario en la base de datos
        const usuarioId = await db.insertar('usuarios', {
            nombre,
            email,
            password_hash: passwordHash,
            creditos: creditosIniciales,
            es_admin: 0,
            activo: 1
        });
        
        // Generar token JWT para el nuevo usuario
        const token = jwt.sign(
            { id: usuarioId, email, es_admin: false },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
        
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: usuarioId,
                nombre,
                email,
                creditos: creditosIniciales,
                es_admin: false
            },
            token
        });
        
    } catch (error) {
        console.error('Error en registrarUsuario:', error);
        res.status(500).json({
            error: 'Error al registrar usuario',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para iniciar sesión (login)
// POST /api/auth/login
// ------------------------------------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validar que email y password estén presentes
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son obligatorios'
            });
        }
        
        // Buscar usuario por email
        const usuario = await db.obtenerUno(
            'SELECT id, nombre, email, password_hash, creditos, es_admin, activo FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (!usuario) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // Verificar que la cuenta esté activa
        if (!usuario.activo) {
            return res.status(403).json({
                error: 'Tu cuenta está inactiva. Contacta al administrador'
            });
        }
        
        // Comparar contraseña con el hash almacenado
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValida) {
            return res.status(401).json({
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email, 
                es_admin: usuario.es_admin 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
        
        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                creditos: usuario.creditos,
                es_admin: Boolean(usuario.es_admin)
            },
            token
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            mensaje: error.message
        });
    }
};

// ------------------------------------------------------------
// Método para verificar el token actual
// GET /api/auth/verify
// ------------------------------------------------------------
const verificarToken = async (req, res) => {
    try {
        // El usuario ya fue autenticado por el middleware
        const usuarioId = req.usuario.id;
        
        // Obtener datos actualizados del usuario
        const usuario = await db.obtenerUno(
            'SELECT id, nombre, email, creditos, es_admin, activo FROM usuarios WHERE id = ?',
            [usuarioId]
        );
        
        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                error: 'Usuario no válido'
            });
        }
        
        res.json({
            valido: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                creditos: usuario.creditos,
                es_admin: Boolean(usuario.es_admin)
            }
        });
        
    } catch (error) {
        console.error('Error en verificarToken:', error);
        res.status(500).json({
            error: 'Error al verificar token'
        });
    }
};

// ------------------------------------------------------------
// Exportar funciones del controlador
// ------------------------------------------------------------
module.exports = {
    registrarUsuario,
    login,
    verificarToken
};