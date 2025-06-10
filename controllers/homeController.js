require('dotenv').config();
require("@aws-sdk/crc64-nvme-crt");

const User = require('../models/User');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { S3Client, GetObjectCommand,PutObjectCommand } = require('@aws-sdk/client-s3');
const upload = multer({ dest: 'uploads/' }); 
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Para obtener las carpetas de usuario
const axios = require("axios");
const xml2js = require("xml2js");
const { Console } = require('console');
const idTrabajador_=0;
var https = require('follow-redirects').https;
var { parseStringPromise } = require('xml2js');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");



/*FUNCIONES EXTRAS*/
function validarFecha(fecha) {
  // Verifica que el formato sea YYYY-MM-DD usando una expresión regular
  const regexFecha = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  
  if (!regexFecha.test(fecha)) {
    return false; // Si no cumple el formato, no es válida
  }

  // Verifica si es una fecha real
  const fechaObj = new Date(fecha);
  return fechaObj instanceof Date && !isNaN(fechaObj);
}

exports.index = async (req, res) => {
  try {
    const userData = await User.findByUsername(req.session.userId);
    const idEmpresa = req.session.userId;
    const gestionData = await User.findGestion();

    const listaTodosRM = await User.listaRMTodos(idEmpresa);

    for (const element of listaTodosRM) {
      const codigo = element.idSolRM;
      const urlAPI = `https://prevencionapi.psycotimia.com/prevenApi/estadoSolicitud/${codigo}`;
      
      try {
        const response = await axios.get(urlAPI);

        // Guardamos en variables simples
        const url = response.data.url;
        const TipoApto = response.data.apto;       
        let entrega = response.data.fecha_finalizado;
        if (!entrega) {
          const fechaActual = new Date();
          // Formato YYYY-MM-DD
          entrega = fechaActual.toISOString().split('T')[0];
        }
       
        if (TipoApto !== undefined && TipoApto !== null)         {
        
          await User.MODIFICAR_solicitudRM(codigo, entrega, url, TipoApto);
          
        }
      } catch (error) {
       // console.error(`Error con el código ${codigo}:`, error.message);
      }
    }

    res.render('home', {
      userData,
      gestionData
    });

  } catch (err) {
    console.error('Error general en el controlador:', err.message);
    res.status(500).send('Error en el servidor');
  }
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
      chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const s3 = new S3Client({
region: process.env.AWS_REGION,
credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
},
});

function getFormattedDate() {
const now = new Date();
const year = now.getFullYear(); // Año (yyyy)
const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes (MM)
const day = String(now.getDate()).padStart(2, '0'); // Día (dd)
const hours = String(now.getHours()).padStart(2, '0'); // Horas (HH)
const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutos (mm)
const seconds = String(now.getSeconds()).padStart(2, '0'); // Segundos (ss)

return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function formatFecha(fecha) {
const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0, se suma 1
const anio = fecha.getFullYear(); // Obtiene el año con 4 dígitos

return `${dia}/${mes}/${anio}`;
}
          /*SOLO DIRECCIONAMIENTOS*/
exports.formacion=async(req,res)=>{   
  idTrabajador=0;  
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }
  const idEmpresa = req.session.userId;
  const idDocumento=13;//esto hay que verpa los otros doc  
  const idListaDocumento=67
  const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
  const listDocumentoTrabajadorOnline= await User.listFormacion(idEmpresa,idTrabajador);  
  const listDocumentoTrabajador = await User.listInformacionTrabajador(idEmpresa,idDocumento,idTrabajador); 
  (req.session.userId>0)? res.render('formacion',{listTrabajador,listDocumentoTrabajadorOnline,listDocumentoTrabajador}):res.redirect('/');
}

exports.reconocimientomedico=async(req,res)=>{   
  idTrabajador=0;  
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }
  const idEmpresa = req.session.userId;
  const idDocumento=14;//esto hay que verpa los otros doc  
  const idListaDocumento=63
  const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
  const listDocumentoRM= await User.listRMTrabajador(idEmpresa,idTrabajador);
  const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,idDocumento,idTrabajador,idListaDocumento);  
  (req.session.userId>0)? res.render('reconocimientomedico',{listTrabajador,listDocumentoTrabajador,listDocumentoRM}):res.redirect('/');
}
          
exports.centros=async (req,res)=>{//enviar a centros
  const idEmpresa = req.session.userId;
  listCentro = await User.listCentroEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('centros',{listCentro}):res.redirect('/');
}

exports.listatrabajadores =async(req,res)=>{
const idEmpresa = req.session.userId;
 
  listCentro = await User.listCentroEmpresa(idEmpresa);
  listPersonal = await User.listDocumentosTrabajador(idEmpresa);
  listPuesto = await User.listPuestoEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('listatrabajadores',{listCentro,listPersonal,listPuesto}):res.redirect('/');
}


exports.informationpersonal=async(req,res)=>{   
  idTrabajador=0;  
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }  
  const idEmpresa = req.session.userId;  
  const idDocumento=15;//esto hay que verpa los otros doc    
  const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
  const listDocumento= await User.listInformacion(idEmpresa,idDocumento,idTrabajador_,idTrabajador);
  const listDocumentoTrabajador = await User.listInformacionTrabajador(idEmpresa,idDocumento,idTrabajador); 
  (req.session.userId>0)? res.render('informacion',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');
}

exports.concentimientorenunciapersonal=async(req,res)=>{   
  idTrabajador=0;
  
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }

  const idEmpresa = req.session.userId;
  const idDocumento=14;//esto hay que verpa los otros doc    
  const idListaDocumento=67
  const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
  const listDocumento= await User.listInformacion(idEmpresa,idDocumento,idTrabajador_,idTrabajador);
  const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,idDocumento,idTrabajador,idListaDocumento);    
  (req.session.userId>0)? res.render('concentimientorenuncia',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');
}

