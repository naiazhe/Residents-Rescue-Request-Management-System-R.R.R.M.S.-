const BaseController = require('./BaseController');
const RiskLevelModel = require('../models/RiskLevelModel');

class RiskLevelController extends BaseController {
    constructor() {
        super(RiskLevelModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Risk level created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Risk level not found', 404);
            return this.success(res, row, 'Risk level updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new RiskLevelController();
