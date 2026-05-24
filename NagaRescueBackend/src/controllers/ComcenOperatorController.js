const BaseController = require('./BaseController');
const ComcenOperatorModel = require('../models/ComcenOperatorModel');

class ComcenOperatorController extends BaseController {
    constructor() {
        super(ComcenOperatorModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'ComCen operator created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new ComcenOperatorController();
