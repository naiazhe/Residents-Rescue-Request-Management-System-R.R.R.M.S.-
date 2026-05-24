const BaseController = require('./BaseController');
const BarangayOperatorModel = require('../models/BarangayOperatorModel');

class BarangayOperatorController extends BaseController {
    constructor() {
        super(BarangayOperatorModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Barangay operator created', 201);
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
            const row = await this.model.approve(req.params.id);
            if (!row) return this.error(res, 'Operator not found', 404);
            return this.success(res, row, 'Operator approved');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async reject(req, res) {
        try {
            const row = await this.model.reject(req.params.id);
            if (!row) return this.error(res, 'Operator not found', 404);
            return this.success(res, row, 'Operator rejected');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new BarangayOperatorController();
