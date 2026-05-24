const express = require('express');
const router = express.Router();
const barangayOperatorController = require('../controllers/BarangayOperatorController');

router.get('/pending', (req, res) => barangayOperatorController.getPending(req, res));
router.get('/', (req, res) => barangayOperatorController.getAll(req, res));
router.get('/:id', (req, res) => barangayOperatorController.getById(req, res));
router.post('/', (req, res) => barangayOperatorController.create(req, res));
router.put('/:id', (req, res) => barangayOperatorController.update(req, res));
router.put('/:id/approve', (req, res) => barangayOperatorController.approve(req, res));
router.put('/:id/reject', (req, res) => barangayOperatorController.reject(req, res));
router.delete('/:id', (req, res) => barangayOperatorController.remove(req, res));

module.exports = router;
