const BaseController = require('./BaseController');
const HouseholdModel = require('../models/HouseholdModel');

class HouseholdController extends BaseController {
    constructor() {
        super(HouseholdModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Household created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Household not found', 404);
            return this.success(res, row, 'Household updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getWithLocation(req, res) {
        try {
            const row = await this.model.findWithLocation(req.params.id);
            if (!row) return this.error(res, 'Household not found', 404);
            return this.success(res, row);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new HouseholdController();
