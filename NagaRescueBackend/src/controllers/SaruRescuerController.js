const BaseController = require('./BaseController');
const SaruRescuerModel = require('../models/SaruRescuerModel');

class SaruRescuerController extends BaseController {
    constructor() {
        super(SaruRescuerModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'SARU rescuer created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Rescuer not found', 404);
            return this.success(res, row, 'Rescuer updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByUnit(req, res) {
        try {
            const rows = await this.model.findByUnit(req.params.unitId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByResident(req, res) {
        try {
            const row = await this.model.findByResident(req.params.residentId);
            return this.success(res, row || null);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getPending(req, res) {
        try {
            const rows = await this.model.findPending();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async activateRescuer(req, res) {
        try {
            const result = await this.model.activate(req.params.id);
            return this.success(res, result, 'SARU rescuer activated and account verified');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async declineRescuer(req, res) {
        try {
            const row = await this.model.updateStatus(req.params.id, 'Declined');
            if (!row) return this.error(res, 'Rescuer not found', 404);
            return this.success(res, row, 'SARU rescuer declined');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new SaruRescuerController();
