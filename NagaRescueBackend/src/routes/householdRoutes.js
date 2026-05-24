const express = require('express');
const router = express.Router();
const householdController = require('../controllers/HouseholdController');

router.get('/', (req, res) => householdController.getAll(req, res));
router.get('/:id', (req, res) => householdController.getById(req, res));
router.get('/:id/details', (req, res) => householdController.getWithLocation(req, res));
router.post('/', (req, res) => householdController.create(req, res));
router.put('/:id', (req, res) => householdController.update(req, res));
router.delete('/:id', (req, res) => householdController.remove(req, res));

module.exports = router;
