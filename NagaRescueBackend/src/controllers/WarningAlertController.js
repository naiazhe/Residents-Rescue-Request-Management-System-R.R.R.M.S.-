const BaseController = require('./BaseController');
const WarningAlertModel = require('../models/WarningAlertModel');

class WarningAlertController extends BaseController {
    constructor() {
        super(WarningAlertModel);
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
            return this.success(res, row, 'Warning alert issued', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByOperator(req, res) {
        try {
            const rows = await this.model.findByOperator(req.params.operatorId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new WarningAlertController();
