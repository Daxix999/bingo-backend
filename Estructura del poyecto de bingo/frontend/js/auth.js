// ============================================================
// MÓDULO DE AUTENTICACIÓN
// Archivo: frontend/js/auth.js
// Descripción: Maneja registro, login y verificación de sesión
// ============================================================

// ------------------------------------------------------------
// Esperar a que el DOM esté cargado
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    inicializarAuth();
});

// ------------------------------------------------------------
// Función para inicializar el módulo de autenticación
// Configura los event listeners y verifica sesión existente
// ------------------------------------------------------------
function inicializarAuth() {
    // Verificar si ya hay una sesión activa
    if (utils.estaAutenticado()) {
        // Si ya está autenticado, redirigir al dashboard
        utils.redirigir('dashboard.html');
        return;
    }
    
    // Configurar event listeners para mostrar/ocultar formularios
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }
    
    // Configurar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await realizarLogin();
        });
    }
    
    // Configurar formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await realizarRegistro();
        });
    }
}

// ------------------------------------------------------------
// Función para realizar el login
// Obtiene email y password del formulario y hace petición al backend
// ------------------------------------------------------------
async function realizarLogin() {
    try {
        const email = document.getElementById('log_email').value.trim();
        const password = document.getElementById('log_pass').value;
        
        // Validar campos
        if (!email || !password) {
            utils.mostrarError('loginError', 'Por favor completa todos los campos');
            return;
        }
        
        if (!utils.validarEmail(email)) {
            utils.mostrarError('loginError', 'El formato del email no es válido');
            return;
        }
        
        // Deshabilitar botón mientras se procesa
        const btnLogin = document.getElementById('btnLogin');
        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando sesión...';
        
        // Hacer petición al backend
        const respuesta = await utils.apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Guardar token y datos del usuario
        if (respuesta.token) {
            localStorage.setItem('token', respuesta.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
            
            // Mostrar mensaje de éxito
            utils.mostrarExito('¡Bienvenido! Redirigiendo...');
            
            // Redirigir al dashboard después de un breve delay
            setTimeout(() => {
                utils.redirigir('dashboard.html');
            }, 1000);
        } else {
            throw new Error('No se recibió token del servidor');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        utils.mostrarError('loginError', error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        
        // Rehabilitar botón
        const btnLogin = document.getElementById('btnLogin');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar Sesión';
    }
}

// ------------------------------------------------------------
// Función para realizar el registro
// Obtiene nombre, email y password del formulario y hace petición al backend
// ------------------------------------------------------------
async function realizarRegistro() {
    try {
        const nombre = document.getElementById('reg_nombre').value.trim();
        const email = document.getElementById('reg_email').value.trim();
        const password = document.getElementById('reg_pass').value;
        
        // Validar campos
        if (!nombre || !email || !password) {
            utils.mostrarError('registerError', 'Por favor completa todos los campos');
            return;
        }
        
        if (!utils.validarEmail(email)) {
            utils.mostrarError('registerError', 'El formato del email no es válido');
            return;
        }
        
        if (password.length < 6) {
            utils.mostrarError('registerError', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        // Deshabilitar botón mientras se procesa
        const btnRegister = document.getElementById('btnRegister');
        btnRegister.disabled = true;
        btnRegister.textContent = 'Registrando...';
        
        // Hacer petición al backend
        const respuesta = await utils.apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, password })
        });
        
        // Guardar token y datos del usuario
        if (respuesta.token) {
            localStorage.setItem('token', respuesta.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
            
            // Mostrar mensaje de éxito
            utils.mostrarExito('¡Cuenta creada exitosamente! Redirigiendo...');
            
            // Redirigir al dashboard después de un breve delay
            setTimeout(() => {
                utils.redirigir('dashboard.html');
            }, 1500);
        } else {
            throw new Error('No se recibió token del servidor');
        }
        
    } catch (error) {
        console.error('Error en registro:', error);
        utils.mostrarError('registerError', error.message || 'Error al crear la cuenta. Intenta nuevamente.');
        
        // Rehabilitar botón
        const btnRegister = document.getElementById('btnRegister');
        btnRegister.disabled = false;
        btnRegister.textContent = 'Registrarse';
    }
}

