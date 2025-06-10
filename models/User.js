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

static async validatePassword(username,pass,email) {
    const pool = await connectDB();
    try{
        const result = await pool.request()
          .input('username', sql.VarChar, username)
          .input('pass', sql.VarChar, pass)
          .input('email', sql.VarChar, email)
          .query(`SELECT * FROM EmpresaPass WHERE estado='H' and email=@email and usuario = @username and pass =HASHBYTES('SHA2_256', @pass)`);
        return (result.recordset)
    }
    catch (error)
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async modifyEmpresa(direccionEmpresa,encargadoEmpresa,email,telefono,idEmpresa){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
      
        .input('encargadoEmpresa', sql.VarChar, encargadoEmpresa)
        .input('email', sql.VarChar, email)
        .input('telefono', sql.VarChar, telefono)
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`UPDATE ClienteEmpresa SET email=@email, encargadoEmpresa=@encargadoEmpresa, telefono=@telefono WHERE idEmpresa=@idEmpresa`);          
        return (result.rowsAffected[0])
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async listCentroEmpresa(idEmpresa){
    const pool= await connectDB();
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

static async listPuestoEmpresa(idEmpresa){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`select idPuesto,Nombre from PuestoTrabajoEmpresa where idEmpresa=@idEmpresa`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async seleccTrabajador(idEmpresa,idTrabajador){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idTrabajador', sql.Int, idTrabajador)
        // .query(`select * from trabajadorempresa tp inner join CentrosEmpresa ce on (tp.idCentro=ce.idCentro) inner join PuestoTrabajoEmpresa pte on (tp.idPuesto=pte.idPuesto) where tp.idTrabajador=@idTrabajador and tp.idEmpresa=@idEmpresa`);          
        .query(`select idTrabajador='PVW-'+convert(varchar,idTrabajador),NIF,nombres,apellidos,email,telefono,fechaAlta,ce.idCentro,tp.estado,tp.idEmpresa,tp.idPuesto,fechaAlta,FNac,nombreCentro,direccionCentro,ntrabajadorCentro,pte.Nombre from trabajadorempresa tp inner join CentrosEmpresa ce on (tp.idCentro=ce.idCentro) inner join PuestoTrabajoEmpresa pte on (tp.idPuesto=pte.idPuesto) where tp.idTrabajador=@idTrabajador and tp.idEmpresa=@idEmpresa`)
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async listTodosTrabajadorEmpresa(idEmpresa) {
    const pool = await connectDB();
    try {
        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`
                SELECT 
    idTrabajador,
    idCentro,
    Centro = (SELECT nombreCentro FROM CentrosEmpresa WHERE idCentro = t.idCentro),
    NIF,
    nombres,
    apellidos,
    Puesto = pte.Nombre,
    email,
    telefono,
    FNac = CASE 
              WHEN FNac IS NULL THEN ''                            
              ELSE CONVERT(VARCHAR(10), FNac, 103) 
           END,
    Registro = CONVERT(VARCHAR(10), fechaAlta, 103),
    Baja = CASE 
              WHEN fechaBaja IS NULL THEN '' 
              WHEN fechaBaja < '2000-01-01' THEN '' 
              ELSE CONVERT(VARCHAR(10), fechaBaja, 103) 
           END,
    fechaRM = CASE 
            WHEN fechaRM IS NULL THEN ''           
            ELSE CONVERT(VARCHAR(10), fechaRM, 103) 
    END,
   fechaCursoOnline = CASE 
            WHEN fechaCursoOnline IS NULL THEN ''           
            ELSE CONVERT(VARCHAR(10), fechaCursoOnline, 103) 
    END,
    Estado = CASE 
                WHEN estado = 'H' THEN 'Alta' 
                ELSE 'Baja' 
             END
                FROM TrabajadorEmpresa t
                INNER JOIN PuestoTrabajoEmpresa pte ON (t.idPuesto = pte.idPuesto)
                WHERE t.idEmpresa = @idEmpresa    
            `);
        return result.recordset;
    } catch (error) {
        console.error('Error en la modificación de datos:', error);
        throw error;
    }
}
/*aqui todas las plantillas*/
static async listFormacion(idEmpresa,idTrabajador){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)       
        .input('idTrabajador', sql.Int, idTrabajador)   
        .query(`select ROW_NUMBER() OVER(ORDER BY idcursoOnline ASC) AS n,puesto=pte.Nombre,registro=CONVERT(varchar(10),coc.registro,103),[CursoOnline]=CourseOnline,idStudentOnline from cursosonlineControl coc inner join TrabajadorEmpresa te on (coc.idTrabajador=te.idTrabajador) inner join PuestoTrabajoEmpresa pte on (te.idPuesto=pte.idPuesto) where pte.idEmpresa=@idEmpresa and te.idTrabajador=@idTrabajador`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    } 
}

static async listInformacionTrabajador(idEmpresa,idDocumento,idTrabajador){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idDocumento', sql.Int, idDocumento)
        .input('idTrabajador', sql.Int, idTrabajador)   
        .query(`SELECT 
    ROW_NUMBER() OVER(ORDER BY clc.idDocumento ASC) AS n,
    te.NIF,
    nombres = COALESCE(te.nombres, '') + ' ' + COALESCE(te.apellidos, ''),
    [PuestoTrabajo] = MAX(pte.Nombre), -- Agregamos MAX para evitar duplicados en esta columna
    [Registro] = MAX(CONVERT(VARCHAR(10), clc.registro, 103)), -- Lo mismo aquí
    [Certificado] = MAX(clc.CategoriaDocumentoFuera),
    Observacion = MAX(clc.observacion),
    clc.documento,
    clc.idDocumentoProyecto,
    clc.documentoAWS
FROM 
    TrabajadorEmpresa te
INNER JOIN 
    PuestoTrabajoEmpresa pte ON te.idPuesto = pte.idPuesto
INNER JOIN 
    DocumentosProyectos clc ON te.idTrabajador = clc.idTrabajador
INNER JOIN 
    CentroContratos cc ON cc.idCentro = te.idCentro
WHERE 
  idDocumento=@idDocumento and clc.idTrabajador=@idTrabajador and cc.idEmpresa=@idEmpresa
GROUP BY

    te.NIF, te.nombres, te.apellidos, clc.documento, clc.idDocumentoProyecto, clc.documentoAWS, clc.idDocumento
ORDER BY 
    clc.idDocumento ASC;
`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    } 
}

static async listConcentimientoTrabajador(idEmpresa,idDocumento,idTrabajador,idListaDocumento){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idDocumento', sql.Int, idDocumento)
        .input('idListaDocumento', sql.Int, idListaDocumento)
        .input('idTrabajador', sql.Int, idTrabajador)   
        .query(`SELECT 
    ROW_NUMBER() OVER(ORDER BY clc.idDocumento ASC) AS n,
    te.NIF,
    nombres = COALESCE(te.nombres, '') + ' ' + COALESCE(te.apellidos, ''),
    [PuestoTrabajo] = MAX(pte.Nombre), -- Agregamos MAX para evitar duplicados en esta columna
    [Registro] = MAX(CONVERT(VARCHAR(10), clc.registro, 103)), -- Lo mismo aquí
    [Certificado] = MAX(clc.CategoriaDocumentoFuera),
    Observacion = MAX(clc.observacion),
    clc.documento,
    clc.idDocumentoProyecto,
    clc.documentoAWS
FROM 
    TrabajadorEmpresa te
INNER JOIN 
    PuestoTrabajoEmpresa pte ON te.idPuesto = pte.idPuesto
INNER JOIN 
    DocumentosProyectos clc ON te.idTrabajador = clc.idTrabajador
INNER JOIN 
    CentroContratos cc ON cc.idCentro = te.idCentro
WHERE 
  idDocumento=@idDocumento and clc.idTrabajador=@idTrabajador and cc.idEmpresa=@idEmpresa and idListaDocumento=@idListaDocumento
GROUP BY

    te.NIF, te.nombres, te.apellidos, clc.documento, clc.idDocumentoProyecto, clc.documentoAWS, clc.idDocumento
ORDER BY 
    clc.idDocumento ASC;
`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    } 
}

static async listRMTrabajador(idEmpresa,idTrabajador){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)        
        .input('idTrabajador', sql.Int, idTrabajador)   
        .query(`SELECT 
    ISNULL(url, '') AS url,
    ROW_NUMBER() OVER(ORDER BY idSolRM) AS n,
    nombre = ISNULL(te.nombres, '') + ' ' + ISNULL(te.apellidos, ''),
    registro = CONVERT(VARCHAR(10), fecha, 103),
    estado = CASE 
                WHEN rm.estado = 'P' THEN 'Solicitud Pendiente' 
                ELSE 'Certificado Entregado' 
             END,
    entrega = CASE 
                 WHEN TipoApto = 1 THEN CONVERT(VARCHAR(10), fechaEntrega, 103) 
                 ELSE '' 
              END,
    apto = CASE 
              WHEN TipoApto = 1 THEN 'Apto'
              WHEN TipoApto IS NULL THEN ''
              WHEN TipoApto = '' THEN ''
              ELSE 'No Apto' 
           END,
    idSolRM
FROM 
    SolicitudRM rm
INNER JOIN 
    TrabajadorEmpresa te ON rm.idTrabajador = te.idTrabajador where rm.idEmpresa=@idEmpresa and rm.idTrabajador=@idTrabajador;`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    } 
}

static async listInformacion(idEmpresa,idDocumento,idTrabajador,idTrabajadorPersona){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idDocumento', sql.Int, idDocumento)
        .input('idTrabajador', sql.Int, idTrabajador)   
        .input('idTrabajadorPersona', sql.Int, idTrabajadorPersona)   
        .query(`
            select ROW_NUMBER() OVER(ORDER BY idDocumentoProyecto ASC) AS n,
codigoAlterno,
Categoria=ld.documento,
dp.documento,observacion,
registro=CONVERT(varchar(10),registro,103),
documentoAWS,
idDocumentoProyecto,
fechadescarga=ISNULL((select top 1 convert(varchar(10), fechadescarga,103) from listaDescarga where idDocumentoProyecto = dp.idDocumentoProyecto and idTrabajador=@idTrabajadorPersona order by iddescarga desc),''),
fechaenvio=ISNULL((select top 1 convert(varchar(10), fechaenvio,103) from listaEnvio where idDocumentoProyecto = dp.idDocumentoProyecto and idTrabajador=@idTrabajadorPersona order by idenvio desc),'')
from CategoriaDocumento cd inner join DocumentosProyectos dp on (cd.idDocumento=dp.idDocumento) inner join ListaDocumento ld on (ld.idListaDocumento=dp.idListaDocumento) inner join ContratoConfirmados cc on (cc.idContrato=dp.idContrato) inner join Contratos c on (cc.idContrato=c.idContrato)  
WHERE dp.idDocumento=@idDocumento and idTrabajador=0 and idEmpresa=@idEmpresa
            `)
//         .query(`select ROW_NUMBER() OVER(ORDER BY idDocumentoProyecto ASC) AS n,codigoAlterno,Categoria=ld.documento,dp.documento,observacion,registro=CONVERT(varchar(10),registro,103),documentoAWS,idDocumentoProyecto, fechadescarga=ISNULL(CONVERT(varchar(10),fechadescarga,103),''),fechaenvio=ISNULL(CONVERT(varchar(10),fechaenvio,103),'') 
// from CategoriaDocumento cd inner join DocumentosProyectos dp on (cd.idDocumento=dp.idDocumento) inner join ListaDocumento ld on (ld.idListaDocumento=dp.idListaDocumento) inner join ContratoConfirmados cc on (cc.idContrato=dp.idContrato) inner join Contratos c on (cc.idContrato=c.idContrato)  
// WHERE dp.idDocumento=@idDocumento and idTrabajador=0 and idEmpresa=@idEmpresa`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async listAutorizacionEpis(idEmpresa,idDocumento,idTrabajador,idListaDocumento){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idDocumento', sql.Int, idDocumento)
        .input('idTrabajador', sql.Int, idTrabajador)   
        .input('idListaDocumento', sql.Int, idListaDocumento)   
        .query(`
         select ROW_NUMBER() OVER(ORDER BY idDocumentoProyecto ASC) AS n,
codigoAlterno,
Categoria=ld.documento,
dp.documento,
observacion,
registro=CONVERT(varchar(10),registro,103),
fechadescarga=ISNULL((select top 1 convert(varchar(10), fechadescarga,103) from listaDescarga where idDocumentoProyecto = dp.idDocumentoProyecto and idTrabajador=@idTrabajador order by iddescarga desc),''),
fechaenvio=ISNULL((select top 1 convert(varchar(10), fechaenvio,103) from listaEnvio where idDocumentoProyecto = dp.idDocumentoProyecto and idTrabajador=@idTrabajador order by idenvio desc),''),
documentoAWS,
idDocumentoProyecto 
from CategoriaDocumento cd inner join DocumentosProyectos dp on (cd.idDocumento=dp.idDocumento) inner join ListaDocumento ld on (ld.idListaDocumento=dp.idListaDocumento) inner join ContratoConfirmados cc on (cc.idContrato=dp.idContrato) inner join Contratos c on (cc.idContrato=c.idContrato)  
WHERE dp.idDocumento=@idDocumento and idTrabajador=0 and idEmpresa=@idEmpresa and ld.idListaDocumento=@idListaDocumento   
            `);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
/*aqui las plantillas*/
static async listDocumentosTrabajador(idEmpresa){
    const pool= await connectDB();
    try 
    {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`SELECT 
    centro = cc.nombreCentro,
    nif = te.NIF,
    nombre = te.nombres,
    apellidos = te.apellidos,
    puesto = pte.Nombre,
    alta = ISNULL(CONVERT(varchar(10), te.fechaAlta, 103), ''),
    estado = CASE WHEN te.estado = 'H' THEN 'Alta' ELSE 'Baja' END,

    -- CURSOS
    fechaCurso = ISNULL(CONVERT(varchar(10), caCurso.registro, 103), ''),
    nCurso = ISNULL(caCurso.nCurso, 0),

    -- FORMACION
    fechaFormacion = ISNULL(CONVERT(varchar(10), caFormacion.fechaFormacion, 103), ''),
    nFormacion = ISNULL(caFormacion.nFormacion, 0),

    -- INFORMACION
    fechaInformacion = ISNULL(CONVERT(varchar(10), caInformacion.fechaInformacion, 103), ''),
    nInformacion = ISNULL(caInformacion.nInformacion, 0),

    -- RM
    RM_inicio = ISNULL(CONVERT(varchar(10), caRM.fecha, 103), ''),
    RM_fin = ISNULL(CASE WHEN caRM.fechaEntrega> caRM.fecha THEN CONVERT(varchar(10), caRM.fechaEntrega, 103) ELSE '' END, ''),

    -- ACEPTACION RENUNCIA RM
    fechaAceptacion = ISNULL(CONVERT(varchar(10), caAceptacion.fechaAceptacion, 103), ''),
	ARObservacion = ISNULL(caAceptacion.observacion,''),
    -- AUTORIZACION
    fechaAutorizacion = ISNULL(CONVERT(varchar(10), caAutorizacion.fechaAutorizacion, 103), ''),
    nAutorizacion = ISNULL(caAutorizacion.nAutorizacion, 0),

    -- EPIS
    fechaEpis = ISNULL(CONVERT(varchar(10), caEpis.fechaEpis, 103), ''),
    nEpis = ISNULL(caEpis.nEpis, 0)

FROM trabajadorEmpresa te
INNER JOIN CentrosEmpresa cc ON te.idCentro = cc.idCentro
INNER JOIN PuestoTrabajoEmpresa pte ON te.idPuesto = pte.idPuesto

-- CURSOS
OUTER APPLY (
    SELECT 
        MAX(registro) AS registro,
        COUNT(*) AS nCurso
    FROM cursosonlineControl
    WHERE idTrabajador = te.idTrabajador
) caCurso

-- FORMACION
OUTER APPLY (
    SELECT 
        MAX(CASE WHEN idDocumento = 15 THEN registro END) AS fechaFormacion,
        COUNT(CASE WHEN idDocumento = 13 THEN 1 END) AS nFormacion
    FROM DocumentosProyectos
    WHERE idTrabajador = te.idTrabajador
) caFormacion

-- INFORMACION
OUTER APPLY (
    SELECT 
        MAX(CASE WHEN idDocumento = 15 THEN registro END) AS fechaInformacion,
        COUNT(CASE WHEN idDocumento = 15 THEN 1 END) AS nInformacion
    FROM DocumentosProyectos
    WHERE idTrabajador = te.idTrabajador
) caInformacion

-- RM
OUTER APPLY (
    SELECT TOP 1 fecha, fechaEntrega
    FROM SolicitudRM
    WHERE idTrabajador = te.idTrabajador
    ORDER BY idSolRM DESC
) caRM

-- ACEPTACION
OUTER APPLY (
    SELECT TOP 1 registro AS fechaAceptacion, observacion
    FROM DocumentosProyectos
    WHERE idDocumento = 14 AND idTrabajador = te.idTrabajador
    ORDER BY idDocumentoProyecto DESC
) caAceptacion
-- ACEPTACION

-- AUTORIZACION
OUTER APPLY (
    SELECT 
        MAX(registro) AS fechaAutorizacion,
        COUNT(*) AS nAutorizacion
    FROM DocumentosProyectos
    WHERE idDocumento = 16 AND idListaDocumento = 73 AND idTrabajador = te.idTrabajador
) caAutorizacion

-- EPIS
OUTER APPLY (
    SELECT 
        MAX(registro) AS fechaEpis,
        COUNT(*) AS nEpis
    FROM DocumentosProyectos
    WHERE idDocumento = 16 AND idListaDocumento = 72 AND idTrabajador = te.idTrabajador
) caEpis

WHERE cc.idEmpresa = @idEmpresa
  AND te.estado = 'H';

`);          
        return (result.recordset)
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async cargarDocumentoSeleccionPersonalCentro(idCentro,idEmpresa,estado){
    const pool=await connectDB();
    try 
    {
        if (idCentro>0)
        {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idCentro', sql.Int, idCentro)
        .input('estado', sql.VarChar,estado )
        .query(`
SELECT 
    centro = cc.nombreCentro,
    nif = te.NIF,
    nombre = te.nombres,
    apellidos = te.apellidos,
    puesto = pte.Nombre,
    alta = ISNULL(CONVERT(varchar(10), te.fechaAlta, 103), ''),
    estado = CASE WHEN te.estado = 'H' THEN 'Alta' ELSE 'Baja' END,

    -- CURSOS
    fechaCurso = ISNULL(CONVERT(varchar(10), caCurso.registro, 103), ''),
    nCurso = ISNULL(caCurso.nCurso, 0),

    -- FORMACION
    fechaFormacion = ISNULL(CONVERT(varchar(10), caFormacion.fechaFormacion, 103), ''),
    nFormacion = ISNULL(caFormacion.nFormacion, 0),

    -- INFORMACION
    fechaInformacion = ISNULL(CONVERT(varchar(10), caInformacion.fechaInformacion, 103), ''),
    nInformacion = ISNULL(caInformacion.nInformacion, 0),

    -- RM
    RM_inicio = ISNULL(CONVERT(varchar(10), caRM.fecha, 103), ''),
    RM_fin = ISNULL(CASE WHEN caRM.fechaEntrega> caRM.fecha THEN CONVERT(varchar(10), caRM.fechaEntrega, 103) ELSE '' END, ''),

    -- ACEPTACION RENUNCIA RM
    fechaAceptacion = ISNULL(CONVERT(varchar(10), caAceptacion.fechaAceptacion, 103), ''),
	ARObservacion = ISNULL(caAceptacion.observacion,''),
    -- AUTORIZACION
    fechaAutorizacion = ISNULL(CONVERT(varchar(10), caAutorizacion.fechaAutorizacion, 103), ''),
    nAutorizacion = ISNULL(caAutorizacion.nAutorizacion, 0),

    -- EPIS
    fechaEpis = ISNULL(CONVERT(varchar(10), caEpis.fechaEpis, 103), ''),
    nEpis = ISNULL(caEpis.nEpis, 0)

FROM trabajadorEmpresa te
INNER JOIN CentrosEmpresa cc ON te.idCentro = cc.idCentro
INNER JOIN PuestoTrabajoEmpresa pte ON te.idPuesto = pte.idPuesto

-- CURSOS
OUTER APPLY (
    SELECT 
        MAX(registro) AS registro,
        COUNT(*) AS nCurso
    FROM cursosonlineControl
    WHERE idTrabajador = te.idTrabajador
) caCurso

-- FORMACION
OUTER APPLY (
    SELECT 
        MAX(CASE WHEN idDocumento = 15 THEN registro END) AS fechaFormacion,
        COUNT(CASE WHEN idDocumento = 13 THEN 1 END) AS nFormacion
    FROM DocumentosProyectos
    WHERE idTrabajador = te.idTrabajador
) caFormacion

-- INFORMACION
OUTER APPLY (
    SELECT 
        MAX(CASE WHEN idDocumento = 15 THEN registro END) AS fechaInformacion,
        COUNT(CASE WHEN idDocumento = 15 THEN 1 END) AS nInformacion
    FROM DocumentosProyectos
    WHERE idTrabajador = te.idTrabajador
) caInformacion

-- RM
OUTER APPLY (
    SELECT TOP 1 fecha, fechaEntrega
    FROM SolicitudRM
    WHERE idTrabajador = te.idTrabajador
    ORDER BY idSolRM DESC
) caRM

-- ACEPTACION
OUTER APPLY (
    SELECT TOP 1 registro AS fechaAceptacion, observacion
    FROM DocumentosProyectos
    WHERE idDocumento = 14 AND idTrabajador = te.idTrabajador
    ORDER BY idDocumentoProyecto DESC
) caAceptacion
-- ACEPTACION

-- AUTORIZACION
OUTER APPLY (
    SELECT 
        MAX(registro) AS fechaAutorizacion,
        COUNT(*) AS nAutorizacion
    FROM DocumentosProyectos
    WHERE idDocumento = 16 AND idListaDocumento = 73 AND idTrabajador = te.idTrabajador
) caAutorizacion

-- EPIS
OUTER APPLY (
    SELECT 
        MAX(registro) AS fechaEpis,
        COUNT(*) AS nEpis
    FROM DocumentosProyectos
    WHERE idDocumento = 16 AND idListaDocumento = 72 AND idTrabajador = te.idTrabajador
) caEpis

WHERE cc.idEmpresa = @idEmpresa and te.estado = @estado and cc.idCentro=@idCentro

        `);          
        return (result.recordset)
        }
        else
        {
            const result =await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .input('estado', sql.VarChar,estado )
            .query(`
              SELECT 
    centro = cc.nombreCentro,
    nif = te.NIF,
    nombre = te.nombres,
    apellidos = te.apellidos,
    puesto = pte.Nombre,
    alta = ISNULL(CONVERT(varchar(10), te.fechaAlta, 103), ''),
    estado = CASE WHEN te.estado = 'H' THEN 'Alta' ELSE 'Baja' END,

    -- CURSOS
    fechaCurso = ISNULL(CONVERT(varchar(10), caCurso.registro, 103), ''),
    nCurso = ISNULL(caCurso.nCurso, 0),

    -- FORMACION
    fechaFormacion = ISNULL(CONVERT(varchar(10), caFormacion.fechaFormacion, 103), ''),
    nFormacion = ISNULL(caFormacion.nFormacion, 0),

    -- INFORMACION
    fechaInformacion = ISNULL(CONVERT(varchar(10), caInformacion.fechaInformacion, 103), ''),
    nInformacion = ISNULL(caInformacion.nInformacion, 0),

    -- RM
    RM_inicio = ISNULL(CONVERT(varchar(10), caRM.fecha, 103), ''),
    RM_fin = ISNULL(CASE WHEN caRM.fechaEntrega> caRM.fecha THEN CONVERT(varchar(10), caRM.fechaEntrega, 103) ELSE '' END, ''),

    -- ACEPTACION RENUNCIA RM
    fechaAceptacion = ISNULL(CONVERT(varchar(10), caAceptacion.fechaAceptacion, 103), ''),
	ARObservacion = ISNULL(caAceptacion.observacion,''),
    -- AUTORIZACION
    fechaAutorizacion = ISNULL(CONVERT(varchar(10), caAutorizacion.fechaAutorizacion, 103), ''),
    nAutorizacion = ISNULL(caAutorizacion.nAutorizacion, 0),

    -- EPIS
    fechaEpis = ISNULL(CONVERT(varchar(10), caEpis.fechaEpis, 103), ''),
    nEpis = ISNULL(caEpis.nEpis, 0)

FROM trabajadorEmpresa te
INNER JOIN CentrosEmpresa cc ON te.idCentro = cc.idCentro
INNER JOIN PuestoTrabajoEmpresa pte ON te.idPuesto = pte.idPuesto

-- CURSOS
OUTER APPLY (
    SELECT 
        MAX(registro) AS registro,
        COUNT(*) AS nCurso
    FROM cursosonlineControl
    WHERE idTrabajador = te.idTrabajador
) caCurso

-- FORMACION
OUTER APPLY (
    SELECT 
        MAX(CASE WHEN idDocumento = 15 THEN registro END) AS fechaFormacion,
        COUNT(CASE WHEN idDocumento = 13 THEN 1 END) AS nFormacion
    FROM DocumentosProyectos
    WHERE idTrabajador = te.idTrabajador
) caFormacion

-- INFORMACION
OUTER APPLY (
    SELECT 
        MAX(CASE WHEN idDocumento = 15 THEN registro END) AS fechaInformacion,
        COUNT(CASE WHEN idDocumento = 15 THEN 1 END) AS nInformacion
    FROM DocumentosProyectos
    WHERE idTrabajador = te.idTrabajador
) caInformacion

-- RM
OUTER APPLY (
    SELECT TOP 1 fecha, fechaEntrega
    FROM SolicitudRM
    WHERE idTrabajador = te.idTrabajador
    ORDER BY idSolRM DESC
) caRM

-- ACEPTACION
OUTER APPLY (
    SELECT TOP 1 registro AS fechaAceptacion, observacion
    FROM DocumentosProyectos
    WHERE idDocumento = 14 AND idTrabajador = te.idTrabajador
    ORDER BY idDocumentoProyecto DESC
) caAceptacion
-- ACEPTACION

-- AUTORIZACION
OUTER APPLY (
    SELECT 
        MAX(registro) AS fechaAutorizacion,
        COUNT(*) AS nAutorizacion
    FROM DocumentosProyectos
    WHERE idDocumento = 16 AND idListaDocumento = 73 AND idTrabajador = te.idTrabajador
) caAutorizacion

-- EPIS
OUTER APPLY (
    SELECT 
        MAX(registro) AS fechaEpis,
        COUNT(*) AS nEpis
    FROM DocumentosProyectos
    WHERE idDocumento = 16 AND idListaDocumento = 72 AND idTrabajador = te.idTrabajador
) caEpis

WHERE cc.idEmpresa = @idEmpresa and te.estado = @estado
                `);          
            return (result.recordset)
        }
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async listTodosTrabajadorCentro(idCentro,idEmpresa,estado){
    const pool= await connectDB();
    try 
    {
        if (idCentro>0)
        {
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idCentro', sql.Int, idCentro)
        .input('estado', sql.VarChar,estado )
        .query(`SELECT 
    idTrabajador,
    idCentro,
    Centro = (SELECT nombreCentro FROM CentrosEmpresa WHERE idCentro = t.idCentro),
    NIF,
    nombres,
    apellidos,
    Puesto = pte.Nombre,
    email,
    telefono,
    FNac = CASE 
              WHEN FNac IS NULL THEN ''                            
              ELSE CONVERT(VARCHAR(10), FNac, 103) 
           END,
    Registro = CONVERT(VARCHAR(10), fechaAlta, 103),
    Baja = CASE 
              WHEN fechaBaja IS NULL THEN '' 
              WHEN fechaBaja < '2000-01-01' THEN '' 
              ELSE CONVERT(VARCHAR(10), fechaBaja, 103) 
           END,
    fechaRM = CASE 
            WHEN fechaRM IS NULL THEN ''           
            ELSE CONVERT(VARCHAR(10), fechaRM, 103) 
    END,
   fechaCursoOnline = CASE 
            WHEN fechaCursoOnline IS NULL THEN ''           
            ELSE CONVERT(VARCHAR(10), fechaCursoOnline, 103) 
    END,
    Estado = CASE 
                WHEN estado = 'H' THEN 'Alta' 
                ELSE 'Baja' 
             END
FROM TrabajadorEmpresa t
INNER JOIN PuestoTrabajoEmpresa pte ON (t.idPuesto = pte.idPuesto)
WHERE t.idEmpresa = @idEmpresa and idCentro=@idCentro and estado=@estado`);          
        return (result.recordset)
        }
        else
        {
            const result =await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .input('estado', sql.VarChar,estado )
            .query(`SELECT 
    idTrabajador,
    idCentro,
    Centro = (SELECT nombreCentro FROM CentrosEmpresa WHERE idCentro = t.idCentro),
    NIF,
    nombres,
    apellidos,
    Puesto = pte.Nombre,
    email,
    telefono,
    FNac = CASE 
              WHEN FNac IS NULL THEN ''                            
              ELSE CONVERT(VARCHAR(10), FNac, 103) 
    END,
    Registro = CONVERT(VARCHAR(10), fechaAlta, 103),
    Baja = CASE 
              WHEN fechaBaja IS NULL THEN '' 
              WHEN fechaBaja < '2000-01-01' THEN '' 
              ELSE CONVERT(VARCHAR(10), fechaBaja, 103) 
           END,
    fechaRM = CASE 
            WHEN fechaRM IS NULL THEN ''           
            ELSE CONVERT(VARCHAR(10), fechaRM, 103) 
    END,
    fechaCursoOnline = CASE 
            WHEN fechaCursoOnline IS NULL THEN ''           
            ELSE CONVERT(VARCHAR(10), fechaCursoOnline, 103) 
    END,
    Estado = CASE 
                WHEN estado = 'H' THEN 'Alta' 
                ELSE 'Baja' 
             END
FROM TrabajadorEmpresa t
INNER JOIN PuestoTrabajoEmpresa pte ON (t.idPuesto = pte.idPuesto)
WHERE t.idEmpresa = @idEmpresa and estado=@estado;`);          
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
    const pool= await connectDB();
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
            else if (indexColumna==8)
            {
                const result =await pool.request()
                    .input('ntrabajadorCentro', sql.VarChar,nuevoValor)
                    .input('idCentro', sql.Int, id)
                    .input('idEmpresa', sql.Int, idEmpresa)
                    .query(`UPDATE CentrosEmpresa set ntrabajadorCentro =@ntrabajadorCentro WHERE idCentro=@idCentro and idEmpresa=@idEmpresa`);
                    return (result.rowsAffected[0])
                } 
        
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async modifyPersonal(idCentro,NIF,nombres,apellidos,email,idpuesto,telefono,Fregistro,Fbaja,estado,idTrabajador,idEmpresa,FNac){
    const pool= await connectDB();
   
    try 
    {       
       
        const result =await pool.request()
            .input('idCentro', sql.Int, idCentro)
            .input('NIF', sql.VarChar, NIF)
            .input('nombres', sql.VarChar, nombres)
            .input('apellidos', sql.VarChar, apellidos)
            .input('email', sql.VarChar, email)            
            .input('idpuesto', sql.Int, idpuesto)
            .input('telefono', sql.VarChar,telefono)
            .input('Fregistro', sql.Date,Fregistro)
            .input('Fbaja', sql.Date,Fbaja)
            .input('FNac', sql.Date,FNac)
            .input('estado', sql.VarChar,estado)
            .input('idTrabajador', sql.Int, idTrabajador)
            .input('idEmpresa', sql.Int, idEmpresa)
            .query(`UPDATE  TrabajadorEmpresa set FNac=@FNac, idCentro=@idCentro, NIF=@NIF,nombres=@nombres,apellidos=@apellidos,email=@email, idpuesto=@idpuesto, telefono=@telefono,fechaAlta=@Fregistro,fechaBaja=@Fbaja,estado=@estado WHERE idTrabajador=@idTrabajador and idEmpresa=@idEmpresa`);
            return (result.rowsAffected[0])
            
        
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async obtenerdatosmodificar(idTrabajador, idEmpresa) {
    let estado = '';
    try {
        const pool = await connectDB(); // Conectar a la base de datos una vez
        const result = await pool.request()
            .input('idEmpresa', sql.Int, idEmpresa)
            .input('idTrabajador', sql.Int, idTrabajador)
            .query(`select idTrabajador,NIF,nombres,apellidos,email,telefono,fechaAlta=convert(date,fechaAlta,103),fechaBaja=convert(date,fechaBaja,103),FNac=convert(date,FNac,103),idCentro,estado,idEmpresa,idPuesto FROM TrabajadorEmpresa WHERE idEmpresa=@idEmpresa AND idTrabajador=@idTrabajador`);
        
        // Asegurarte de que se devuelva al menos un registro
        if (result.recordset.length > 0) {
            return (result.recordset); // Obtener el valor del estado
        } else {
            throw new Error('No se encontró el trabajador o empresa.');
        }
    } catch (error) {
        console.error('Error en la consulta de estado:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async registrarpersonal(idCentro,NIF,nombres,apellidos,email,telefono,idpuesto,fechaAlta,estado,idEmpresa,fNac){
    const pool= await connectDB();
    try 
    {   
        const result =await pool.request()
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idCentro', sql.Int, idCentro)
        .input('idPuesto', sql.Int, idpuesto)
        .input('estado', sql.VarChar, estado)
        .input('fechaAlta', sql.DateTime, fechaAlta)
        .input('fNac', sql.DateTime, fNac)
        .input('fechaBaja', sql.VarChar, null)
        .input('telefono', sql.VarChar, telefono)
        .input('email', sql.VarChar, email)
        .input('nombres', sql.VarChar, nombres)
        .input('apellidos', sql.VarChar, apellidos)
        .input('NIF', sql.VarChar, NIF)
        .execute('REGISTRAR_TRABAJADOR');
        return result.recordset;       
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async registrarcentro(centro,encargado,ciudad,direccion,codigopostal,telefono,email,personal,idEmpresa){
    const pool= await connectDB();
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

static async registrarSolicitudRM(idTrabajador,idEmpresa,idContrato){
    const pool= await connectDB();
    try 
    {   
        const result = await pool.request()       
        .input('idTrabajador', sql.Int, idTrabajador)
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idContrato', sql.Int, idContrato)
        .output('retorno', sql.VarChar)  // Agregar el parámetro de salida
        .output('idSolRMRetorno', sql.Int)
        .execute('REGISTRAR_SOLICITUDRM_PRUEBA');
        const { retorno, idSolRMRetorno } = result.output;
        return { retorno, idSolRMRetorno };
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async registrarEnvio(idTrabajador, idDocumentoProyecto) {
    const pool = await connectDB();
    try {
        const result = await pool.request()
            .input('idTrabajador', sql.Int, idTrabajador)
            .input('idDocumentoProyecto', sql.Int, idDocumentoProyecto)        
            .output('fecha', sql.VarChar(10))  // especificar tamaño del varchar
            .execute('REGISTRAR_LISTAENVIO');

        // Aquí accedes correctamente al parámetro de salida
        return result.output.fecha;
    } catch (error) {
        console.error('Error en la modificación de datos:', error);
        throw error;
    }
}

static async registrarDescarga(idTrabajador, idDocumentoProyecto) {
    const pool = await connectDB();
    try {
        const result = await pool.request()
            .input('idTrabajador', sql.Int, idTrabajador)
            .input('idDocumentoProyecto', sql.Int, idDocumentoProyecto)        
            .output('fecha', sql.VarChar(10))  // especificar tamaño del varchar
            .execute('REGISTRAR_LISTADESCARGA');

        // Aquí accedes correctamente al parámetro de salida
        return result.output.fecha;
    } catch (error) {
        console.error('Error en la modificación de datos:', error);
        throw error;
    }
}

static async datosenvioemail(){    
    const pool= await connectDB();
    try 
    {           
        const result =await pool.request()        
        .query(`select top 1 smtpsend,puertosend,emailEmpresasend,passsend,Body,Asunto from empresaemail`);
        return result.recordset
    } 
    catch (error) 
    {
        console.error('Error en la obtener los datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async descargarpdf(idDocumentoProyecto,idEmpresa){    
    const pool= await connectDB();
    try 
    {   
        
        const result =await pool.request()        
        .input('idDocumentoProyecto', sql.Int,idDocumentoProyecto)   
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`select documentoAWS,documento from CategoriaDocumento c inner join DocumentosProyectos dp on (c.idDocumento=dp.idDocumento) inner join contratos co on (dp.idContrato=co.idContrato) where idEmpresa=@idEmpresa and idDocumentoProyecto=@idDocumentoProyecto`);
        return result.recordset
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async mostrarpdf(tipo,idEmpresa){
    let idCategoria=0;
    const pool= await connectDB();
    if (tipo=='gestion_1')//plan prevencion
    {
        idCategoria=1;
    }
    else if(tipo=='gestion_2')//evaluacion de riesgos
    {
        idCategoria=2;
    }
    else if(tipo=='gestion_3')//planificacion actividad
    {
        idCategoria=3;
    }
    else if(tipo=='gestion_4')//programacion anual
    {
        idCategoria=4;
    }
    else if(tipo=='gestion_5')//memoria anual
    {
        idCategoria=5;
    }
    else if(tipo=='gestion_6')//notificaciones
    {
        idCategoria=6;
    }
    else if(tipo=='gestion_7')//contratos
    {
        idCategoria=9;
    }
    else if(tipo=='btnPresupuestoAll')//presupuestos 
    {
        idCategoria=0;
    }    
    else if(tipo=='btninforme_8')//construccion
    {
        idCategoria=8;
    }
    else if(tipo=='btninforme_9')//informe d seguridad
    {
        idCategoria=7;//esto va asi
    }
    else if(tipo=='btninforme_10')//informes de psicosocoiliga
    {
        idCategoria=10;
    }
    else if(tipo=='btninforme_11')//informes de ergonomia
    {
        idCategoria=11;
    }
    else if(tipo=='btninforme_12')//informes de higiene
    {
        idCategoria=12;
    }
    else if(tipo=='btnformacion')//formacion
    {
        idCategoria=13;
    }
    else if(tipo=='btnmedicina')//medicina
    {
        idCategoria=14;
    }
    else{
        return 'Error categoria no valida';
    }   

    try 
    {   
        const result =await pool.request()        
        .input('idDocumento', sql.Int,idCategoria)   
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`select ROW_NUMBER() OVER(ORDER BY idDocumentoProyecto ASC) AS n,idDocumentoProyecto,Proyecto=codigoAlterno,Centro,Categoria,documento,observacion,registro=CONVERT(varchar(10),registro,103) from CategoriaDocumento c inner join DocumentosProyectos dp on (c.idDocumento=dp.idDocumento) inner join contratos co on (dp.idContrato=co.idContrato) where idEmpresa=@idEmpresa and c.idDocumento=@idDocumento`);
        return result.recordset
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async cargarpdfTrabajador(idTrabajador,idDocumentoProyecto,idEmpresa,doc,docAWS,obs,reg){
  
    const pool= await connectDB();   
        const trabajador =await pool.request()        
        .input('idTrabajador', sql.Int, idTrabajador)
        .query(`select idCentro=cc.idCentro,nombreCentro from TrabajadorEmpresa te inner join CentroContratos cc on (te.idCentro=cc.idCentro) where idTrabajador=@idTrabajador `);          
        trabajador.recordset;  
    
        const datosDocumento =await pool.request()        
        .input('idDocumentoProyecto', sql.Int, idDocumentoProyecto)
        .query(`select idDocumento=dp.idDocumento,idListaDocumento=dp.idListaDocumento,idContrato=idContrato,Observacion=Observacion,idUsuario=idUsuario,CategoriaDocumentoFuera=ld.Documento,registro=getdate() from DocumentosProyectos dp inner join listaDocumento ld on (dp.idListaDocumento=ld.idListaDocumento) where idDocumentoProyecto=@idDocumentoProyecto`);          
        datosDocumento.recordset;
        const resultTrabajador= trabajador.recordset[0];
        const resultDocumento= datosDocumento.recordset[0];       
        const idDocumento = resultDocumento.idDocumento;
        const Centro=resultTrabajador.nombreCentro;
        const idListaDocumento =resultDocumento.idListaDocumento;
        const idContrato = resultDocumento.idContrato;
        const documento=doc;
        const Observacion=obs;
        const registro=reg;
        const idUsuario=resultDocumento.idUsuario;
        const idTrabajado=idTrabajador;
        const documentoAWS=idTrabajado+''+idListaDocumento+''+docAWS;
        const idCentro = resultTrabajador.idCentro;

        const CategoriaDocumentoFuera=resultDocumento.CategoriaDocumentoFuera;
        
        const devolver={
            idDocumento:idDocumento,
            documentoAWS:documentoAWS
        }
    try 
    {         
        const result =await pool.request()
        .input('idDocumento', sql.Int, idDocumento)
        .input('Centro', sql.VarChar, Centro)
        .input('idListaDocumento', sql.Int, idListaDocumento)
        .input('idContrato', sql.Int, idContrato)
        .input('documento', sql.VarChar, documento)
        .input('observacion', sql.VarChar, Observacion)
        .input('registro', sql.DateTime, registro)
        .input('idUsuario', sql.Int, idUsuario)
        .input('documentoAWS', sql.VarChar, documentoAWS)
        .input('idCentro', sql.Int, idCentro)
        .input('idTrabajador', sql.Int, idTrabajado)
        .input('CategoriaDocumentoFuera', sql.VarChar, CategoriaDocumentoFuera)
        .execute('REGISTRAR_DOCUMENTOSPROYETOS');
        return devolver;
       
    } 
    catch (error) 
    {
        console.error('Error en el registro del documento:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async obtenerdatosCourseOnline(idTrabajador,idEmpresa){
    const pool= await connectDB();   
    const result =await pool.request()        
    .input('idTrabajador', sql.Int, idTrabajador)
    .query(`select centro= (select top 1 nombreCentro from CentroContratos where idEmpresa=cc.idEmpresa and idContrato=cc.idContrato ),cifempresa=ce.CIF,direccionEmpresa=ce.direccionEmpresa,correo=te.email,puesto=pte.Nombre,nif=te.NIF,nombres,apellidos,telefono=te.telefono,idempresa=cc.idEmpresa,empresa=cc.empresa,fechaAlta=GETDATE(),Course,idCourse,estado=te.estado
                                    from TrabajadorEmpresa te inner join 										
										clienteEmpresa ce on (te.idEmpresa=ce.idEmpresa) inner join
	                                     Contratos cc on (te.idEmpresa=cc.idEmpresa) inner join	 
	                                     PuestoTrabajoEmpresa pte on (pte.idPuesto=te.idPuesto) 										 
                                         where idTrabajador=@idTrabajador`);          
    return result.recordset;
}

static async obtenerContrato(idEmpresa){
    
    const pool= await connectDB();   
    const result =await pool.request()        
    .input('idEmpresa', sql.Int,idEmpresa)
    .query(`select top 1 idContrato=c.idContrato from ContratoConfirmados cc inner join Contratos c on (cc.idContrato=c.idContrato) where idEmpresa=@idEmpresa order by idcontratoconfirmado desc`);          
    return result.recordset;
}

static async verificarTrabajadorCurso(idTrabajador,idEmpresa,idContrato,idCourse){
    const pool= await connectDB();
    try 
    {   
        const result = await pool.request()        
      
        .input('idTrabajador', sql.Int, idTrabajador)
        .input('idEmpresa', sql.Int, idEmpresa)
        .input('idContrato', sql.Int, idContrato)
        .input('idCourse', sql.Int,idCourse)
        .query(`select * from cursosonlineControl  where idEmpresa=@idEmpresa and idContrato=@idContrato and idTrabajador=@idTrabajador and idCourse=@idCourse`);          
        return result.recordset;
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}

static async registroOnline(idEmpresa, idContrato, idTrabajador, idCourse, idStudent, Course) {
    try {
        const pool = await connectDB();   
        const result = await pool.request()        
            .input('idEmpresa', sql.Int, idEmpresa)
            .input('idContrato', sql.Int, idContrato)
            .input('idTrabajador', sql.Int, idTrabajador)
            .input('idCourse', sql.Int, idCourse)
            .input('idStudentOnline', sql.Int, idStudent)
            .input('CourseOnline', sql.VarChar, Course)
            .output('registro', sql.VarChar)  // Definir parámetro de salida
            .execute('REGISTRO_CURSOONLINEWEB');
            return result.output.registro; // Usar el nombre correcto del parámetro de salida
    } catch (error) {
        console.error('Error en registro Online:', error);
        throw error;
    }
}
/*TODA LA LISTA PARA RM VERIFICAR RM*/
static async listaRMTodos(idEmpresa){
    const pool= await connectDB();
    try 
    {  
        const result = await pool.request()              
        .input('idEmpresa', sql.Int, idEmpresa)
        .query(`select idSolRM from solicitudRM where estado='P' and idEmpresa=@idEmpresa`);          
        return result.recordset;
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
static async MODIFICAR_solicitudRM(idSolRM, entrega, url, TipoApto){
    const pool= await connectDB();
    try 
    {   
        const result = await pool.request()       
        .input('idSolRM', sql.Int, idSolRM)
        .input('entrega', sql.DateTime,entrega)
        .input('url', sql.VarChar, url)
        .input('TipoApto', sql.Int, TipoApto)
        .execute('MODIFICAR_solicitudRM');
        return (result.rowsAffected[0])
    } 
    catch (error) 
    {
        console.error('Error en la modificación de datos:', error);
        throw error; // Re-lanzar el error para que pueda ser manejado por el llamador
    }
}
static async updateSessionId(idPassEmpresa, sessionId) {
    try {
      const pool = await connectDB();
      await pool.request()
        .input('idPassEmpresa', sql.Int, idPassEmpresa)
        .input('sessionId', sql.VarChar(255), sessionId)
        .query('UPDATE EmpresaPass SET sessionId = @sessionId WHERE idPassEmpresa = @idPassEmpresa');
    } catch (err) {
      console.error('Error actualizando sessionId:', err);
      throw err;
    }
  }

  static async findById(idPassEmpresa) {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('idPassEmpresa', sql.Int, idPassEmpresa)
        .query('SELECT * FROM EmpresaPass WHERE idPassEmpresa = @idPassEmpresa');
      return result.recordset[0];
    } catch (err) {
      console.error('Error buscando por ID:', err);
      throw err;
    }
  }
}//fin de la clase


module.exports = User;
