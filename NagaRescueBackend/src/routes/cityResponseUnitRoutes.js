const express = require('express');
const router = express.Router();
const cityResponseUnitController = require('../controllers/CityResponseUnitController');

// Named sub-routes before /:id to avoid param conflicts
router.get('/by-code/:code',        (req, res) => cityResponseUnitController.getByTeamCode(req, res));
router.get('/',                     (req, res) => cityResponseUnitController.getAll(req, res));
router.get('/:id',                  (req, res) => cityResponseUnitController.getById(req, res));

router.post('/',                    (req, res) => cityResponseUnitController.create(req, res));

router.patch('/:id/ensure-code',    (req, res) => cityResponseUnitController.ensureTeamCode(req, res));
router.patch('/:id/status',         (req, res) => cityResponseUnitController.updateStatus(req, res));

router.put('/:id',                  (req, res) => cityResponseUnitController.update(req, res));
router.delete('/:id',               (req, res) => cityResponseUnitController.remove(req, res));

module.exports = router;
