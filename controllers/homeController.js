require('dotenv').config();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Para obtener las carpetas de usuario
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const User = require('../models/User');
/*aqui lo aws*/


exports.index =async (req, res) => {
  userData = await User.findByUsername(req.session.userId);
  gestionData = await User.findGestion();
  res.render('home');
};
exports.modifyEmpresa=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  updateData = await User.modifyEmpresa(datos.direccion,datos.encargado,datos.email,datos.telefono,idEmpresa)
  const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
  res.json({message:mensaje});
}
exports.centros=async (req,res)=>{//enviar a centros
  const idEmpresa = req.session.userId;
  listCentro = await User.listCentroEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('centros',{listCentro}):res.redirect('/');
}
exports.centrospersonal=async (req,res)=>{//enviar a centros
  const idEmpresa = req.session.userId;
  listCentro = await User.listCentroEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('centros',{listCentro,listTrabajadores}):res.redirect('/');
}
exports.personal=async (req,res)=>{//enviar a trabajadores
  const idEmpresa = req.session.userId;
  listCentro = await User.listCentroEmpresa(idEmpresa);
  listPersonal = await User.listTodosTrabajadorEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('personal',{listCentro,listPersonal}):res.redirect('/');
}
exports.modifyCentros=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  updateData = await User.modifyCentros(datos.id,datos.nuevoValor,datos.indexColumna,idEmpresa)
  const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
  res.json({message:mensaje});
}
exports.modifyPersonal=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  updateData = await User.modifyPersonal(datos.id,datos.nuevoValor,datos.indexColumna,idEmpresa)
  const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
  res.json({message:mensaje});
}


exports.cargarPersonalCentro=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  Data = await User.listTodosTrabajadorCentro(datos.valor,idEmpresa)
  res.json(Data);
}

exports.modificarEstadoPersonal=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
 
  updateData = await User.modifyEstadoPersonal(datos.idTrabajador,idEmpresa)
  res.json({message:updateData});
}

exports.registerpersonal = async(req,res)=>{
  const datos =req.body;
  const idEmpresa = req.session.userId;
  const fechaAlta =new Date();
  const estado='H'; ;
  registrar = await User.registrarpersonal(datos.idCentro,datos.NIF,datos.nombres,datos.apellidos,datos.email,datos.telefono,fechaAlta,estado,idEmpresa)
  res.json(registrar);
}

exports.registercenter = async(req,res)=>{
  const {    centro, encargado, ciudad, direccion, telefono, email, personal,codigopostal } =req.body;
  const idEmpresa = req.session.userId;
  registrar = await User.registrarcentro(centro,encargado,ciudad,direccion,codigopostal,telefono,email,personal,idEmpresa)
  res.json(registrar);
}
exports.mostrarpdfempresa = async(req,res)=>{
  const {tipo}=req.body;  
  const idEmpresa = req.session.userId;
  message = await User.mostrarpdf(tipo,idEmpresa);
  (message.length)==0?res.json({confirm:false,message:'NO EXISTEN DOCUMENTOS'}):res.json({confirm:true,message:'SI EXISTEN DATOS'})
}

exports.enviarapdf=async(req,res)=>{
  const {tipo}=req.body;  
  const idEmpresa = req.session.userId;
  message =await User.mostrarpdf(tipo,idEmpresa);
  (req.session.userId>0)? res.render('documentosempresa',message):res.redirect('/');  
}
/*AQUI SE ENVIA DONDE SE DESCARGA*/////////////////////////////////////
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});



exports.downloadpdf = async (req, res) => {
    const id = req.body.id;
    const idEmpresa = req.session.userId;

    // Obtener los datos del archivo desde la base de datos
    const datos = await User.descargarpdf(id, idEmpresa);

    // Validar si `datos` es un arreglo y tiene contenido
    if (!datos || !Array.isArray(datos) || datos.length === 0 || !datos[0].documentoAWS) {
        console.error("Archivo no encontrado o clave de S3 no válida");
        return res.status(404).send('Archivo no encontrado');
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    const s3Key = datos[0].documentoAWS;
    const sanitizedFileName = encodeURIComponent('prueba.pdf'); // Codificación del nombre de archivo

    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
        const response = await s3.send(command);
        const newFileName = "NombrePersonalizado.pdf";
        // Configuración de headers para enviar el archivo como descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);

        // Enviar el archivo como flujo
        response.Body.pipe(res);
    } catch (error) {
        console.error('Error al descargar el archivo desde S3:', error);
        res.status(500).json({ error: 'Error al descargar el archivo' });
    }
};
















// async function downloadFromS3(s3Key, newFileName) {
//   const bucketName = process.env.S3_BUCKET_NAME;
//   const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     },
// });

//   // Directorios de Descargas y Escritorio
//   const downloadsDir = path.join(os.homedir(), 'Downloads');
//   const desktopDir = path.join(os.homedir(), 'Desktop');

//   // Definir el directorio de destino basado en la existencia de la carpeta de Descargas
//   const downloadDir = fs.existsSync(downloadsDir) ? downloadsDir : desktopDir;
//   const filePath = path.join(downloadDir, newFileName);
//   try {
//     const params = { Bucket: bucketName, Key: s3Key };
//     const command = new GetObjectCommand(params);

//     // Obtener el archivo desde S3 como flujo de datos (stream)
//     const response = await s3.send(command);

//     // Guardar el archivo descargado usando un stream
//     await streamPipeline(response.Body, fs.createWriteStream(filePath));
//     console.log(`Archivo descargado y guardado como: ${filePath}`);
//     return true
//   } 
//   catch (error) 
//   {
//     console.error(`Error al descargar el archivo desde S3: ${error.message}`);
//    return false
//   } 
// }



