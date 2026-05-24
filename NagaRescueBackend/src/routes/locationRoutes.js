const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/', (req, res) => locationController.getAll(req, res));
router.get('/:id', (req, res) => locationController.getById(req, res));
router.get('/:id/risks', (req, res) => locationController.getRiskLevels(req, res));
router.post('/', (req, res) => locationController.create(req, res));
router.put('/:id', (req, res) => locationController.update(req, res));
router.delete('/:id', (req, res) => locationController.remove(req, res));

module.exports = router;
