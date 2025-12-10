// ============================================================
// SERVICIO DE GENERACIÓN DE NÚMEROS SIN REPETIR
// Archivo: backend/services/numberGenerator.js
// Descripción: Genera números aleatorios únicos para las tablas
// ============================================================

const db = require('../config/database');

// ------------------------------------------------------------
// Función para generar números aleatorios sin repetir
// Parámetros:
//   - cantidad: Cuántos números generar
//   - min: Número mínimo del rango
//   - max: Número máximo del rango
//   - numerosExcluidos: Set de números que no deben usarse
// Retorna: Array de números únicos
// ------------------------------------------------------------
const generarNumerosUnicos = (cantidad, min, max, numerosExcluidos = new Set()) => {
    // Crear pool de números disponibles
    const poolDisponible = [];
    for (let i = min; i <= max; i++) {
        if (!numerosExcluidos.has(i)) {
            poolDisponible.push(i);
        }
    }
    
    // Verificar que hay suficientes números disponibles
    if (poolDisponible.length < cantidad) {
        throw new Error(
            `No hay suficientes números disponibles. ` +
            `Necesitas ${cantidad} pero solo hay ${poolDisponible.length} disponibles.`
        );
    }
    
    // Algoritmo de Fisher-Yates para mezclar el pool
    const resultado = [];
    const poolTemp = [...poolDisponible];
    
    for (let i = 0; i < cantidad; i++) {
        // Seleccionar índice aleatorio
        const indiceAleatorio = Math.floor(Math.random() * poolTemp.length);
        
        // Agregar el número seleccionado al resultado
        resultado.push(poolTemp[indiceAleatorio]);
        
        // Remover el número usado del pool temporal
        poolTemp.splice(indiceAleatorio, 1);
    }
    
    return resultado;
};

// ------------------------------------------------------------
// Función para obtener números ya usados de una plantilla
// Parámetros:
//   - plantillaId: ID de la plantilla
// Retorna: Set con los números ya usados
// ------------------------------------------------------------
const obtenerNumerosUsados = async (plantillaId) => {
    try {
        // Consultar números usados para esta plantilla
        const numerosUsados = await db.ejecutarConsulta(
            'SELECT DISTINCT numero FROM numeros_usados WHERE plantilla_id = ?',
            [plantillaId]
        );
        
        // Convertir a Set para búsqueda rápida
        return new Set(numerosUsados.map(row => row.numero));
        
    } catch (error) {
        console.error('Error al obtener números usados:', error);
        throw error;
    }
};

// ------------------------------------------------------------
// Función principal: Generar números para un lote completo
// Parámetros:
//   - plantilla: Objeto con la configuración de la plantilla
//   - cantidadTablas: Cuántas tablas generar
//   - permitirRepeticion: Si true, no consulta números usados
// Retorna: Array de arrays (cada array es una tabla con sus números)
// ------------------------------------------------------------
const generarNumerosParaLote = async (plantilla, cantidadTablas, permitirRepeticion = false) => {
    try {
        // Parsear configuración de la plantilla
        const grid = JSON.parse(plantilla.grid_json);
        
        // Contar celdas activas (donde irán números)
        let celdasActivas = 0;
        for (let fila of grid) {
            for (let celda of fila) {
                if (celda) celdasActivas++;
            }
        }
        
        // Calcular total de números necesarios
        const totalNumerosNecesarios = celdasActivas * cantidadTablas;
        
        // Obtener números ya usados (si no se permite repetición)
        let numerosExcluidos = new Set();
        if (!permitirRepeticion) {
            numerosExcluidos = await obtenerNumerosUsados(plantilla.id);
        }
        
        // Verificar si usa numeración por columna
        let numerosGenerados;
        
        if (plantilla.usa_columnas_especificas && plantilla.rangos_columnas_json) {
            // Generar números respetando rangos por columna
            numerosGenerados = generarNumerosConRangosPorColumna(
                grid,
                cantidadTablas,
                JSON.parse(plantilla.rangos_columnas_json),
                numerosExcluidos
            );
        } else {
            // Generar números con rango global
            numerosGenerados = generarNumerosUnicos(
                totalNumerosNecesarios,
                plantilla.numero_min,
                plantilla.numero_max,
                numerosExcluidos
            );
        }
        
        // Distribuir números en tablas
        const tablas = [];
        let indiceNumero = 0;
        
        for (let t = 0; t < cantidadTablas; t++) {
            const tabla = [];
            
            for (let f = 0; f < grid.length; f++) {
                const fila = [];
                
                for (let c = 0; c < grid[f].length; c++) {
                    if (grid[f][c]) {
                        // Celda activa: asignar número
                        fila.push({
                            numero: numerosGenerados[indiceNumero++],
                            fila: f,
                            columna: c
                        });
                    } else {
                        // Celda inactiva
                        fila.push(null);
                    }
                }
                
                tabla.push(fila);
            }
            
            tablas.push(tabla);
        }
        
        return tablas;
        
    } catch (error) {
        console.error('Error en generarNumerosParaLote:', error);
        throw error;
    }
};

// ------------------------------------------------------------
// Función para generar números con rangos por columna
// Usado en bingo americano (B: 1-15, I: 16-30, etc.)
// ------------------------------------------------------------
const generarNumerosConRangosPorColumna = (grid, cantidadTablas, rangosColumnas, numerosExcluidos) => {
    const resultado = [];
    const filas = grid.length;
    const columnas = grid[0].length;
    
    for (let t = 0; t < cantidadTablas; t++) {
        for (let c = 0; c < columnas; c++) {
            // Contar celdas activas en esta columna
            let celdasEnColumna = 0;
            for (let f = 0; f < filas; f++) {
                if (grid[f][c]) celdasEnColumna++;
            }
            
            // Obtener rango para esta columna
            const [min, max] = rangosColumnas[c] || [1, 90];
            
            // Generar números únicos para esta columna
            const numerosColumna = generarNumerosUnicos(
                celdasEnColumna,
                min,
                max,
                numerosExcluidos
            );
            
            // Agregar al resultado
            resultado.push(...numerosColumna);
        }
    }
    
    return resultado;
};

// ------------------------------------------------------------
// Función para guardar números usados en la base de datos
// ------------------------------------------------------------
const guardarNumerosUsados = async (loteId, plantillaId, tablas) => {
    try {
        const registros = [];
        
        for (let t = 0; t < tablas.length; t++) {
            const tabla = tablas[t];
            
            for (let f = 0; f < tabla.length; f++) {
                for (let c = 0; c < tabla[f].length; c++) {
                    const celda = tabla[f][c];
                    
                    if (celda && celda.numero) {
                        registros.push([
                            loteId,
                            plantillaId,
                            t,
                            f,
                            c,
                            celda.numero
                        ]);
                    }
                }
            }
        }
        
        // Insertar todos los registros en batch
        if (registros.length > 0) {
            const sql = `
                INSERT INTO numeros_usados 
                (lote_id, plantilla_id, tabla_index, fila, columna, numero)
                VALUES ?
            `;
            
            await db.pool.query(sql, [registros]);
        }
        
    } catch (error) {
        console.error('Error al guardar números usados:', error);
        throw error;
    }
};

// ------------------------------------------------------------
// Exportar funciones
// ------------------------------------------------------------
module.exports = {
    generarNumerosUnicos,
    obtenerNumerosUsados,
    generarNumerosParaLote,
    guardarNumerosUsados
};