exports.autorizacion=async(req,res)=>{   
  idTrabajador=0;
  
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }

  const idEmpresa = req.session.userId;
  const idDocumento=16;//esto hay que verpa los otros doc    
  const idListaDocumento=73
  const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
  const listDocumento= await User.listAutorizacionEpis(idEmpresa,idDocumento,idTrabajador,idListaDocumento);
  const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,idDocumento,idTrabajador,idListaDocumento);    
  (req.session.userId>0)? res.render('autorizacion',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');
}

exports.epis=async(req,res)=>{   
  idTrabajador=0;
  
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }

  const idEmpresa = req.session.userId;
  const idDocumento=16;//esto hay que verpa los otros doc    
  const idListaDocumento=72
  const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
  const listDocumento= await User.listAutorizacionEpis(idEmpresa,idDocumento,idTrabajador,idListaDocumento);
  const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,idDocumento,idTrabajador,idListaDocumento);    
  (req.session.userId>0)? res.render('epis',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');
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
  listPuesto = await User.listPuestoEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('personal',{listCentro,listPersonal,listPuesto}):res.redirect('/');
}

exports.enviarapdf=async(req,res)=>{
  const {tipo}=req.body;  
  const idEmpresa = req.session.userId;
  
  message =await User.mostrarpdf(tipo,idEmpresa);
  (req.session.userId>0)? res.render('documentosempresa',message):res.redirect('/');  
}
          /*AQUI CARGA Y DESCARGA VERIFICAR SI HAY SESION ACTIVA*/
          
exports.downloadpdftrabajador = async (req, res) => {
  const id = req.body.id;
  const idEmpresa = req.session.userId;
  const datos = await User.descargarpdf(id, idEmpresa);

  // Validar si `datos` es un arreglo y tiene contenido
  if (req.session.userId>0)
  {
    if (!datos || !Array.isArray(datos) || datos.length === 0 || !datos[0].documentoAWS) {
    console.error("Archivo no encontrado o clave de S3 no válida");
    return res.status(404).send('Archivo no encontrado');
    }
    
    const bucketName = process.env.S3_BUCKET_NAME; 
    const s3Key = datos[0].documentoAWS;
    const sanitizedFileName = encodeURIComponent(datos[0].documento || 'sinnombrepdf.pdf');
    const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    });
    try {
  // Comando para obtener el objeto desde S3
    const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
    const response = await s3.send(command);
  // Configuración de headers para la descarga del archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
  // Leer el archivo desde el Body del objeto
    const stream = response.Body;
  // Verificar si `stream` es un flujo legible
    if (stream.pipe) {
      stream.pipe(res);
    } else {
      console.error('El cuerpo de la respuesta no es un flujo legible.');
      res.status(500).send('Error al procesar la descarga del archivo.');
    }
    } catch (error) {
    console.error('Error al descargar el archivo desde S3:', error);
    res.status(500).json({ error: 'Error al descargar el archivo' });
    }
  }
  else{
    res.redirect('/');
  }
};
       
exports.downloadpdf = async (req, res) => {
    const id = req.body.id;
    const idEmpresa = req.session.userId;
    const trabajador ='Nombre: '+ req.body.nombre+' '+req.body.apellidos;
    const nie='Dni: '+req.body.nif;
    const fechaActual = new Date(); // Fecha actual
    const fechaFormateada = formatFecha(fechaActual);
    const fechas='Fecha: '+ fechaFormateada;  
    if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
      idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
    }
    else
    {
      idTrabajador=req.body.idTrabajador;
    }
    // Obtener los datos del archivo desde la base de datos
    if (req.session.userId>0)
    {
        const datos = await User.descargarpdf(id, idEmpresa);
        if (!datos || !Array.isArray(datos) || datos.length === 0 || !datos[0].documentoAWS) {
                console.error("Archivo no encontrado o clave de S3 no válida");
                return res.status(404).send('Archivo no encontrado');
        }    
      
        const bucketName = process.env.S3_BUCKET_NAME;
        const s3Key = datos[0].documentoAWS;
        const sanitizedFileName = encodeURIComponent(datos[0].documento || 'nuevopdf.pdf');
        const s3 = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
          });
          try {
                // Descargar el archivo desde S3
            const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
            const response = await s3.send(command);
            // Leer el buffer del archivo
            const pdfBuffer = await streamToBuffer(response.Body);
            // Verificar si el archivo PDF fue descargado correctamente
            if (!pdfBuffer || pdfBuffer.length === 0) {
              throw new Error('El archivo PDF descargado está vacío o es inválido.');
            }
            // Cargar el PDF utilizando pdf-lib
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            // Cargar la fuente en cursiva predeterminada (Helvetica-Oblique)
            const font = await pdfDoc.embedFont('Helvetica-Oblique');
            // Obtener todas las páginas del documento
            const pages = pdfDoc.getPages();   
            // Acceder a la última página
            const lastPage = pages[pages.length - 1];
            // Dibujar el texto al final de la última página
            const textWidth = font.widthOfTextAtSize('Italy', 10);
            lastPage.drawText('Recibido por el trabajador', {
              x: lastPage.getWidth() - textWidth - 350, // Ajusta la posición X para que esté a la derecha
              y: 60,  // Ajusta la posición Y para que esté en la parte inferior
              size: 10,
              font: font,
              color: rgb(0, 0, 0),  // Color negro
              });
              lastPage.drawText(trabajador, {
                x: lastPage.getWidth() - textWidth - 350, // Ajusta la posición X para que esté a la derecha
                y: 45,  // Ajusta la posición Y para que esté en la parte inferior
                size: 10,
                font: font,
                color: rgb(0, 0, 0),  // Color negro
              });
              lastPage.drawText(nie, {
                x: lastPage.getWidth() - textWidth - 350, // Ajusta la posición X para que esté a la derecha
                y: 30,  // Ajusta la posición Y para que esté en la parte inferior
                size: 10,
                font: font,
                color: rgb(0, 0, 0),  // Color negro
              });
              lastPage.drawText(fechas, {
                x: lastPage.getWidth() - textWidth - 350, // Ajusta la posición X para que esté a la derecha
                y: 15,  // Ajusta la posición Y para que esté en la parte inferior
                size: 10,
                font: font,
                color: rgb(0, 0, 0),  // Color negro
              });
              lastPage.drawText('_____________________', {
                x: lastPage.getWidth() - textWidth - 140, // Ajusta la posición X para que esté a la derecha
                y: 30,  // Ajusta la posición Y para que esté en la parte inferior
                size: 10,
                font: font,
                color: rgb(0, 0, 0),  // Color negro
              });
                lastPage.drawText('Firma', {
                x: lastPage.getWidth() - textWidth - 140, // Ajusta la posición X para que esté a la derecha
                y: 15,  // Ajusta la posición Y para que esté en la parte inferior
                size: 10,
                font: font,
                color: rgb(0, 0, 0),  // Color negro
              });
              // Guardar el PDF modificado
              const modifiedPdfBytes = await pdfDoc.save();
              // Crear un archivo temporal para guardar el PDF modificado
              const tempDir = os.tmpdir();
              const tempFilePath = path.join(tempDir, 'modified-pdf.pdf');
              fs.writeFileSync(tempFilePath, modifiedPdfBytes);
              // Leer el archivo PDF modificado
              const modifiedPdfBuffer = fs.readFileSync(tempFilePath);
              // Configurar los headers para la descarga del archivo modificado
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
              // Enviar el PDF modificado como respuesta
               const fecharetorno =await User.registrarDescarga(idTrabajador,id);      
              res.send(modifiedPdfBuffer);
            } catch (error) {
                console.error('Error al procesar el archivo PDF:', error.message);
                res.status(500).json({ error: 'Error al procesar el archivo PDF' });
            }
  }
  else{
    res.redirect('/')
  }
};

