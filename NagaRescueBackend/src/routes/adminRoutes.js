const express = require('express');
const router = express.Router();
const admin = require('../controllers/AdminController');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth, requireSuperAdmin);

// Overview
router.get('/dashboard', (req, res) => admin.dashboard(req, res));

// Resident accounts
router.get  ('/accounts',                (req, res) => admin.listAccounts(req, res));
router.patch('/accounts/bulk-approve',   (req, res) => admin.bulkApprove(req, res));
router.patch('/accounts/:id/approve',    (req, res) => admin.approveAccount(req, res));
router.patch('/accounts/:id/reject',     (req, res) => admin.rejectAccount(req, res));
router.patch('/accounts/:id/active',     (req, res) => admin.setAccountActive(req, res));
router.patch('/accounts/:id/password',   (req, res) => admin.resetPassword(req, res));

// Residents
router.get('/residents',       (req, res) => admin.listResidents(req, res));
router.get('/filter-options',  (req, res) => admin.filterOptions(req, res));

// SOS records (read-only resident-centric view)
router.get('/sos', (req, res) => admin.listSos(req, res));

// Analytics
router.get('/analytics/residents-by-barangay', (req, res) => admin.residentsByBarangay(req, res));

module.exports = router;
