// ============================================================
// DASHBOARD - Página Principal del Usuario
// Archivo: frontend/js/dashboard.js
// Descripción: Maneja la lógica del dashboard del usuario
// ============================================================

// ------------------------------------------------------------
// Inicializar dashboard cuando se carga la página
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!utils.estaAutenticado()) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar datos del usuario
    await cargarDatosUsuario();
    
    // Cargar estadísticas
    await cargarEstadisticas();

    // Configurar botón de logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            utils.cerrarSesion();
        });
    }
});

// ------------------------------------------------------------
// Función para cargar datos del usuario
// Muestra nombre, créditos y configura la interfaz
// ------------------------------------------------------------
async function cargarDatosUsuario() {
    try {
        // Obtener usuario del localStorage
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            
            // Mostrar nombre del usuario
            const userNameElements = document.querySelectorAll('#userName, #dashboardUserName');
            userNameElements.forEach(el => {
                if (el) el.textContent = usuario.nombre;
            });

            // Mostrar créditos
            const creditsElements = document.querySelectorAll('#userCredits, #creditsAmount');
            creditsElements.forEach(el => {
                if (el) el.textContent = usuario.creditos || 0;
            });

            // Mostrar panel admin si es administrador
            if (usuario.es_admin) {
                const adminCard = document.getElementById('adminCard');
                if (adminCard) adminCard.style.display = 'block';
            }

            // Actualizar créditos desde el servidor
            try {
                const saldo = await utils.apiRequest('/credits/balance');
                if (saldo.creditos !== undefined) {
                    creditsElements.forEach(el => {
                        if (el) el.textContent = saldo.creditos;
                    });
                    // Actualizar en localStorage
                    usuario.creditos = saldo.creditos;
                    localStorage.setItem('usuario', JSON.stringify(usuario));
                }
            } catch (error) {
                console.warn('No se pudo actualizar saldo:', error);
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        utils.mostrarError('Error al cargar datos del usuario');
    }
}

// ------------------------------------------------------------
// Función para cargar estadísticas del usuario
// Muestra total de lotes y tablas generadas
// ------------------------------------------------------------
async function cargarEstadisticas() {
    try {
        const historial = await utils.apiRequest('/lots');
        
        if (historial.lotes) {
            const totalLotes = historial.lotes.length;
            const totalTablas = historial.lotes.reduce((sum, lote) => {
                return sum + (lote.cantidad_tablas || 0);
            }, 0);

            const totalLotesEl = document.getElementById('totalLotes');
            const totalTablasEl = document.getElementById('totalTablas');
            
            if (totalLotesEl) totalLotesEl.textContent = totalLotes;
            if (totalTablasEl) totalTablasEl.textContent = totalTablas;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // No mostrar error, solo dejar en 0
    }
}

