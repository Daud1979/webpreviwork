const sql = require('mssql');

const sqlConfig = {
  user: process.env.USUARIO,
  password: process.env.PASS,
  database: process.env.DATABASE,
  server: process.env.CONEX,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    return await sql.connect(sqlConfig);
  } catch (error) {
    console.error('Error al conectar con SQL Server:', error);
  }
}

module.exports = connectDB;
