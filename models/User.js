const connectDB = require('../config/db');
const sql = require('mssql');
const crypto = require('crypto');
class User {
static async findByUsername(idEmpresa) {
    const pool = await connectDB();
    try{
        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`SELECT * FROM ClienteEmpresa WHERE idEmpresa=@idEmpresa`);
        return (result.recordset[0])
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
    //buscar gestion
static async findGestion() {
    const pool = await connectDB();
    try{
        const result = await pool.request()          
           .query(`select * from ListaDocumento l inner join CategoriaDocumento c on l.idDocumento=c.idDocumento where c.idDocumento=1`);
        return (result.recordset)
    }
    catch (error)
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
    //fin gestion 
    //buscar construccion
static async findGestion() {
    const pool = await connectDB();
    try{
       const result = await pool.request()          
            .query(`select * from ListaDocumento l inner join CategoriaDocumento c on l.idDocumento=c.idDocumento where c.idDocumento=1`);
        return (result.recordset)
    }
    catch (error)
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
    //fin contruccion
static async validatePassword(username,pass,email) {
    const pool = await connectDB();
    try{
        const result = await pool.request()
          .input('username', sql.VarChar, username)
          .input('pass', sql.VarChar, pass)
          .input('email', sql.VarChar, email)
          .query(`SELECT * FROM EmpresaPass WHERE email=@email and usuario = @username and pass =HASHBYTES('SHA2_256', @pass)`);
        return (result.recordset)
    }
    catch (error)
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
 
static async validatePassword(username,pass,email) {
    const pool = await connectDB();
    try{
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('pass', sql.VarChar, pass)
            .input('email', sql.VarChar, email)
            .query(`SELECT * FROM EmpresaPass WHERE email=@email and usuario = @username and pass =HASHBYTES('SHA2_256', @pass)`);
         
        return (result.recordset)
    }
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
static async modifyEmpresa(direccionEmpresa,encargadoEmpresa,email,telefono,idEmpresa){
    const pool=await await connectDB();
    try 
    {
        const result =await pool.request()
        .input('direccionEmpresa', sql.VarChar, direccionEmpresa)
        .input('encargadoEmpresa', sql.VarChar, encargadoEmpresa)
        .input('email', sql.VarChar, email)
        .input('telefono', sql.VarChar, telefono)
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`UPDATE ClienteEmpresa SET direccionEmpresa=@direccionEmpresa, email=@email, encargadoEmpresa=@encargadoEmpresa, telefono=@telefono WHERE idEmpresa=@idEmpresa`);
          
        return (result.rowsAffected[0])
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
static async listCentroEmpresa(idEmpresa){
    const pool=await await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`select * from CentrosEmpresa where idEmpresa=@idEmpresa`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
}//fin de la clase

module.exports = User;
