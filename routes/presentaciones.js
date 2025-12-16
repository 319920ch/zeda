const express = require('express');
const router = express.Router();
const presentacionesController = require('../controllers/presentacionesController');

router.get('/', presentacionesController.getPresentaciones);
router.post('/', presentacionesController.createPresentacion);
router.put('/:id', presentacionesController.updatePresentacion);
router.delete('/:id', presentacionesController.deletePresentacion);
module.exports = router;