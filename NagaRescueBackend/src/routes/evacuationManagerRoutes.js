const express = require('express');
const router = express.Router();
const evacuationManagerController = require('../controllers/EvacuationManagerController');

router.get('/pending',                   (req, res) => evacuationManagerController.getPending(req, res));
router.get('/',                           (req, res) => evacuationManagerController.getAll(req, res));
router.get('/by-resident/:residentId',    (req, res) => evacuationManagerController.getByResident(req, res));
router.get('/:id',                        (req, res) => evacuationManagerController.getById(req, res));
router.post('/',                          (req, res) => evacuationManagerController.create(req, res));
router.patch('/:id/approve',              (req, res) => evacuationManagerController.approve(req, res));
router.patch('/:id/decline',              (req, res) => evacuationManagerController.decline(req, res));
router.put('/:id',                        (req, res) => evacuationManagerController.update(req, res));
router.delete('/:id',                     (req, res) => evacuationManagerController.remove(req, res));

module.exports = router;
