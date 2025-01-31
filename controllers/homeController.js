require('dotenv').config();
const User = require('../models/User');
const multer = require('multer');
const { S3Client, GetObjectCommand,PutObjectCommand } = require('@aws-sdk/client-s3');
const upload = multer({ dest: 'uploads/' }); 
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Para obtener las carpetas de usuario
const axios = require("axios");
const xml2js = require("xml2js");
const idTrabajador_=0;

/*FUNCIONES EXTRAS*/
exports.index =async (req, res) => {
  userData = await User.findByUsername(req.session.userId);
  gestionData = await User.findGestion();
  res.render('home');
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
  //const listDocumentoTrabajadorOnline= await User.listFormacion(idEmpresa,idTrabajador);  
  const listDocumentoTrabajador = await User.listConcentimientoTrabajador(idEmpresa,idDocumento,idTrabajador,idListaDocumento);  
  (req.session.userId>0)? res.render('reconocimientomedico',{listTrabajador,listDocumentoTrabajador}):res.redirect('/');
}

          
exports.centros=async (req,res)=>{//enviar a centros
  const idEmpresa = req.session.userId;
  listCentro = await User.listCentroEmpresa(idEmpresa);
  (req.session.userId>0)? res.render('centros',{listCentro}):res.redirect('/');
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
  const listDocumento= await User.listInformacion(idEmpresa,idDocumento,idTrabajador_,);
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
  const listDocumento= await User.listInformacion(idEmpresa,idDocumento,idTrabajador_,);
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
  const listDocumento= await User.listAutorizacionEpis(idEmpresa,idDocumento,idTrabajador_,idListaDocumento);
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
  const listDocumento= await User.listAutorizacionEpis(idEmpresa,idDocumento,idTrabajador_,idListaDocumento);
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

      // Consultar listas relacionadas
      const listTrabajador = await User.seleccTrabajador(idEmpresa, idTrabajador[1]);
      const listDocumento = await User.listInformacion(idEmpresa, datosAWS.idDocumento, idTrabajador_);
      const listDocumentoTrabajador = await User.listInformacionTrabajador(idEmpresa, datosAWS.idDocumento, idTrabajador[1]);

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

  

          /*MODIFICAR Y REGISTRAR AQUI, VERIFICAR SI HAY SESSION ACTIVA*/
exports.registerRM=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;  
  
  if (req.session.userId>0)
  {
    
    updateData = await User.registrarSolicitudRM(req.body.idTrabajador,req.session.userId)
    console.log(updateData);
    res.json(updateData);
  }
  else
  {
    res.redirect('/');
  }
  //
}

exports.modifyEmpresa=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;  
  if (req.session.userId>0)
  {
    updateData = await User.modifyEmpresa(datos.direccion,datos.encargado,datos.email,datos.telefono,idEmpresa)
    const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
    res.json({message:mensaje});
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
        res.json({message:mensaje,estado:1});
        return;
      }
    }
    updateData = await User.modifyCentros(datos.id,datos.nuevoValor,datos.indexColumna,idEmpresa)
    const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
    res.json({message:mensaje,estado:0});
  }
  else
  {
    res.redirect('/');
  }
}

exports.modifyPersonal=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  if (req.session.userId>0)
  {
    updateData = await User.modifyPersonal(datos.idCentro,datos.NIF,datos.nombres,datos.apellidos,datos.email,datos.idpuesto,datos.telefono,datos.Fregistro,datos.Fbaja,datos.estado,datos.idTrabajador,idEmpresa)
    const mensaje =(updateData>0)?true:`SE PRODUJO UN ERROR AL MODIFICAR`;
    res.json({message:mensaje});
  }
  else
  {
    res.redirect('/');
  }
}

exports.cargarPersonalCentro=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId;
  if (req.session.userId>0)
  {
    Data = await User.listTodosTrabajadorCentro(datos.valor,idEmpresa)
    res.json(Data);
  }
  else
  {
    res.redirect('/');
  }
}

exports.modificarEstadoPersonal=async(req,res)=>{
  const datos = req.body;
  const idEmpresa = req.session.userId; 
  if (req.session.userId>0)
  {
    updateData = await User.modifyEstadoPersonal(datos.idTrabajador,idEmpresa)
    res.json({updateData});
  }
  else{
    res.redirect('/');
  }
}

