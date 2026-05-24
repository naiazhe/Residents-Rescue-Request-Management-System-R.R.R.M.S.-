const express = require('express');
const router = express.Router();
const rescueReportController = require('../controllers/RescueReportController');

router.post('/', (req, res) => rescueReportController.create(req, res));
router.get('/operation/:operationId', (req, res) => rescueReportController.getByOperation(req, res));

module.exports = router;