// Inicializa el cliente de S3

exports.uploadpdfconcentimiento = async (req, res) => {  
 
  if (req.session.userId > 0) {
    const idTrabajador = req.body.idTrabajadorupload.split('-');
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
      // Verifica que el archivo haya sido cargado
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
      }
      // Generar el nombre del archivo para AWS
      const docAWS = `${getFormattedDate()}.pdf`; // Nombre del archivo en S3
      const idEmpresa = req.session.userId;
      const observacion = req.body.Observacion;
      let fechaAlta = req.body.FAlta;
      const idDocumento = req.body.idDocumentoupload;
      const nombrepdf = req.body.pdfFileName;
      const archivo = req.file;

      // Si no se proporciona `fechaAlta`, usar la fecha actual
      if (!fechaAlta || fechaAlta.trim() === '') {
        fechaAlta = new Date();
      } else {
        fechaAlta = new Date(fechaAlta); // Asegurarse de que sea una instancia de Date
      }
      // Subir los datos al sistema (guardar la información en la base de datos)
      const datosAWS = await User.cargarpdfTrabajador(
        idTrabajador[1],
        idDocumento,
        idEmpresa,
        nombrepdf,
        docAWS,
        observacion,
        fechaAlta
      );

      // Mover el archivo cargado a la ubicación deseada en el servidor (carpeta uploads)
      const nuevaRuta = path.join(__dirname, '../uploads', archivo.originalname);
      fs.renameSync(archivo.path, nuevaRuta);

      // Preparar los parámetros para subir el archivo a S3
      const params = {
        Bucket: bucketName,
        Key: datosAWS.documentoAWS, // Nombre que tendrá el archivo en S3
        Body: fs.createReadStream(nuevaRuta), // Usamos un stream para enviar el archivo a S3
        ContentType: archivo.mimetype, // Tipo MIME del archivo
      };

      // Subir el archivo a S3
      await s3.send(new PutObjectCommand(params));

      // Eliminar el archivo del servidor después de subirlo a S3
      fs.unlinkSync(nuevaRuta);
      const idListaDocumento=67;
      // Consultar listas relacionadas
      const listTrabajador = await User.seleccTrabajador(idEmpresa, idTrabajador[1]);
      const listDocumento = await User.listInformacion(idEmpresa, datosAWS.idDocumento, idTrabajador_); 
      const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa, datosAWS.idDocumento, idTrabajador[1],idListaDocumento);

      // Renderizar la vista o redirigir según el estado de la sesión
      res.render('informacion', { listTrabajador, listDocumento, listDocumentoTrabajador });

    } catch (error) {
      console.error('Error al procesar la carga del archivo:', error.message);
      res.render('errorupload', { idTrabajador }); // Pasar el mensaje de error a la vista
    }
  } else {
    res.redirect('/');
  }
};

exports.uploadpdfautorizacion = async (req, res) => {  
 
  if (req.session.userId > 0) {
    const idTrabajador = req.body.idTrabajadorupload.split('-');
    
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
      // Verifica que el archivo haya sido cargado
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
      }
      // Generar el nombre del archivo para AWS
      const docAWS = `${getFormattedDate()}.pdf`; // Nombre del archivo en S3
      const idEmpresa = req.session.userId;
      const observacion = req.body.Observacion;
      let fechaAlta = req.body.FAlta;
      const idDocumento = req.body.idDocumentoupload;
      const nombrepdf = req.body.pdfFileName;
      const archivo = req.file;

      // Si no se proporciona `fechaAlta`, usar la fecha actual
      if (!fechaAlta || fechaAlta.trim() === '') {
        fechaAlta = new Date();
      } else {
        fechaAlta = new Date(fechaAlta); // Asegurarse de que sea una instancia de Date
      }
      // Subir los datos al sistema (guardar la información en la base de datos)
      const datosAWS = await User.cargarpdfTrabajador(
        idTrabajador[1],
        idDocumento,
        idEmpresa,
        nombrepdf,
        docAWS,
        observacion,
        fechaAlta
      );

      // Mover el archivo cargado a la ubicación deseada en el servidor (carpeta uploads)
      const nuevaRuta = path.join(__dirname, '../uploads', archivo.originalname);
      fs.renameSync(archivo.path, nuevaRuta);

      // Preparar los parámetros para subir el archivo a S3
      const params = {
        Bucket: bucketName,
        Key: datosAWS.documentoAWS, // Nombre que tendrá el archivo en S3
        Body: fs.createReadStream(nuevaRuta), // Usamos un stream para enviar el archivo a S3
        ContentType: archivo.mimetype, // Tipo MIME del archivo
      };

      // Subir el archivo a S3
      await s3.send(new PutObjectCommand(params));

      // Eliminar el archivo del servidor después de subirlo a S3
      fs.unlinkSync(nuevaRuta);
      const idListaDocumento=73;
      const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador[1]);   
      const listDocumento= await User.listAutorizacionEpis(idEmpresa,datosAWS.idDocumento,idTrabajador_,idListaDocumento);    
      const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,datosAWS.idDocumento,idTrabajador[1],idListaDocumento);    
      (req.session.userId>0)? res.render('autorizacion',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');

    } catch (error) {
      console.error('Error al procesar la carga del archivo:', error.message);
      res.render('errorupload', { idTrabajador }); // Pasar el mensaje de error a la vista
    }
  } else {
    res.redirect('/');
  }
};

