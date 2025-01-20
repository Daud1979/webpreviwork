const express = require('express');
const homeController = require('../controllers/homeController');
const requireAuth = require('../middlewares/authMiddleware');
const router = express.Router();

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
//
router.post('/informacionpersonal',homeController.informationpersonal);
module.exports = router;
