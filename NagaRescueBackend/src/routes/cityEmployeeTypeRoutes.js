const express = require('express');
const router = express.Router();
const cityEmployeeTypeController = require('../controllers/CityEmployeeTypeController');

router.get('/', (req, res) => cityEmployeeTypeController.getAll(req, res));
router.get('/:id', (req, res) => cityEmployeeTypeController.getById(req, res));
router.post('/', (req, res) => cityEmployeeTypeController.create(req, res));
router.put('/:id', (req, res) => cityEmployeeTypeController.update(req, res));
router.delete('/:id', (req, res) => cityEmployeeTypeController.remove(req, res));

module.exports = router;
