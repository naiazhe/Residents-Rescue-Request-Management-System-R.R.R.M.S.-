const BaseController = require('./BaseController');
const AlertLevelModel = require('../models/AlertLevelModel');

class AlertLevelController extends BaseController {
    constructor() {
        super(AlertLevelModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Alert level created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Alert level not found', 404);
            return this.success(res, row, 'Alert level updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new AlertLevelController();
