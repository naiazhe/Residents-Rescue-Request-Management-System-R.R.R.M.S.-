const BaseController = require('./BaseController');
const BarangayEmployeeTypeModel = require('../models/BarangayEmployeeTypeModel');

class BarangayEmployeeTypeController extends BaseController {
    constructor() {
        super(BarangayEmployeeTypeModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Barangay employee type created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Employee type not found', 404);
            return this.success(res, row, 'Employee type updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new BarangayEmployeeTypeController();
