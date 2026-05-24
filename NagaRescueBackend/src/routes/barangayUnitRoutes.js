const express = require('express');
const router = express.Router();
const barangayUnitController = require('../controllers/BarangayUnitController');

router.get('/', (req, res) => barangayUnitController.getAll(req, res));
router.get('/by-code/:code', (req, res) => barangayUnitController.getByTeamCode(req, res));
router.get('/:id', (req, res) => barangayUnitController.getById(req, res));
router.patch('/:id/ensure-code', (req, res) => barangayUnitController.ensureTeamCode(req, res));
router.post('/', (req, res) => barangayUnitController.create(req, res));
router.put('/:id', (req, res) => barangayUnitController.update(req, res));
router.patch('/:id/status', (req, res) => barangayUnitController.updateStatus(req, res));
router.delete('/:id', (req, res) => barangayUnitController.remove(req, res));

module.exports = router;
