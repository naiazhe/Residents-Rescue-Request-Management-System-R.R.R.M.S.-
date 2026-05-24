const BaseController = require('./BaseController');
const BarangayUnitModel = require('../models/BarangayUnitModel');

class BarangayUnitController extends BaseController {
    constructor() {
        super(BarangayUnitModel);
    }

    async getAll(req, res) {
        try {
            const { barangay } = req.query;
            const rows = barangay
                ? await this.model.findByBarangay(barangay)
                : await this.model.findAll();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Barangay unit created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Unit not found', 404);
            return this.success(res, row, 'Unit updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const row = await this.model.updateStatus(req.params.id, status);
            if (!row) return this.error(res, 'Unit not found', 404);
            return this.success(res, row, 'Unit status updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByTeamCode(req, res) {
        try {
            const row = await this.model.findByTeamCode(req.params.code);
            if (!row) return this.error(res, 'Team not found', 404);
            return this.success(res, row);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async ensureTeamCode(req, res) {
        try {
            const row = await this.model.ensureTeamCode(req.params.id);
            if (!row) return this.error(res, 'Unit not found', 404);
            return this.success(res, row);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new BarangayUnitController();
