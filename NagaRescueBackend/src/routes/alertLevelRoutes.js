const express = require('express');
const router = express.Router();
const alertLevelController = require('../controllers/AlertLevelController');

router.get('/', (req, res) => alertLevelController.getAll(req, res));
router.get('/:id', (req, res) => alertLevelController.getById(req, res));
router.post('/', (req, res) => alertLevelController.create(req, res));
router.put('/:id', (req, res) => alertLevelController.update(req, res));
router.delete('/:id', (req, res) => alertLevelController.remove(req, res));

module.exports = router;
