const BaseController = require('./BaseController');
const EvacuationManagerModel = require('../models/EvacuationManagerModel');

class EvacuationManagerController extends BaseController {
    constructor() {
        super(EvacuationManagerModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Evacuation manager created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByResident(req, res) {
        try {
            const row = await this.model.findByResident(req.params.residentId);
            if (!row) return this.error(res, 'Evacuation manager not found', 404);
            return this.success(res, row);
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

    async approve(req, res) {
        try {
            const result = await this.model.approve(req.params.id);
            return this.success(res, result, 'Evacuation manager approved and account verified');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async decline(req, res) {
        try {
            const result = await this.model.decline(req.params.id);
            return this.success(res, result, 'Evacuation manager request declined');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new EvacuationManagerController();