exports.uploadpdfepis = async (req, res) => {  
 
  if (req.session.userId > 0) {
    const idTrabajador = req.body.idTrabajadorupload.split('-');
    
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
      // Verifica que el archivo haya sido cargado
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
      }
      // Generar el nombre del archivo para AWS
      const docAWS = `${getFormattedDate()}.pdf`; // Nombre del archivo en S3
      const idEmpresa = req.session.userId;
      const observacion = req.body.Observacion;
      let fechaAlta = req.body.FAlta;
      const idDocumento = req.body.idDocumentoupload;
      const nombrepdf = req.body.pdfFileName;
      const archivo = req.file;

      // Si no se proporciona `fechaAlta`, usar la fecha actual
      if (!fechaAlta || fechaAlta.trim() === '') {
        fechaAlta = new Date();
      } else {
        fechaAlta = new Date(fechaAlta); // Asegurarse de que sea una instancia de Date
      }
      // Subir los datos al sistema (guardar la información en la base de datos)
      const datosAWS = await User.cargarpdfTrabajador(
        idTrabajador[1],
        idDocumento,
        idEmpresa,
        nombrepdf,
        docAWS,
        observacion,
        fechaAlta
      );

      // Mover el archivo cargado a la ubicación deseada en el servidor (carpeta uploads)
      const nuevaRuta = path.join(__dirname, '../uploads', archivo.originalname);
      fs.renameSync(archivo.path, nuevaRuta);

      // Preparar los parámetros para subir el archivo a S3
      const params = {
        Bucket: bucketName,
        Key: datosAWS.documentoAWS, // Nombre que tendrá el archivo en S3
        Body: fs.createReadStream(nuevaRuta), // Usamos un stream para enviar el archivo a S3
        ContentType: archivo.mimetype, // Tipo MIME del archivo
      };

      // Subir el archivo a S3
      await s3.send(new PutObjectCommand(params));

      // Eliminar el archivo del servidor después de subirlo a S3
      fs.unlinkSync(nuevaRuta);
      const idListaDocumento=72;
      const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador[1]);   
      const listDocumento= await User.listAutorizacionEpis(idEmpresa,datosAWS.idDocumento,idTrabajador_,idListaDocumento);    
      const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,datosAWS.idDocumento,idTrabajador[1],idListaDocumento);    
      (req.session.userId>0)? res.render('epis',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');

    } catch (error) {
      console.error('Error al procesar la carga del archivo:', error.message);
      res.render('errorupload', { idTrabajador }); // Pasar el mensaje de error a la vista
    }
  } else {
    res.redirect('/');
  }
};

exports.uploadpdf = async (req, res) => {  
  if (req.session.userId > 0) {
    const idTrabajador = req.body.idTrabajadorupload.split('-');
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No se ha seleccionado ningún archivo" });
      }

      const docAWS = `${getFormattedDate()}.pdf`;
      const idEmpresa = req.session.userId;
      const observacion = req.body.Observacion;
      let fechaAlta = req.body.FAlta || new Date();
      const idDocumento = req.body.idDocumentoupload;
      const nombrepdf = req.body.pdfFileName;
      const archivo = req.file;

      fechaAlta = new Date(fechaAlta);

      const datosAWS = await User.cargarpdfTrabajador(
        idTrabajador[1], idDocumento, idEmpresa, nombrepdf, docAWS, observacion, fechaAlta
      );

      const nuevaRuta = path.join(__dirname, '../uploads', archivo.originalname);
      fs.renameSync(archivo.path, nuevaRuta);

      const params = {
        Bucket: bucketName,
        Key: datosAWS.documentoAWS,
        Body: fs.createReadStream(nuevaRuta),
        ContentType: archivo.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      fs.unlinkSync(nuevaRuta);

      const listTrabajador = await User.seleccTrabajador(idEmpresa, idTrabajador[1]);
      const listDocumento = await User.listInformacion(idEmpresa, datosAWS.idDocumento, idTrabajador[1]);
      const listDocumentoTrabajador = await User.listInformacionTrabajador(idEmpresa, datosAWS.idDocumento, idTrabajador[1]);

      // ✅ Enviar JSON en lugar de renderizar vista
      res.json({
        success: true      
      
      });

    } catch (error) {
      console.error("Error al procesar la carga del archivo:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(401).json({ success: false, message: "Sesión no válida" });
  }
};


            /*MODIFICAR Y REGISTRAR AQUI, VERIFICAR SI HAY SESSION ACTIVA*/


exports.modifyEmpresa=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;  
  if (req.session.userId>0)
  {
    const resul= isValidEmail(datos.email);
    if (resul==false)
    {
      const mensaje =`CORREO NO VALIDO`;
      res.json({message:mensaje, error:0});
      return;
    }  
      
    updateData = await User.modifyEmpresa(datos.direccion,datos.encargado,datos.email,datos.telefono,idEmpresa)
    const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
    res.json({message:mensaje, error:1});
  }
  else
  {
    res.redirect('/');
  }
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

exports.modifyCentros=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  
  if (req.session.userId>0)
  {
    if (datos.indexColumna==7)
    {
      const resul= isValidEmail(datos.nuevoValor);
      if (resul==false)
      {
        const mensaje =`CORREO NO VALIDO, NO SE GUARDARA EL CAMBIO`;
        res.json({message:mensaje,estado:1,valorAnterior:req.body.originalValue});
        return;
      }
    }
    else if (datos.indexColumna==8)
    {      
      if (isNaN(datos.nuevoValor)) {
        const mensaje =`NO ES UN NUMERO`;
        res.json({message:mensaje,estado:1,valorAnterior:req.body.originalValue});
        return;
      }
    }
    updateData = await User.modifyCentros(datos.id,datos.nuevoValor,datos.indexColumna,idEmpresa)
    const mensaje =(updateData>0)?1:`SE PRODUJO UN ERROR AL MODIFICAR`;
    res.json({message:mensaje,estado:0,valorAnterior:''});
  }
  else
  {
    res.redirect('/');
  }
}

