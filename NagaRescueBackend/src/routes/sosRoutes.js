const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

router.get('/list', (req, res) => sosController.getAll(req, res));
router.get('/forwarded', (req, res) => sosController.getForwarded(req, res));
router.get('/status/:status', (req, res) => sosController.getByStatus(req, res));
router.get('/resident/:residentId', (req, res) => sosController.getByResident(req, res));
router.get('/:id', (req, res) => sosController.getById(req, res));
router.post('/send', (req, res) => sosController.send(req, res));
router.patch('/:id/status', (req, res) => sosController.updateStatus(req, res));
router.patch('/:id/confirm-safe', (req, res) => sosController.confirmSafe(req, res));
router.delete('/:id', (req, res) => sosController.remove(req, res));

module.exports = router;
