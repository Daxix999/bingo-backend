// ============================================================
// CONFIGURACIÓN DE BASE DE DATOS MySQL
// Archivo: backend/config/database.js
// Descripción: Maneja la conexión a la base de datos MySQL
//              usando pool de conexiones para mejor rendimiento
// ============================================================

// ------------------------------------------------------------
// Importar librería MySQL2 con soporte para Promises
// ------------------------------------------------------------
const mysql = require('mysql2/promise');
require('dotenv').config();

// ============================================================
// CONFIGURACIÓN DE LA CONEXIÓN
// ============================================================

// ------------------------------------------------------------
// Objeto de configuración del pool de conexiones
// Pool = grupo de conexiones reutilizables para mejor performance
// ------------------------------------------------------------
const configPool = {
    // Host de la base de datos (localhost en desarrollo, URL en producción)
    host: process.env.DB_HOST || 'localhost',
    
    // Puerto de MySQL (3306 es el puerto por defecto)
    port: process.env.DB_PORT || 3306,
    
    // Usuario de la base de datos
    user: process.env.DB_USER || 'root',
    
    // Contraseña del usuario
    password: process.env.DB_PASSWORD || '',
    
    // Nombre de la base de datos
    database: process.env.DB_NAME || 'bingo_generator',
    
    // Número máximo de conexiones simultáneas
    connectionLimit: 10,
    
    // Tiempo máximo de espera para obtener una conexión (ms)
    waitForConnections: true,
    
    // Máximo de peticiones en cola esperando una conexión
    queueLimit: 0,
    
    // Reconectar automáticamente si la conexión se pierde
    enableKeepAlive: true,
    
    // Intervalo de keep-alive (ms)
    keepAliveInitialDelay: 0,
    
    // Timezone de la base de datos
    timezone: '+00:00', // UTC
    
    // Soporte para múltiples consultas en una sola llamada
    multipleStatements: false,
    
    // Configuración de caracteres UTF-8
    charset: 'utf8mb4'
};

// ------------------------------------------------------------
// Crear el pool de conexiones
// ------------------------------------------------------------
let pool;

try {
    pool = mysql.createPool(configPool);
    console.log('✅ Pool de conexiones MySQL creado correctamente');
} catch (error) {
    console.error('❌ Error al crear pool de conexiones:', error);
    throw error;
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// ------------------------------------------------------------
// Función para verificar la conexión a la base de datos
// Retorna: Promise<boolean>
// ------------------------------------------------------------
const verificarConexion = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Conexión a MySQL verificada exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error al verificar conexión a MySQL:', error.message);
        return false;
    }
};

// ------------------------------------------------------------
// Función para ejecutar una consulta simple
// Parámetros:
//   - sql: String con la consulta SQL
//   - params: Array con los parámetros (opcional)
// Retorna: Promise<Array> con los resultados
// ------------------------------------------------------------
const ejecutarConsulta = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Error en consulta SQL:', error.message);
        console.error('   SQL:', sql);
        console.error('   Params:', params);
        throw error;
    }
};

// ------------------------------------------------------------
// Función para ejecutar una transacción
// Parámetros:
//   - callback: Función async que recibe la conexión
// Retorna: Promise con el resultado de la transacción
// ------------------------------------------------------------
const ejecutarTransaccion = async (callback) => {
    const connection = await pool.getConnection();
    
    try {
        // Iniciar transacción
        await connection.beginTransaction();
        
        // Ejecutar el callback con la conexión
        const resultado = await callback(connection);
        
        // Confirmar transacción
        await connection.commit();
        
        return resultado;
    } catch (error) {
        // Revertir transacción en caso de error
        await connection.rollback();
        console.error('❌ Error en transacción:', error);
        throw error;
    } finally {
        // Liberar la conexión al pool
        connection.release();
    }
};

