const express = require('express');
const router = express.Router();
const accountController = require('../controllers/AccountController');

router.get('/pending', (req, res) => accountController.getPending(req, res));
router.get('/verified-residents', (req, res) => accountController.getVerifiedResidents(req, res));
router.get('/registrations', (req, res) => accountController.getAllRegistrations(req, res));
router.get('/', (req, res) => accountController.getAll(req, res));
router.get('/:id', (req, res) => accountController.getById(req, res));
router.put('/:id', (req, res) => accountController.update(req, res));
router.patch('/:id/verify', (req, res) => accountController.verify(req, res));
router.patch('/:id/reject', (req, res) => accountController.reject(req, res));
router.patch('/:id/password', (req, res) => accountController.changePassword(req, res));
router.patch('/:id/push-token', (req, res) => accountController.updatePushToken(req, res));
router.delete('/:id', (req, res) => accountController.remove(req, res));

module.exports = router;
