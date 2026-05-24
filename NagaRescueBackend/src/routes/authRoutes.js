const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register',              (req, res) => authController.register(req, res));
router.post('/register-leader',       (req, res) => authController.registerLeader(req, res));
router.post('/register-member',       (req, res) => authController.registerMember(req, res));
router.post('/register-saru-leader',  (req, res) => authController.registerSaruLeader(req, res));
router.post('/register-saru-member',  (req, res) => authController.registerSaruMember(req, res));
router.post('/register-evac-manager', (req, res) => authController.registerEvacManager(req, res));
router.post('/register-operator',     (req, res) => authController.registerOperator(req, res));
router.post('/register-comcen',       (req, res) => authController.registerComcen(req, res));
router.post('/login',                 (req, res) => authController.login(req, res));

module.exports = router;
