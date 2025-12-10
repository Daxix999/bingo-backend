// ============================================================
// UTILIDADES GENERALES
// Archivo: frontend/js/utils.js
// Descripción: Funciones auxiliares para toda la aplicación
// ============================================================

// ------------------------------------------------------------
// Configuración de la API
// Cambiar esta URL cuando despliegues en producción
// ------------------------------------------------------------
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : '/api'; // En producción usar ruta relativa

// ------------------------------------------------------------
// Función para hacer peticiones HTTP con autenticación
// Parámetros:
//   - url: Ruta de la API (sin /api)
//   - options: Opciones de fetch (method, body, etc.)
// Retorna: Promise con la respuesta parseada
// ------------------------------------------------------------
async function apiRequest(url, options = {}) {
    try {
        // Obtener token del localStorage
        const token = localStorage.getItem('token');
        
        // Configurar headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Agregar token si existe
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Hacer petición
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers
        });
        
        // Parsear respuesta
        const data = await response.json();
        
        // Si hay error, lanzar excepción
        if (!response.ok) {
            throw new Error(data.mensaje || data.error || 'Error en la petición');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error en apiRequest:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Función para mostrar mensajes de error
// Parámetros:
//   - elementoId: ID del elemento donde mostrar el error
//   - mensaje: Mensaje de error a mostrar
// ------------------------------------------------------------
function mostrarError(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.style.display = 'block';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            elemento.style.display = 'none';
        }, 5000);
    }
}

// ------------------------------------------------------------
// Función para mostrar mensajes de éxito
// Parámetros:
//   - mensaje: Mensaje de éxito a mostrar
// ------------------------------------------------------------
function mostrarExito(mensaje) {
    // Crear elemento de mensaje si no existe
    let mensajeElement = document.getElementById('successMessage');
    if (!mensajeElement) {
        mensajeElement = document.createElement('div');
        mensajeElement.id = 'successMessage';
        mensajeElement.className = 'success-message';
        document.body.insertBefore(mensajeElement, document.body.firstChild);
    }
    
    mensajeElement.textContent = mensaje;
    mensajeElement.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        mensajeElement.style.display = 'none';
    }, 3000);
}

// ------------------------------------------------------------
// Función para verificar si el usuario está autenticado
// Retorna: true si está autenticado, false si no
// ------------------------------------------------------------
function estaAutenticado() {
    return !!localStorage.getItem('token');
}

// ------------------------------------------------------------
// Función para redirigir a otra página
// Parámetros:
//   - pagina: Nombre del archivo HTML (ej: 'dashboard.html')
// ------------------------------------------------------------
function redirigir(pagina) {
    window.location.href = pagina;
}

// ------------------------------------------------------------
// Función para cerrar sesión
// Limpia el localStorage y redirige al inicio
// ------------------------------------------------------------
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    redirigir('index.html');
}

// ------------------------------------------------------------
// Función para formatear fecha
// Parámetros:
//   - fecha: String o Date object
// Retorna: String formateado
// ------------------------------------------------------------
function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ------------------------------------------------------------
// Función para formatear número con separadores de miles
// Parámetros:
//   - numero: Número a formatear
// Retorna: String formateado
// ------------------------------------------------------------
function formatearNumero(numero) {
    return new Intl.NumberFormat('es-ES').format(numero);
}

// ------------------------------------------------------------
// Función para validar email
// Parámetros:
//   - email: String con el email a validar
// Retorna: true si es válido, false si no
// ------------------------------------------------------------
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ------------------------------------------------------------
// Función para mostrar/ocultar loading
// Parámetros:
//   - mostrar: true para mostrar, false para ocultar
// ------------------------------------------------------------
function mostrarLoading(mostrar = true) {
    const elementos = document.querySelectorAll('.loading-overlay');
    elementos.forEach(el => {
        el.style.display = mostrar ? 'block' : 'none';
    });
}

// ------------------------------------------------------------
// Exportar funciones para uso global
// ------------------------------------------------------------
window.utils = {
    API_BASE,
    apiRequest,
    mostrarError,
    mostrarExito,
    estaAutenticado,
    redirigir,
    cerrarSesion,
    formatearFecha,
    formatearNumero,
    validarEmail,
    mostrarLoading
};

