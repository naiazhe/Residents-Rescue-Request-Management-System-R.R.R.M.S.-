const express = require('express');
const router = express.Router();
const riskLevelController = require('../controllers/RiskLevelController');

router.get('/', (req, res) => riskLevelController.getAll(req, res));
router.get('/:id', (req, res) => riskLevelController.getById(req, res));
router.post('/', (req, res) => riskLevelController.create(req, res));
router.put('/:id', (req, res) => riskLevelController.update(req, res));
router.delete('/:id', (req, res) => riskLevelController.remove(req, res));

module.exports = router;
