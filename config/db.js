// const sql = require('mssql');

// const sqlConfig = {
//   user: process.env.USUARIO,
//   password: process.env.PASS,
//   database: process.env.DATABASE,
//   server: process.env.CONEX,
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
// };

// async function connectDB() {
//   try {
//     return await sql.connect(sqlConfig);
//   } catch (error) {
//     console.error('Error al conectar con SQL Server:', error);
//   }
// }

// module.exports = connectDB;
const sql = require('mssql');

const sqlConfig = {
  user: process.env.USUARIO,
  password: process.env.PASS,
  database: process.env.DATABASE,
  server: process.env.CONEX,
  port: 1433, // asegúrate que es el puerto correcto (por defecto 1433)
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool;

async function connectDB() {
  if (pool) return pool; // reutiliza el pool si ya está creado

  try {
    pool = await sql.connect(sqlConfig);
    console.log('✅ Conexión a SQL Server establecida (pool)');
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar con SQL Server:', error);
    throw error;
  }
}

module.exports = connectDB;
