const BaseController = require('./BaseController');
const RescueReportModel = require('../models/RescueReportModel');

class RescueReportController extends BaseController {
    constructor() {
        super(RescueReportModel);
    }

    async create(req, res) {
        try {
            const { operation_id, outcomes } = req.body;
            if (!operation_id || !Array.isArray(outcomes) || outcomes.length === 0) {
                return this.error(res, 'operation_id and at least one outcome are required', 400);
            }
            const result = await this.model.createWithOutcomes(operation_id, outcomes);
            return this.success(res, result, 'Rescue report saved', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByOperation(req, res) {
        try {
            const rows = await this.model.findByOperation(req.params.operationId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new RescueReportController();