exports.registerpersonal = async(req,res)=>{
  const datos =req.body;
  const idEmpresa = req.session.userId;  
  const estado='H'; 
  
  if (req.session.userId>0)
  {
    registrar = await User.registrarpersonal(datos.idCentro,datos.NIF,datos.nombres,datos.apellidos,datos.email,datos.telefono,datos.idpuesto,datos.Fregistro,estado,idEmpresa,datos.fNac)
    res.json(registrar);
  }
  else
  {
    res.redirect('/');
  }
}

exports.registercenter = async(req,res)=>{
  const {    centro, encargado, ciudad, direccion, telefono, email, personal,codigopostal } =req.body;
  const idEmpresa = req.session.userId;
  if (req.session.userId>0)
  {
    registrar = await User.registrarcentro(centro,encargado,ciudad,direccion,codigopostal,telefono,email,personal,idEmpresa)
    res.json(registrar);
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

    console.log("📢 Enviando solicitud SOAP...");

    const response = await axios.post(soapUrl, soapRequest, {
      headers: {
        "Content-Type": "text/xml",
        "SOAPAction": "http://prv.org/getStudent",
      },
      responseType: "text",
    });

    console.log("📢 Respuesta XML recibida:");
    console.log(response.data);

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












// exports.downloadpdftrabajadorOnline = async (req, res) => {

//   if (!req.session.userId || req.session.userId <= 0) {
//     return res.redirect("/");
//   }

//   const idStudent = req.body.id;
//   if (!idStudent) {
//     return res.status(400).json({ error: "El ID del estudiante es requerido." });
//   }

//   try {
//     const username = process.env.USERNAMEONLINE;
//     const password = process.env.PASSWORDONLINE;
//     const key = process.env.KEYONLINE;
//     const soapUrl = process.env.SOAP_URL;

//     const soapRequest = `
//       <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
//                      xmlns:xsd="http://www.w3.org/2001/XMLSchema"
//                      xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
//         <soap:Header>
//           <LoginInfo xmlns="http://prv.org/">
//             <username>${username}</username>
//             <password>${password}</password>
//             <key>${key}</key>
//           </LoginInfo>
//         </soap:Header>
//         <soap:Body>
//           <getStudent xmlns="http://prv.org/">
//             <idStudent>${idStudent}</idStudent>
//             <certificate>1</certificate>
//             <test>0</test>
//           </getStudent>
//         </soap:Body>
//       </soap:Envelope>`;

//     console.log("📢 Enviando solicitud SOAP...");

//     const response = await axios.post(soapUrl, soapRequest, {
//       headers: {
//         "Content-Type": "text/xml",
//         "SOAPAction": "http://prv.org/getStudent",
//       },
//       responseType: "text",
//     });

//     console.log("📢 Respuesta XML recibida:");
//     console.log(response.data);
 
//   } catch (error) {
//     console.error("❌ Error al obtener el PDF:", error);
//     res.status(500).json({ error: "Error al descargar el certificado. Inténtalo nuevamente más tarde." });
//   }
// };







//aqui la muestra
// exports.downloadpdftrabajadorOnline = async (req, res) => {
//   if (!req.session.userId || req.session.userId <= 0) {
//     return res.redirect("/");
//   }

//   const idStudent = req.body.id;
//   if (!idStudent) {
//     return res.status(400).json({ error: "El ID del estudiante es requerido." });
//   }
//     const username = process.env.USERNAMEONLINE;
//     const password = process.env.PASSWORDONLINE;
//     const key = process.env.KEYONLINE;   
//     var data = `<?xml version="1.0" encoding="utf-8"?>
// <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
//   <soap:Header>
//     <LoginInfo xmlns="http://prv.org/">
//       <username>${username}</username>
//       <password>${password}</password>
//       <key>${key}</key>
//     </LoginInfo>
//   </soap:Header>
//  <soap:Body>
// 		<getStudent xmlns="http://prv.org/">
//       <idStudent>${idStudent}</idStudent>
//       <certificate>1</certificate>
//       <test>0</test>
//     </getStudent>
//   </soap:Body>
// </soap:Envelope>`
    
//     var config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://ws2.curso-online.net/studentsmanagement2.asmx',
//       headers: { 
//         'Content-Type': 'text/xml'
//       },
//       data : data
//     };
    
//     axios(config)
//     .then(function (response) {
//       console.log('si');
//       console.log(JSON.stringify(response.data));
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
    
 
 
// };