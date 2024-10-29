const express = require('express');
const homeController = require('../controllers/homeController');
const requireAuth = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', requireAuth, homeController.index);
router.post('/modificardatosEmpresa',homeController.modifyEmpresa);
router.get('/centrosempresa',homeController.centros);
module.exports = router;
