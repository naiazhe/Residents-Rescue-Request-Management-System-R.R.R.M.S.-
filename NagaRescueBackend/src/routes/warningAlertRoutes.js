const express = require('express');
const router = express.Router();
const warningAlertController = require('../controllers/WarningAlertController');

router.get('/', (req, res) => warningAlertController.getAll(req, res));
router.get('/operator/:operatorId', (req, res) => warningAlertController.getByOperator(req, res));
router.get('/:id', (req, res) => warningAlertController.getById(req, res));
router.post('/', (req, res) => warningAlertController.create(req, res));
router.delete('/:id', (req, res) => warningAlertController.remove(req, res));

module.exports = router;