exports.modifyPersonal=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  baja=datos.Fbaja;
  if (req.session.userId>0)
  {
    /**/
    if(req.body.estado=="H")
    {
      baja=null;
     
    }
    else if (req.body.estado=="D")
    {  
      const fecBa=validarFecha(req.body.Fbaja);  
      
      if(fecBa==false)
      {
        baja=new Date();
      }      
    }
    else if (req.body.estado!='H' || req.body.estado!='D')
    {
      const mensaje =`ESTADO NO VALIDOS`;
      res.json({message:mensaje, error:0});
      return;
    }
    /**/
    const resul= isValidEmail(datos.email);
    if (resul==false)
    {
      const mensaje =`CORREO NO VALIDO`;
      res.json({message:mensaje, error:0});
      return;
    }  
    const fecN=validarFecha(datos.FNac);
    if (fecN==false)
      {
        const mensaje =`FECHA DE NACIMIENTO NO VALIDO`;
        res.json({message:mensaje, error:0});
        return;
    }  
    registro=datos.Fregistro;
    const fec=validarFecha(datos.Fregistro);
    if (fec==false)
    {
      registro= new Date();
    } 
    updateData = await User.modifyPersonal(datos.idCentro,datos.NIF,datos.nombres,datos.apellidos,datos.email,datos.idpuesto,datos.telefono,datos.Fregistro,baja,datos.estado,datos.idTrabajador,idEmpresa,datos.FNac)
    const mensaje =(updateData>0)?1:`SE PRODUJO UN ERROR AL MODIFICAR`;
    res.json({message:mensaje,error:1});
  }
  else
  {
    res.redirect('/');
  }
}

exports.cargarPersonalCentro=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  const isOn = datos.isOn;

  let estado='H';
  (isOn)? estado='H': estado='D';
  
  if (req.session.userId>0)
  {
    Data = await User.listTodosTrabajadorCentro(datos.valor,idEmpresa,estado)
    res.json(Data);
  }
  else
  {
    res.redirect('/');
  }
}

exports.cargarDocumentoSeleccionPersonalCentro=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  const isOn = datos.isOn;
  let estado='H';
  let estadoli='F. Alta';
  (isOn)? estado='H': estado='D';
  (isOn)? estadoli='F. Alta': estadoli='F. Baja';
  if (req.session.userId>0)
  {
    
    Data = await User.cargarDocumentoSeleccionPersonalCentro(datos.valor,idEmpresa,estado);    
   
    res.json({Data,estadoli});
  }
  else
  {
    res.redirect('/');
  }
}

exports.obtenerdatosmodificar=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId; 
  if (req.session.userId>0)
  {
    updateData = await User.obtenerdatosmodificar(datos.idTrabajador,idEmpresa)
    res.json({updateData});
  }
  else{
    res.redirect('/');
  }
}

