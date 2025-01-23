require('dotenv').config();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Para obtener las carpetas de usuario
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const User = require('../models/User');
const { PDFDocument, rgb } = require('pdf-lib');
const multer = require('multer');
const idTrabajador_=0;
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

exports.informationpersonal=async(req,res)=>{
   
   const idTrabajador=req.body.idTrabajador;
    const idEmpresa = req.session.userId;
    
    const idDocumento=15;//esto hay que verpa los otros doc    
    const listTrabajador=await User.seleccTrabajador(idEmpresa,idTrabajador);   
    const listDocumento= await User.listInformacion(idEmpresa,idDocumento,idTrabajador_,);
    const listDocumentoTrabajador = await User.listInformacionTrabajador(idEmpresa,idDocumento,idTrabajador);    
    (req.session.userId>0)? res.render('informacion',{listTrabajador,listDocumento,listDocumentoTrabajador}):res.redirect('/');
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

  updateData = await User.modifyPersonal(datos.idCentro,datos.NIF,datos.nombres,datos.apellidos,datos.email,datos.idpuesto,datos.telefono,datos.Fregistro,datos.Fbaja,datos.estado,datos.idTrabajador,idEmpresa)
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
  res.json({updateData});
}

exports.registerpersonal = async(req,res)=>{
  const datos =req.body;
  const idEmpresa = req.session.userId;
  
  const estado='H';
 
  registrar = await User.registrarpersonal(datos.idCentro,datos.NIF,datos.nombres,datos.apellidos,datos.email,datos.telefono,datos.idpuesto,datos.Fregistro,estado,idEmpresa)
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




exports.downloadpdftrabajador = async (req, res) => {
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

    // Obtener el nombre del archivo de la base de datos, con un valor por defecto
    const sanitizedFileName = encodeURIComponent(datos[0].documento || 'nuevopdf.pdf');

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
};

// Función para reemplazar texto en el PDF utilizando PDFTron
async function replaceTextInPdf(pdfBuffer, searchText, replaceText) {
    await PDFNet.initialize(); // Inicializa PDFTron SDK

    // Crear un PDFDoc a partir del buffer
    const pdfDoc = await PDFNet.PDFDoc.createFromBuffer(pdfBuffer);

    // Asegurar que el documento está desbloqueado
    pdfDoc.initSecurityHandler();

    // Reemplazar texto en cada página del PDF
    const pageCount = await pdfDoc.getPageCount();
    for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const textReplace = await PDFNet.ContentReplacer.create();

        // Buscar y reemplazar el texto
        const region = await page.getCropBox(); // Obtener el área de la página
        textReplace.addString(searchText, replaceText);
        await textReplace.process(page);
    }

    // Guardar los cambios en un buffer
    const modifiedPdfBuffer = await pdfDoc.saveMemoryBuffer(
        PDFNet.SDFDoc.SaveOptions.e_linearized
    );

    return modifiedPdfBuffer;
}


const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};


function formatFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0, se suma 1
  const anio = fecha.getFullYear(); // Obtiene el año con 4 dígitos

  return `${dia}/${mes}/${anio}`;
}

//con losdatos al final
exports.downloadpdf = async (req, res) => {
  const id = req.body.id;
  const idEmpresa = req.session.userId;
  const trabajador ='Nombre: '+ req.body.nombre+' '+req.body.apellidos;
  const nie='Dni: '+req.body.nif;
  const fechaActual = new Date(); // Fecha actual
  const fechaFormateada = formatFecha(fechaActual);
  const fechas='Fecha: '+ fechaFormateada;  

// Obtener los datos del archivo desde la base de datos
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
};


/* AQUI SE SUBE********/
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


// Configurar Multer para manejo de archivos
const upload = multer({ dest: 'uploads/' }); // Archivos temporales se guardarán en 'uploads/'


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
exports.uploadpdf = async (req, res) => {
  try {
    // Verifica que el archivo haya sido cargado
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
    }

    // Generar el nombre del archivo para AWS
    const docAWS = `${getFormattedDate()}.pdf`;
    const idEmpresa = req.session.userId;
    const observacion = req.body.Observacion;
    let fechaAlta = req.body.FAlta;

    // Si no se proporciona `fechaAlta`, usar la fecha actual
    if (!fechaAlta || fechaAlta.trim() === '') {
      fechaAlta = new Date();
    } else {
      fechaAlta = new Date(fechaAlta); // Asegurarse de que sea una instancia de Date
    }

    const idTrabajador = req.body.idTrabajadorupload;
    const idDocumento = req.body.idDocumentoupload;
    const nombrepdf = req.body.pdfFileName;
    const archivo = req.file;

    // Subir los datos al sistema
    const datosAWS = await User.cargarpdfTrabajador(
      idTrabajador,
      idDocumento,
      idEmpresa,
      nombrepdf,
      docAWS,
      observacion,
      fechaAlta
    ); 
    // Mover el archivo cargado a la ubicación deseada
    const nuevaRuta = path.join(__dirname, '../uploads', archivo.originalname);
    fs.renameSync(archivo.path, nuevaRuta);
    // Consultar listas relacionadas
    const listTrabajador = await User.seleccTrabajador(idEmpresa, idTrabajador);
    const listDocumento = await User.listInformacion(idEmpresa,  datosAWS.idDocumento, idTrabajador_);
    const listDocumentoTrabajador = await User.listInformacionTrabajador(idEmpresa,  datosAWS.idDocumento, idTrabajador);

    // Renderizar la vista o redirigir según el estado de la sesión
    if (req.session.userId > 0) {
      res.render('informacion', { listTrabajador, listDocumento, listDocumentoTrabajador });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
};
