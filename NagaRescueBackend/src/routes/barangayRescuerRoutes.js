const express = require('express');
const router = express.Router();
const barangayRescuerController = require('../controllers/BarangayRescuerController');

// Named sub-routes must come before /:id to avoid param conflicts
router.get('/pending-leaders',          (req, res) => barangayRescuerController.getPendingLeaders(req, res));
router.get('/pending-barangay',         (req, res) => barangayRescuerController.getLeaderApprovedMembers(req, res));
router.get('/pending-members/:unitId',  (req, res) => barangayRescuerController.getPendingMembers(req, res));
router.get('/by-resident/:residentId',  (req, res) => barangayRescuerController.getByResident(req, res));
router.get('/unit/:unitId',             (req, res) => barangayRescuerController.getByUnit(req, res));
router.get('/unassigned',               (req, res) => barangayRescuerController.getUnassigned(req, res));
router.get('/',                         (req, res) => barangayRescuerController.getAll(req, res));
router.get('/:id',                      (req, res) => barangayRescuerController.getById(req, res));

router.post('/',                        (req, res) => barangayRescuerController.create(req, res));

router.patch('/:id/accept',             (req, res) => barangayRescuerController.acceptMember(req, res));
router.patch('/:id/activate',           (req, res) => barangayRescuerController.activateRescuer(req, res));
router.patch('/:id/decline',            (req, res) => barangayRescuerController.declineRescuer(req, res));
router.patch('/:id/assign-unit',        (req, res) => barangayRescuerController.assignToUnit(req, res));

router.put('/:id',                      (req, res) => barangayRescuerController.update(req, res));
router.delete('/:id',                   (req, res) => barangayRescuerController.remove(req, res));

module.exports = router;
