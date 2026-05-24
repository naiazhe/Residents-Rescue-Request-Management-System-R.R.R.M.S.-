const express = require('express');
const router = express.Router();
const operationLogController = require('../controllers/OperationLogController');

router.get('/', (req, res) => operationLogController.getAll(req, res));
router.get('/sos/:sosId', (req, res) => operationLogController.getBySos(req, res));
router.get('/unit/:unitId', (req, res) => operationLogController.getByUnit(req, res));
router.get('/unit/:unitId/completed', (req, res) => operationLogController.getCompletedByUnit(req, res));
router.get('/:id', (req, res) => operationLogController.getById(req, res));
router.post('/', (req, res) => operationLogController.create(req, res));
router.patch('/:id/accept',     (req, res) => operationLogController.acceptMission(req, res));
router.patch('/:id/complete',   (req, res) => operationLogController.completeMission(req, res));
router.patch('/:id/timestamps', (req, res) => operationLogController.updateTimestamps(req, res));
router.delete('/:id', (req, res) => operationLogController.remove(req, res));

module.exports = router;
