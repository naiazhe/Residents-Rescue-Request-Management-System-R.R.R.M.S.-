const express = require('express');
const router = express.Router();
const evacuationLogController = require('../controllers/EvacuationLogController');

router.get('/', (req, res) => evacuationLogController.getAll(req, res));
router.get('/center/:centerId', (req, res) => evacuationLogController.getByCenter(req, res));
router.get('/resident/:residentId', (req, res) => evacuationLogController.getByResident(req, res));
router.get('/:id', (req, res) => evacuationLogController.getById(req, res));
router.post('/checkin', (req, res) => evacuationLogController.checkin(req, res));
router.post('/checkin-household', (req, res) => evacuationLogController.checkinHousehold(req, res));
router.post('/walkin-checkin', (req, res) => evacuationLogController.walkinCheckin(req, res));
router.patch('/:id/checkout', (req, res) => evacuationLogController.checkout(req, res));
router.post('/checkout-household', (req, res) => evacuationLogController.checkoutHousehold(req, res));
router.patch('/:id/status', (req, res) => evacuationLogController.updateStatus(req, res));
router.delete('/:id', (req, res) => evacuationLogController.remove(req, res));

module.exports = router;
