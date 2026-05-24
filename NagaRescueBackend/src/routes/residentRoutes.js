const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');

router.get('/', (req, res) => residentController.getAll(req, res));
router.get('/household-heads', (req, res) => residentController.getHouseholdHeadsByBarangay(req, res));
router.get('/household/:householdId/full', (req, res) => residentController.getByHouseholdFull(req, res));
router.get('/household/:householdId', (req, res) => residentController.getByHousehold(req, res));

// Specific sub-resource routes must come before /:id to avoid param conflicts
router.get('/:id/profile', (req, res) => residentController.getProfile(req, res));
router.get('/:id/details', (req, res) => residentController.getWithHousehold(req, res));
router.get('/:id/vulnerabilities', (req, res) => residentController.getVulnerabilities(req, res));
router.get('/:id', (req, res) => residentController.getById(req, res));

router.post('/', (req, res) => residentController.create(req, res));
router.post('/:id/vulnerabilities', (req, res) => residentController.addVulnerability(req, res));

router.put('/:id', (req, res) => residentController.update(req, res));
router.delete('/:id', (req, res) => residentController.remove(req, res));

module.exports = router;
