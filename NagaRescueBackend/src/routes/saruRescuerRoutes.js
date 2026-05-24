const express = require('express');
const router = express.Router();
const saruRescuerController = require('../controllers/SaruRescuerController');

router.get('/',                          (req, res) => saruRescuerController.getAll(req, res));
router.get('/pending',                   (req, res) => saruRescuerController.getPending(req, res));
router.get('/unit/:unitId',              (req, res) => saruRescuerController.getByUnit(req, res));
router.get('/by-resident/:residentId',   (req, res) => saruRescuerController.getByResident(req, res));
router.get('/:id',                       (req, res) => saruRescuerController.getById(req, res));
router.post('/', (req, res) => saruRescuerController.create(req, res));
router.patch('/:id/activate',            (req, res) => saruRescuerController.activateRescuer(req, res));
router.patch('/:id/decline',             (req, res) => saruRescuerController.declineRescuer(req, res));
router.put('/:id', (req, res) => saruRescuerController.update(req, res));
router.delete('/:id', (req, res) => saruRescuerController.remove(req, res));

module.exports = router;
