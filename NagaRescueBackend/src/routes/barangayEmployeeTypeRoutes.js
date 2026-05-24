const express = require('express');
const router = express.Router();
const barangayEmployeeTypeController = require('../controllers/BarangayEmployeeTypeController');

router.get('/', (req, res) => barangayEmployeeTypeController.getAll(req, res));
router.get('/:id', (req, res) => barangayEmployeeTypeController.getById(req, res));
router.post('/', (req, res) => barangayEmployeeTypeController.create(req, res));
router.put('/:id', (req, res) => barangayEmployeeTypeController.update(req, res));
router.delete('/:id', (req, res) => barangayEmployeeTypeController.remove(req, res));

module.exports = router;
