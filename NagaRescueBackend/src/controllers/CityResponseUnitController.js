const BaseController = require('./BaseController');
const CityResponseUnitModel = require('../models/CityResponseUnitModel');

class CityResponseUnitController extends BaseController {
    constructor() {
        super(CityResponseUnitModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'City response unit created', 201);
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
            if (!row) return this.error(res, 'SARU unit not found', 404);
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

module.exports = new CityResponseUnitController();
