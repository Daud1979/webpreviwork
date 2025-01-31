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
router.get('/personalempresa',homeController.personal);
router.post('/modificarPersonal',homeController.modifyPersonal)
router.post('/cargarPersonalCentro',homeController.cargarPersonalCentro)
router.post('/modificarEstadoPersonal',homeController.modificarEstadoPersonal);
router.post('/registrarpersonal',homeController.registerpersonal);
router.post('/registrarcentro',homeController.registercenter);
router.post('/mostrarpdfempresa',homeController.mostrarpdfempresa);
router.post('/listadocumentos',homeController.enviarapdf);
router.post('/downloadpdf',homeController.downloadpdf);
router.post('/downloadpdf_',homeController.downloadpdf);
router.post('/downloadpdfTrabajador',homeController.downloadpdftrabajador);
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
module.exports = router;
