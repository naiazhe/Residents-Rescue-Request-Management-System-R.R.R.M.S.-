const BaseController = require('./BaseController');
const EvacuationCenterModel = require('../models/EvacuationCenterModel');

class EvacuationCenterController extends BaseController {
    constructor() {
        super(EvacuationCenterModel);
    }

    async getAll(req, res) {
        try {
            const rows = await this.model.findAll();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Evacuation center created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Center not found', 404);
            return this.success(res, row, 'Center updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByManager(req, res) {
        try {
            const row = await this.model.findByManager(req.params.managerId);
            if (!row) return this.error(res, 'No center assigned to this manager', 404);
            return this.success(res, row);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async assignManager(req, res) {
        try {
            const { evac_manager_id } = req.body;
            const row = await this.model.assignManager(req.params.id, evac_manager_id ?? null);
            if (!row) return this.error(res, 'Center not found', 404);
            return this.success(res, row, 'Manager assigned');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new EvacuationCenterController();
