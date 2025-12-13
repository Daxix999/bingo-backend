// ============================================================
// UTILIDADES GENERALES - FRONTEND
// Archivo: frontend/js/utils.js
// Descripción: Funciones auxiliares y configuración global
// ============================================================

// ------------------------------------------------------------
// CONFIGURACIÓN DE LA API
// ------------------------------------------------------------
// URL base del backend
// En desarrollo: http://localhost:5000
// En producción: URL de Render (ej: https://tu-backend.onrender.com)
// Se puede configurar también desde una variable de entorno en Netlify
const API_BASE = window.API_BASE_URL || 'http://localhost:5000/api';

// ------------------------------------------------------------
// Función para obtener el token de autenticación del localStorage
// Retorna: String con el token o null si no existe
// ------------------------------------------------------------
const obtenerToken = () => {
    return localStorage.getItem('token');
};

// ------------------------------------------------------------
// Función para guardar el token en localStorage
// Parámetros:
//   - token: String con el token JWT
// ------------------------------------------------------------
const guardarToken = (token) => {
    localStorage.setItem('token', token);
};

// ------------------------------------------------------------
// Función para eliminar el token (logout)
// ------------------------------------------------------------
const eliminarToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

// ------------------------------------------------------------
// Función para obtener los datos del usuario guardados
// Retorna: Object con los datos del usuario o null
// ------------------------------------------------------------
const obtenerUsuario = () => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        try {
            return JSON.parse(usuarioStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};

// ------------------------------------------------------------
// Función para guardar los datos del usuario
// Parámetros:
//   - usuario: Object con los datos del usuario
// ------------------------------------------------------------
const guardarUsuario = (usuario) => {
    localStorage.setItem('usuario', JSON.stringify(usuario));
};

// ------------------------------------------------------------
// Función para verificar si el usuario está autenticado
// Retorna: Boolean
// ------------------------------------------------------------
const estaAutenticado = () => {
    return obtenerToken() !== null;
};

// ------------------------------------------------------------
// Función para verificar si el usuario es administrador
// Retorna: Boolean
// ------------------------------------------------------------
const esAdmin = () => {
    const usuario = obtenerUsuario();
    return usuario && usuario.es_admin === 1;
};

// ------------------------------------------------------------
// Función para redirigir a una página
// Parámetros:
//   - url: String con la URL a la que redirigir
// ------------------------------------------------------------
const redirigir = (url) => {
    window.location.href = url;
};

// ------------------------------------------------------------
// Función para hacer peticiones HTTP a la API
// Parámetros:
//   - endpoint: String con el endpoint (ej: '/auth/login')
//   - opciones: Object con opciones de fetch (method, body, etc.)
// Retorna: Promise con la respuesta parseada
// ------------------------------------------------------------
const apiRequest = async (endpoint, opciones = {}) => {
    // Construir URL completa
    const url = `${API_BASE}${endpoint}`;
    
    // Configuración por defecto
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...opciones
    };
    
    // Agregar token de autenticación si existe
    const token = obtenerToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Si hay body y es un objeto, convertirlo a JSON
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }
    
    try {
        const respuesta = await fetch(url, config);
        
        // Si la respuesta no es exitosa, lanzar error
        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({ mensaje: 'Error desconocido' }));
            throw new Error(error.mensaje || `Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        // Parsear y retornar la respuesta
        const datos = await respuesta.json();
        return datos;
        
    } catch (error) {
        console.error('Error en petición API:', error);
        throw error;
    }
};

// ------------------------------------------------------------
// Función para mostrar mensajes de error al usuario
// Parámetros:
//   - mensaje: String con el mensaje de error
// ------------------------------------------------------------
const mostrarError = (mensaje) => {
    // Intentar usar alert por defecto
    alert(`❌ Error: ${mensaje}`);
    
    // Si hay un elemento para mostrar errores, usarlo
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
};

// ------------------------------------------------------------
// Función para mostrar mensajes de éxito al usuario
// Parámetros:
//   - mensaje: String con el mensaje de éxito
// ------------------------------------------------------------
const mostrarExito = (mensaje) => {
    // Intentar usar alert por defecto
    alert(`✅ ${mensaje}`);
    
    // Si hay un elemento para mostrar mensajes, usarlo
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = mensaje;
        successElement.style.display = 'block';
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
};

// ------------------------------------------------------------
// Función para formatear fechas
// Parámetros:
//   - fecha: String o Date object
//   - formato: String con el formato deseado (opcional)
// Retorna: String con la fecha formateada
// ------------------------------------------------------------
const formatearFecha = (fecha, formato = 'dd/mm/yyyy') => {
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    
    if (formato === 'dd/mm/yyyy') {
        return `${dia}/${mes}/${año}`;
    } else if (formato === 'dd/mm/yyyy hh:mm') {
        return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    }
    
    return date.toLocaleDateString();
};

// ------------------------------------------------------------
// Función para validar email
// Parámetros:
//   - email: String con el email a validar
// Retorna: Boolean
// ------------------------------------------------------------
const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// ------------------------------------------------------------
// Función para formatear números con separadores de miles
// Parámetros:
//   - numero: Number
// Retorna: String formateado
// ------------------------------------------------------------
const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-ES').format(numero);
};

// ------------------------------------------------------------
// Exportar todas las funciones y constantes
// ------------------------------------------------------------
const utils = {
    // Configuración
    API_BASE,
    
    // Autenticación
    obtenerToken,
    guardarToken,
    eliminarToken,
    obtenerUsuario,
    guardarUsuario,
    estaAutenticado,
    esAdmin,
    
    // Navegación
    redirigir,
    
    // API
    apiRequest,
    
    // UI
    mostrarError,
    mostrarExito,
    
    // Utilidades
    formatearFecha,
    validarEmail,
    formatearNumero
};

// Hacer disponible globalmente
window.utils = utils;

// Exportar para módulos (si se usa import/export)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}
