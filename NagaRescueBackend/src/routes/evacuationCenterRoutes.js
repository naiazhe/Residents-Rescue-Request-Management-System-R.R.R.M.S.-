const express = require('express');
const router = express.Router();
const evacuationCenterController = require('../controllers/EvacuationCenterController');

router.get('/', (req, res) => evacuationCenterController.getAll(req, res));
router.get('/by-manager/:managerId', (req, res) => evacuationCenterController.getByManager(req, res));
router.get('/:id', (req, res) => evacuationCenterController.getById(req, res));
router.post('/', (req, res) => evacuationCenterController.create(req, res));
router.patch('/:id/assign-manager', (req, res) => evacuationCenterController.assignManager(req, res));
router.put('/:id', (req, res) => evacuationCenterController.update(req, res));
router.delete('/:id', (req, res) => evacuationCenterController.remove(req, res));

module.exports = router;
