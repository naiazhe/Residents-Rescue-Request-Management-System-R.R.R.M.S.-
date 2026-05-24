const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');

router.get('/barangay',                   (req, res) => notificationController.getForBarangay(req, res));
router.get('/resident/:residentId',        (req, res) => notificationController.getForResident(req, res));
router.get('/leader/:unitId',              (req, res) => notificationController.getForLeader(req, res));
router.post('/bump',                       (req, res) => notificationController.bump(req, res));
router.patch('/:id/read',                  (req, res) => notificationController.markRead(req, res));

module.exports = router;