// ------------------------------------------------------------
// Función para obtener un solo registro
// Parámetros:
//   - sql: String con la consulta SQL
//   - params: Array con los parámetros (opcional)
// Retorna: Promise<Object|null> con el primer resultado o null
// ------------------------------------------------------------
const obtenerUno = async (sql, params = []) => {
    const resultados = await ejecutarConsulta(sql, params);
    return resultados.length > 0 ? resultados[0] : null;
};

// ------------------------------------------------------------
// Función para insertar un registro y obtener el ID insertado
// Parámetros:
//   - tabla: Nombre de la tabla
//   - datos: Objeto con los datos a insertar {columna: valor}
// Retorna: Promise<number> con el ID del registro insertado
// ------------------------------------------------------------
const insertar = async (tabla, datos) => {
    const columnas = Object.keys(datos);
    const valores = Object.values(datos);
    const placeholders = columnas.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${placeholders})`;
    
    const [resultado] = await pool.execute(sql, valores);
    return resultado.insertId;
};

// ------------------------------------------------------------
// Función para actualizar registros
// Parámetros:
//   - tabla: Nombre de la tabla
//   - datos: Objeto con los datos a actualizar {columna: valor}
//   - condicion: String con la condición WHERE
//   - params: Array con los parámetros de la condición
// Retorna: Promise<number> con el número de filas afectadas
// ------------------------------------------------------------
const actualizar = async (tabla, datos, condicion, params = []) => {
    const sets = Object.keys(datos).map(col => `${col} = ?`).join(', ');
    const valores = [...Object.values(datos), ...params];
    
    const sql = `UPDATE ${tabla} SET ${sets} WHERE ${condicion}`;
    
    const [resultado] = await pool.execute(sql, valores);
    return resultado.affectedRows;
};

// ------------------------------------------------------------
// Función para eliminar registros
// Parámetros:
//   - tabla: Nombre de la tabla
//   - condicion: String con la condición WHERE
//   - params: Array con los parámetros de la condición
// Retorna: Promise<number> con el número de filas eliminadas
// ------------------------------------------------------------
const eliminar = async (tabla, condicion, params = []) => {
    const sql = `DELETE FROM ${tabla} WHERE ${condicion}`;
    
    const [resultado] = await pool.execute(sql, params);
    return resultado.affectedRows;
};

// ------------------------------------------------------------
// Función para cerrar todas las conexiones del pool
// Útil para cuando se cierra la aplicación
// ------------------------------------------------------------
const cerrarPool = async () => {
    try {
        await pool.end();
        console.log('✅ Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('❌ Error al cerrar pool:', error);
    }
};

// ============================================================
// EXPORTAR FUNCIONES Y POOL
// ============================================================
module.exports = {
    // Pool de conexiones (para consultas avanzadas)
    pool,
    
    // Método query directo del pool
    query: (sql, params) => pool.execute(sql, params),
    
    // Funciones auxiliares
    verificarConexion,
    ejecutarConsulta,
    ejecutarTransaccion,
    obtenerUno,
    insertar,
    actualizar,
    eliminar,
    cerrarPool
};

// ============================================================
// EVENTOS DEL POOL
// ============================================================

// ------------------------------------------------------------
// Evento: Nueva conexión creada
// ------------------------------------------------------------
pool.on('connection', (connection) => {
    console.log('🔗 Nueva conexión MySQL creada (ID:', connection.threadId, ')');
});

// ------------------------------------------------------------
// Evento: Conexión adquirida del pool
// ------------------------------------------------------------
pool.on('acquire', (connection) => {
    console.log('📤 Conexión adquirida del pool (ID:', connection.threadId, ')');
});

// ------------------------------------------------------------
// Evento: Conexión liberada al pool
// ------------------------------------------------------------
pool.on('release', (connection) => {
    console.log('📥 Conexión liberada al pool (ID:', connection.threadId, ')');
});

// ------------------------------------------------------------
// Evento: Solicitud en cola esperando conexión
// ------------------------------------------------------------
pool.on('enqueue', () => {
    console.log('⏳ Solicitud en cola esperando conexión disponible');
});