exports.registerpersonal = async (req, res) => {
  try {
    const datos = req.body;
    const idEmpresa = req.session.userId;
    const estado = 'H';

    if (!idEmpresa || idEmpresa <= 0) {
      return res.redirect('/');
    }

    // Validar el correo electrónico
    if (!isValidEmail(datos.email)) {
      return res.json({ message: 'CORREO NO VÁLIDO', error: 0 });
    }

    // Validar la fecha de nacimiento
    if (!validarFecha(datos.fNac)) {
      return res.json({ message: 'FECHA DE NACIMIENTO NO VÁLIDA', error: 0 });
    }

    // Validar la fecha de registro (si no es válida, usar la fecha actual)
    let registro = validarFecha(datos.Fregistro) ? datos.Fregistro : new Date();
    // Intentar registrar en la base de datos
    const resultadoRegistro = await User.registrarpersonal(
      datos.idCentro,
      datos.NIF,
      datos.nombres,
      datos.apellidos,
      datos.email,
      datos.telefono,
      datos.idpuesto,
      registro,
      estado,
      idEmpresa,
      datos.fNac
    );
    res.json({ resultadoRegistro, error: 1 });

  } catch (error) {
    console.error('Error en registerpersonal:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: 0 });
  }
};


exports.registercenter = async(req,res)=>{
  const {centro, encargado, ciudad, direccion, telefono, email, personal,codigopostal } =req.body;
  const idEmpresa = req.session.userId;
  if (req.session.userId>0)
  {
    if (isNaN(codigopostal)) {
      res.json({ message: "NO ES UN NÚMERO", error: 0 });
      return;
  }
  if (isNaN(personal)) {
    res.json({ message: "NO ES UN NÚMERO", error: 0 });
    return;
  }
    const resul= isValidEmail(email);
    if (resul==false)
    {
      const mensaje =`CORREO NO VALIDO`;
      res.json({message:mensaje, error:0});
      return;
    }     
    registrar = await User.registrarcentro(centro,encargado,ciudad,direccion,codigopostal,telefono,email,personal,idEmpresa)
    res.json({registrar, error:1});
  }
  else
  {
    res.redirect('/');
  }
}

exports.mostrarpdfempresa = async(req,res)=>{
  const {tipo}=req.body;  
  const idEmpresa = req.session.userId;
  if (req.session.userId>0)
  {
    message = await User.mostrarpdf(tipo,idEmpresa);
    (message.length)==0?res.json({confirm:false,message:'NO EXISTEN DOCUMENTOS'}):res.json({confirm:true,message:'SI EXISTEN DATOS'})
  }
  else
  {
    res.redirect('/');
  }
}

exports.downloadpdftrabajadorOnline = async (req, res) => {
  if (!req.session.userId || req.session.userId <= 0) {
    return res.redirect("/");
  }

  const idStudent = req.body.id;
  if (!idStudent) {
    return res.status(400).json({ error: "El ID del estudiante es requerido." });
  }

  try {
    const username = process.env.USERNAMEONLINE;
    const password = process.env.PASSWORDONLINE;
    const key = process.env.KEYONLINE;
    const soapUrl = process.env.SOAP_URL;

    const soapRequest = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header>
          <LoginInfo xmlns="http://prv.org/">
            <username>${username}</username>
            <password>${password}</password>
            <key>${key}</key>
          </LoginInfo>
        </soap:Header>
        <soap:Body>
          <getStudent xmlns="http://prv.org/">
            <idStudent>${idStudent}</idStudent>
            <certificate>1</certificate>
            <test>0</test>
          </getStudent>
        </soap:Body>
      </soap:Envelope>`;
   
    const response = await axios.post(soapUrl, soapRequest, {
      headers: {
        "Content-Type": "text/xml",
        "SOAPAction": "http://prv.org/getStudent",
      },
      responseType: "text",
    });

    // Usar xml2js para analizar la respuesta
    const parser = new xml2js.Parser();
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error("❌ Error al parsear XML:", err);
        return res.status(500).json({ error: "Error al procesar el certificado." });
      }

      try {
        // Extraer el base64 del certificado desde la respuesta
        const base64PDF = result["soap:Envelope"]["soap:Body"][0]["getStudentResponse"][0]["getStudentResult"][0]["Student"][0]["listCertificates"][0]["certificates"][0]["certificates"][0];

        if (!base64PDF) {
          return res.status(404).json({ error: "Certificado no encontrado." });
        }

        // Decodificar el base64 y enviar el archivo PDF al usuario
        const byteCharacters = Buffer.from(base64PDF, "base64");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=certificado.pdf");
        res.send(byteCharacters);

      } catch (error) {
        console.error("❌ Error al procesar el PDF:", error);
        return res.status(500).json({ error: "Error al procesar el certificado." });
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener el PDF:", error);
    res.status(500).json({ error: "Error al descargar el certificado. Inténtalo nuevamente más tarde." });
  }
};



exports.registerRM = async (req, res) => {
  const datos = req.body;
  const idEmpresa = req.session.userId;

  if (idEmpresa > 0) {
    try {
      const updateData = await User.obtenerdatosCourseOnline(datos.idTrabajador, idEmpresa);
      const objidContrato = await User.obtenerContrato(idEmpresa);

      if (updateData[0].estado === 'H') {
        const resultadoRegistro = await User.registrarSolicitudRM(
          datos.idTrabajador,
          idEmpresa,
          objidContrato[0].idContrato
        );

        const { retorno, idSolRMRetorno } = resultadoRegistro;

        if (idSolRMRetorno > 0) {
          const payload = [
            {
              nombre: updateData[0].empresa,
              cif: updateData[0].cifempresa,
              direccion: updateData[0].direccionEmpresa,
              trabajador: {
                cod_solicitud: idSolRMRetorno,
                nombre: updateData[0].nombres,
                apellidos: updateData[0].apellidos,
                dni: updateData[0].nif,
                email: updateData[0].correo,
                puesto: updateData[0].puesto,
                centro: updateData[0].centro
              }
            }
          ];

          try {
            const response = await axios.post(
              'https://prevencionapi.psycotimia.com/prevenApi/datosEmpresa',
              payload,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': process.env.KEYRM
                }
              }
            );          
           
          } catch (error) {
            console.error('Error al enviar datos:', error.message);
            if (error.response) {
              console.error('Código:', error.response.status);
              console.error('Detalles:', error.response.data);
            }
          }
        }

        return res.json({ retorno, message: 'YA SE REALIZO LA PETICION EN DIAS ANTERIORES' });
      } else {
        return res.json({ updateData, message: 'EL TRABAJADOR ESTÁ DE BAJA' });
      }
    } catch (err) {
      console.error('Error general:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    return res.redirect('/');
  }
};


exports.registerCourseOnline=async (req,res)=>{
  const datos = req.body;
  
  const idEmpresa = req.session.userId;    
  if (req.session.userId>0)  {   
    updateData = await User.obtenerdatosCourseOnline(datos.idTrabajador,idEmpresa);  
    updateContrato = await User.obtenerContrato(idEmpresa);    
    verificarTrabajadorCurso = await User.verificarTrabajadorCurso(datos.idTrabajador,idEmpresa,updateContrato[0].idContrato,updateData[0].idCourse);
    if (updateData[0].estado=='H')
    {
      if(Array.isArray( verificarTrabajadorCurso) &&  verificarTrabajadorCurso.length == 0 )
    { 
      /*cargar */           
       
          const idStudent =await registrarAlumnosCurso(updateData[0].nif,updateData[0].nombres,updateData[0].apellidos,updateData[0].correo,updateData[0].telefono,updateData[0].idempresa,updateData[0].empresa,updateData[0].puesto,updateData[0].idCourse,updateContrato[0].idContrato);
          fechadevolver=await User.registroOnline(idEmpresa, updateContrato[0].idContrato,datos.idTrabajador,updateData[0].idCourse,idStudent,updateData[0].Course);
          res.json({message:fechadevolver,error:1});     
      
        /*fin */
      }
      else
      {
        res.json({message:'EL TRABAJADOR YA SE ENCUENTRA REGISTRADO',error:0});
      }
    }
    else
    {
      res.json({message:'EL TRABAJADOR ESTA DE BAJA',error:0});
    }
  }
  else
  {
    res.redirect('/');
  }
}

async function registrarAlumnosCurso(nif, nombres, apellidos, correo, telefono, idempresa, empresa, puesto, idCourse, idContrato) {
  try {
      const username = process.env.USERNAMEONLINE;
      const password = process.env.PASSWORDONLINE;
      const key = process.env.KEYONLINE;
      const idOffice = process.env.OFFICE;
      const soapUrl = 'ws2.curso-online.net';
      const soapPath = '/studentsmanagement2.asmx';
    
      if (!nif || !nombres || !apellidos || !correo || !idempresa || !idCourse) {
          throw new Error("Datos insuficientes para registrar al alumno.");
      }

      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Header>
              <LoginInfo xmlns="http://prv.org/">
                  <username>${username}</username>
                  <password>${password}</password>
                  <key>${key}</key>
              </LoginInfo>
          </soap:Header>
          <soap:Body>
              <addStudent xmlns="http://prv.org/">
                  <idOffice>${idOffice}</idOffice>
                  <DNI>${nif}</DNI>
                  <name>${nombres}</name>
                  <surname>${apellidos}</surname>
                  <email>${correo}</email>
                  <phone>${telefono}</phone>
                  <idCompany>${parseInt(idempresa)}</idCompany>
                  <nameCompany>${empresa}</nameCompany>
                  <idTechnical>0</idTechnical>
                  <technical></technical>
                  <employment>${puesto}</employment>
                  <idCourse>
                      <int>${parseInt(idCourse)}</int>
                  </idCourse>
                  <language>es</language>
                  <sendEMail>true</sendEMail>
                  <sendEMailCC></sendEMailCC>
                  <AttachCertificate>true</AttachCertificate>
                  <midterm>true</midterm>
                  <removeStudent>0</removeStudent>
                  <addicionalFields>
                      <AddFieldsValue>
                          <idField>443</idField>
                          <value>${parseInt(idContrato)}</value>
                          <namefield>Contrato</namefield>
                      </AddFieldsValue>
                      <AddFieldsValue>
                          <idField>561</idField>
                          <value>120</value>
                          <namefield>DURACION</namefield>
                      </AddFieldsValue> 
                  </addicionalFields>
                  <endLockDate></endLockDate>
                  <jobStartDate></jobStartDate>
                  <signature>true</signature>
                  <sendPassword>true</sendPassword>
                  <duplicate>false</duplicate>
                  <urlCallback></urlCallback>
              </addStudent>
          </soap:Body>
      </soap:Envelope>`;

      const options = {
          'method': 'POST',
          'hostname': soapUrl,
          'path': soapPath,
          'headers': {
              'Content-Type': 'text/xml',
              'SOAPAction': 'http://prv.org/addStudent',
          },
          'maxRedirects': 20
      };

      // Promesa para manejar la respuesta de la solicitud SOAP
      return new Promise((resolve, reject) => {
          const reqSOAP = https.request(options, function (res) {
              let chunks = [];

              res.on("data", function (chunk) {
                  chunks.push(chunk);
              });

              res.on("end", function () {
                  let body = Buffer.concat(chunks);
                  const responseBody = body.toString();

                  parseStringPromise(responseBody, { explicitArray: false }).then(parsedResult => {
                      // Verificar si hay un error en la respuesta SOAP
                      const faultCode = parsedResult['soap:Envelope']['soap:Body']['soap:Fault'];
                      if (faultCode) {
                          console.error("❌ Error SOAP:", faultCode['faultstring']);
                          reject("Error SOAP");
                      }

                      // Obtener el idStudent
                      const idStudent = parsedResult["soap:Envelope"]["soap:Body"]["addStudentResponse"]["addStudentResult"]["Student"]["idStudent"];
                      if (!idStudent) {
                          console.error("❌ No se encontró el ID del estudiante en la respuesta.");
                          reject("ID de estudiante no encontrado");
                      }

                      console.log(`✅ Estudiante registrado con ID: ${idStudent}`);
                      resolve(idStudent); // Retornar el idStudent
                  }).catch(err => {
                      console.error("❌ Error al parsear la respuesta:", err.message);
                      reject("Error al parsear la respuesta");
                  });
              });

              res.on("error", function (error) {
                  console.error("❌ Error en la solicitud SOAP:", error.message);
                  reject("Error en la solicitud SOAP");
              });
          });

          reqSOAP.write(soapRequest);
          reqSOAP.end();
      });

  } catch (error) {
      console.error("❌ Error al registrar estudiante:", error.message);
      return null;
  }
}


exports.viewPdfTrabajador = async (req, res) => {
  const id = req.body.id;
  const idEmpresa = req.session.userId;
  const datos = await User.descargarpdf(id, idEmpresa);

  // Validar si `datos` es un arreglo y tiene contenido
  if (req.session.userId>0)
  {
    if (!datos || !Array.isArray(datos) || datos.length === 0 || !datos[0].documentoAWS) {
    console.error("Archivo no encontrado o clave de S3 no válida");
    return res.status(404).send('Archivo no encontrado');
    }
    
    const bucketName = process.env.S3_BUCKET_NAME; 
    const s3Key = datos[0].documentoAWS;
    const sanitizedFileName = encodeURIComponent(datos[0].documento || 'sinnombrepdf.pdf');
    const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    });
    try {
      // Generar URL firmada para visualizar el PDF
      const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // Expira en 5 min
      // Renderizar la vista con la URL firmada
      res.render("visualiazpdf", { pdfUrl: signedUrl, filename: datos[0].documento || "Documento.pdf" });
    } catch (error) {
      console.error('Error al visualizar el archivo desde S3:', error);
      res.status(500).json({ error: 'Error al descargar el archivo' });
    }
  }
  else{
    res.redirect('/');
  }
};

