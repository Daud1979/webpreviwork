const express = require('express');
const homeController = require('../controllers/homeController');
const requireAuth = require('../middlewares/authMiddleware');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.get('/', requireAuth, homeController.index);
router.post('/modificardatosEmpresa',homeController.modifyEmpresa);
router.post('/modificarCentros',homeController.modifyCentros)
router.get('/centrosempresa',homeController.centros);
router.get('/listatrabajadores',homeController.listatrabajadores);
router.get('/personalempresa',homeController.personal);
router.post('/modificarPersonal',homeController.modifyPersonal)
router.post('/cargarPersonalCentro',homeController.cargarPersonalCentro);
router.post('/cargarDocumentoSeleccionPersonalCentro',homeController.cargarDocumentoSeleccionPersonalCentro);
router.post('/obtenerdatosmodificar',homeController.obtenerdatosmodificar);
router.post('/registrarpersonal',homeController.registerpersonal);
router.post('/registrarcentro',homeController.registercenter);
router.post('/mostrarpdfempresa',homeController.mostrarpdfempresa);
router.post('/listadocumentos',homeController.enviarapdf);
router.post('/downloadpdf',homeController.downloadpdf);
router.post('/downloadpdf_',homeController.downloadpdf);
router.post('/downloadpdfTrabajador',homeController.downloadpdftrabajador); //aqui va la empresa
router.post('/downloadpdfEmpresa',homeController.downloadpdfEmpresa);
router.post('/downloadpdfTrabajadorOnline',homeController.downloadpdftrabajadorOnline);
router.post('/uploadpdf', upload.single('pdfFile'), homeController.uploadpdf);
router.post('/uploadpdfconcentimiento', upload.single('pdfFile'), homeController.uploadpdfconcentimiento);
router.post('/uploadpdfautorizacion', upload.single('pdfFile'), homeController.uploadpdfautorizacion);
router.post('/uploadpdfepis', upload.single('pdfFile'), homeController.uploadpdfepis);
//
router.post('/trabajador/informacion',homeController.informationpersonal);
router.post('/trabajador/concentimientorenuncia',homeController.concentimientorenunciapersonal);
router.post('/trabajador/autorizacion',homeController.autorizacion);
router.post('/trabajador/epis',homeController.epis);
router.post('/trabajador/formacion',homeController.formacion);
router.post('/trabajador/reconocimiento',homeController.reconocimientomedico);
router.post('/registrarRM',homeController.registerRM);
router.post('/registrarCursoOnline',homeController.registerCourseOnline);
router.post('/verpdftrabajador',homeController.viewPdfTrabajador);
router.post('/verpdftrabajadorOnline', homeController.viewPdfTrabajadorOnline);
router.post('/enviarmailpdf',homeController.enviarmailpdf);
router.post('/verpdfRMOnline',homeController.verpdfRMOnline);
module.exports = router;
