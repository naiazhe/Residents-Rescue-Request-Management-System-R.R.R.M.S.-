const express = require('express');
const router = express.Router();
const comcenOperatorController = require('../controllers/ComcenOperatorController');

router.get('/', (req, res) => comcenOperatorController.getAll(req, res));
router.get('/:id', (req, res) => comcenOperatorController.getById(req, res));
router.post('/', (req, res) => comcenOperatorController.create(req, res));
router.put('/:id', (req, res) => comcenOperatorController.update(req, res));
router.delete('/:id', (req, res) => comcenOperatorController.remove(req, res));

module.exports = router;
