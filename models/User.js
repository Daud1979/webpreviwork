const connectDB = require('../config/db');
const sql = require('mssql');
const crypto = require('crypto');
class User {
static async findByUsername(idEmpresa) {
    const pool = await connectDB();
    try{
        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`SELECT razonSocial,grupoEmpresarial,CIF,CNAE,descripcionCNAE,direccionEmpresa,encargadoEmpresa,email,telefono,ciudad,codigopostal,nCentro=(select COUNT(*) from CentrosEmpresa where idEmpresa=@idEmpresa),ntrabajadorEmpresa=(select CONVERT(varchar, count(*)) from TrabajadorEmpresa where idEmpresa=@idEmpresa)+' de un total de: '+convert(varchar,ntrabajadorEmpresa),provincia,actividad FROM ClienteEmpresa WHERE idEmpresa=@idEmpresa`);
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
        .query(`select idCentro,nombreCentro,encargadoCentro,ciudad,codigopostal,direccionCentro,telefonoCentro,emailCentro,ntrabajadorCentro,registrados=(select COUNT(*) from TrabajadorEmpresa where idCentro=c.idCentro and idEmpresa=@idEmpresa) from CentrosEmpresa c where idEmpresa=@idEmpresa`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
static async listTodosTrabajadorEmpresa(idEmpresa){
    const pool=await await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`select idTrabajador,idCentro,Centro=(select nombreCentro from CentrosEmpresa where idCentro=t.idCentro),NIF,nombres,apellidos,email,telefono,Estado=case when estado='H' then 'Alta' else 'Baja' end from TrabajadorEmpresa t where idEmpresa=@idEmpresa`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
static async listTodosTrabajadorCentro(idCentro,idEmpresa){
    const pool=await await connectDB();
    try 
    {
        if (idCentro>0)
        {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idCentro', sql.Int, idCentro)
        .query(`select idTrabajador,idCentro,Centro=(select nombreCentro from CentrosEmpresa where idCentro=t.idCentro),NIF,nombres,apellidos,email,telefono,Estado=case when estado='H' then 'Alta' else 'Baja' end from TrabajadorEmpresa t where idEmpresa=@idEmpresa and idCentro=@idCentro`);          
        return (result.recordset)
        }
        else
        {
            const result =await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
           
            .query(`select idTrabajador,idCentro,Centro=(select nombreCentro from CentrosEmpresa where idCentro=t.idCentro),NIF,nombres,apellidos,email,telefono,Estado=case when estado='H' then 'Alta' else 'Baja' end from TrabajadorEmpresa t where idEmpresa=@idEmpresa `);          
            return (result.recordset)
        }
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async modifyCentros(id,nuevoValor,indexColumna,idEmpresa){
    const pool=await await connectDB();
    try 
    {        
        if (indexColumna==1)
        {
            const result =await pool.request()
            .input('nombreCentro', sql.VarChar,nuevoValor)
            .input('idCentro', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE CentrosEmpresa set nombreCentro=@nombreCentro WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==2)
        {
            const result =await pool.request()
            .input('encargadoCentro', sql.VarChar,nuevoValor)
            .input('idCentro', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE CentrosEmpresa set encargadoCentro=@encargadoCentro WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==3)
        {
            const result =await pool.request()
            .input('ciudad', sql.VarChar,nuevoValor)
            .input('idCentro', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE CentrosEmpresa set ciudad=@ciudad WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==4)
        {
            const result =await pool.request()
            .input('codigopostal', sql.VarChar,nuevoValor)
            .input('idCentro', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE CentrosEmpresa set codigopostal=@codigopostal WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==5)
        {
            const result =await pool.request()
            .input('direccionCentro', sql.VarChar,nuevoValor)
            .input('idCentro', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE CentrosEmpresa set direccionCentro=@direccionCentro WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        } 
        else if (indexColumna==6)
            {
                const result =await pool.request()
                .input('telefonoCentro', sql.VarChar,nuevoValor)
                .input('idCentro', sql.Int, id)
                .input('idEmpresa', sql.Int, idEmpresa)
                .query(`UPDATE CentrosEmpresa set telefonoCentro=@telefonoCentro WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
                return (result.rowsAffected[0])
            } 
            else if (indexColumna==7)
                {
                    const result =await pool.request()
                    .input('emailCentro', sql.VarChar,nuevoValor)
                    .input('idCentro', sql.Int, id)
                    .input('idEmpresa', sql.Int, idEmpresa)
                    .query(`UPDATE CentrosEmpresa set emailCentro=@emailCentro WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
                    return (result.rowsAffected[0])
                } 
        
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async modifyPersonal(id,nuevoValor,indexColumna,idEmpresa){
    const pool=await await connectDB();
    try 
    {        
        if (indexColumna==1)
        {
            const result =await pool.request()
            .input('NIF', sql.VarChar,nuevoValor)
            .input('idTrabajador', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE  TrabajadorEmpresa set NIF=@NIF WHERE idTrabajador=@idTrabajador and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==2)
        {
            const result =await pool.request()
            .input('nombres', sql.VarChar,nuevoValor)
            .input('idTrabajador', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE  TrabajadorEmpresa set nombres=@nombres WHERE idTrabajador=@idTrabajador and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==3)
        {
            const result =await pool.request()
            .input('apellidos', sql.VarChar,nuevoValor)
            .input('idTrabajador', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE  TrabajadorEmpresa set apellidos=@apellidos WHERE idTrabajador=@idTrabajador and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==4)
        {
            const result =await pool.request()
            .input('email', sql.VarChar,nuevoValor)
            .input('idTrabajador', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE  TrabajadorEmpresa set email=@email WHERE idTrabajador=@idTrabajador and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }
        else if (indexColumna==5)
        {
            const result =await pool.request()
            .input('telefono', sql.VarChar,nuevoValor)
            .input('idTrabajador', sql.Int, id)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE  TrabajadorEmpresa set telefono=@telefono WHERE idTrabajador=@idTrabajador and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
        }     
        
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async modifyEstadoPersonal(idTrabajador, idEmpresa) {
    let estado = '';
    try {
        const pool = await connectDB(); // Conectar a la base de datos una vez
        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .input('idTrabajador', sql.Int, idTrabajador)
            .query(`SELECT estado FROM TrabajadorEmpresa WHERE idEmpresa=@idEmpresa AND idTrabajador=@idTrabajador`);
        
        // Asegurarte de que se devuelva al menos un registro
        if (result.recordset.length > 0) {
            estado = result.recordset[0].estado; // Obtener el valor del estado
        } else {
            throw new Error('No se encontró el trabajador o empresa.');
        }
    } catch (error) {
        console.error('Error en la consulta de estado:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }

    try {
        // Actualizar el estado basado en el valor actual
        const pool = await connectDB(); // Reconectar para la actualización
        if (estado === 'H') {
            await pool.request()
                .input('idEmpresa', sql.Int, idEmpresa)
                .input('idTrabajador', sql.Int, idTrabajador)
                .query(`UPDATE TrabajadorEmpresa SET estado='D' WHERE idEmpresa=@idEmpresa AND idTrabajador=@idTrabajador`);
            return 'Baja';
        } else {
            await pool.request()
                .input('idEmpresa', sql.Int, idEmpresa)
                .input('idTrabajador', sql.Int, idTrabajador)
                .query(`UPDATE TrabajadorEmpresa SET estado='H' WHERE idEmpresa=@idEmpresa AND idTrabajador=@idTrabajador`);
            return 'Alta';
        }
    } catch (error) {
        console.error('Error en la actualización de estado:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}



static async registrarpersonal(idCentro,NIF,nombres,apellidos,email,telefono,fechaAlta,estado,idEmpresa){
    const pool=await await connectDB();
    try 
    {   

         const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idCentro', sql.Int, idCentro)
        .input('estado', sql.VarChar, estado)
        .input('fechaAlta', sql.DateTime, fechaAlta)
        .input('telefono', sql.VarChar, telefono)
        .input('email', sql.VarChar, email)
        .input('nombres', sql.VarChar, nombres)
        .input('apellidos', sql.VarChar, apellidos)
        .input('NIF', sql.VarChar, NIF)
        .execute('REGISTRAR_TRABAJADOR');
       return result.recordset
       
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async registrarcentro(centro,encargado,ciudad,direccion,codigopostal,telefono,email,personal,idEmpresa){
    const pool=await await connectDB();
    try 
    {   
        const result =await pool.request()        
        .input('nombreCentro', sql.VarChar,centro)
        .input('encargadoCentro', sql.VarChar, encargado)
        .input('ciudad', sql.VarChar, ciudad)
        .input('direccionCentro', sql.VarChar, direccion)
        .input('codigoposta', sql.VarChar, codigopostal)
        .input('telefonoCentro', sql.VarChar, telefono)
        .input('emailCentro', sql.VarChar, email)
        .input('ntrabajadorCentro', sql.VarChar,personal)
        .input('idEmpresa', sql.Int, idEmpresa)
        .execute('REGISTRAR_CENTRO');
        return result.recordset
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
}//fin de la clase


module.exports = User;