exports.verpdfRMOnline= async (req, res) => {
  if (!req.session.userId || req.session.userId <= 0) {
    return res.redirect("/");
  }
  const datos = req.body.id;
    const nombre = req.body.nombre;
  res.render("visualiazpdfRM", { datos, filename: `Certificado de Reconocimiento Medicos ${nombre}` });
}

exports.viewPdfTrabajadorOnline = async (req, res) => {
  if (!req.session.userId || req.session.userId <= 0) {
    return res.redirect("/");
  }

  const idStudent = req.body.id;
  if (!idStudent) {
    return res.status(400).json({ error: "El ID del estudiante es requerido." });
  }

  try {
    const username = process.env.USERNAMEONLINE;
    const password = process.env.PASSWORDONLINE;
    const key = process.env.KEYONLINE;
    const soapUrl = process.env.SOAP_URL;

    const soapRequest = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Header>
          <LoginInfo xmlns="http://prv.org/">
            <username>${username}</username>
            <password>${password}</password>
            <key>${key}</key>
          </LoginInfo>
        </soap:Header>
        <soap:Body>
          <getStudent xmlns="http://prv.org/">
            <idStudent>${idStudent}</idStudent>
            <certificate>1</certificate>
            <test>0</test>
          </getStudent>
        </soap:Body>
      </soap:Envelope>`;
   
    const response = await axios.post(soapUrl, soapRequest, {
      headers: {
        "Content-Type": "text/xml",
        "SOAPAction": "http://prv.org/getStudent",
      },
      responseType: "text",
    });

    // Usar xml2js para analizar la respuesta
    const parser = new xml2js.Parser();
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error("❌ Error al parsear XML:", err);
        return res.status(500).json({ error: "Error al procesar el certificado." });
      }

      try {
        // Extraer el base64 del certificado desde la respuesta
        const base64PDF = result["soap:Envelope"]["soap:Body"][0]["getStudentResponse"][0]["getStudentResult"][0]["Student"][0]["listCertificates"][0]["certificates"][0]["certificates"][0];

        if (!base64PDF) {
          return res.status(404).json({ error: "Certificado no encontrado." });
        }

        const pdfUrl = `data:application/pdf;base64,${base64PDF}`;

        // Redirigir a la página visualiazpdf.ejs con la URL del PDF
        res.render("visualiazpdf", { pdfUrl, filename: `Certificado de Estudiante ${idStudent}` });

      } catch (error) {
        console.error("❌ Error al procesar el PDF:", error);
        return res.status(500).json({ error: "Error al procesar el certificado." });
      }
    });

  } catch (error) {
    console.error("❌ Error al obtener el PDF:", error);
    res.status(500).json({ error: "Error al descargar el certificado. Inténtalo nuevamente más tarde." });
  }
};

/*fin preventor*/

exports.enviarmailpdf = async (req, res) => {
  const id = req.body.id;
  const idEmpresa = req.session.userId;
  const emailempresa =req.session.email;
  const trabajador = `Nombre: ${req.body.nombre} ${req.body.apellidos}`;
  const nie = `DNI: ${req.body.nif}`;
  const email = req.body.email;
  const tipo =req.body.tipo;
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const fechas = `Fecha: ${fechaFormateada}`;
  if (typeof req.body.idTrabajador === "string" && req.body.idTrabajador.startsWith("PVW-")) {
    idTrabajador = req.body.idTrabajador.split("-")[1]; // Obtiene la parte después del guion
  }
  else
  {
    idTrabajador=req.body.idTrabajador;
  }
  if (req.session.userId > 0) {
    try {
      const datos = await User.descargarpdf(id, idEmpresa);
      if (!datos || !Array.isArray(datos) || datos.length === 0 || !datos[0].documentoAWS) {
       
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      const datosemail =await User.datosenvioemail();
      
      const bucketName = process.env.S3_BUCKET_NAME;
      const s3Key = datos[0].documentoAWS;
      const sanitizedFileName = datos[0].documento.replace(/ /g, " ") || 'documentoenviado.pdf';

      const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      // Descargar el archivo desde S3
      const command = new GetObjectCommand({ Bucket: bucketName, Key: s3Key });
      const response = await s3.send(command);
      const pdfBuffer = await streamToBuffer(response.Body);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('El archivo PDF descargado está vacío o es inválido.');
      }

      // Modificar el PDF con pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const font = await pdfDoc.embedFont('Helvetica-Oblique');
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];

      lastPage.drawText('Recibido por el trabajador', { x: 200, y: 60, size: 10, font, color: rgb(0, 0, 0) });
      lastPage.drawText(trabajador, { x: 200, y: 45, size: 10, font, color: rgb(0, 0, 0) });
      lastPage.drawText(nie, { x: 200, y: 30, size: 10, font, color: rgb(0, 0, 0) });
      lastPage.drawText(fechas, { x: 200, y: 15, size: 10, font, color: rgb(0, 0, 0) });

      const modifiedPdfBytes = await pdfDoc.save();

      // Crear archivo temporal
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, 'modified-pdf.pdf');
      fs.writeFileSync(tempFilePath, modifiedPdfBytes);    
      // Configurar el transporte de nodemailer con DonDominio
      const transporter = nodemailer.createTransport({
        host: datosemail[0].smtpsend,
        port: Number(datosemail[0].puertosend), // Asegura que es un número
        secure: datosemail[0].puertosend === 465, // true solo si es 465
        auth: {
          user: datosemail[0].emailEmpresasend,
          pass: datosemail[0].passsend,
        },
        tls: {
          rejectUnauthorized: false, // Deshabilita verificación estricta de SSL (solo si es necesario)
        },
      });

      // Configurar el correo
      const mailOptions = {
        from: datosemail[0].emailEmpresasend,
        to: email,
        subject: datosemail[0].Asunto,
        text:tipo + ", enviar al email: "+emailempresa+" \n"+ datosemail[0].Body,
        attachments: [
          {
            filename: sanitizedFileName,
            path: tempFilePath,
            contentType: 'application/pdf',
          },
        ],
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);
      const fecharetorno =await User.registrarEnvio(idTrabajador,id);      
      // Responder al frontend
      res.json({ message: 'Correo enviado correctamente',valor:1, fecha:fecharetorno });

    } catch (error) {
   
      res.status(500).json({ message: 'Se produjo un error al enviar el email' ,valor:0});
    }
  } else {
    res.redirect('/');
  }
};



