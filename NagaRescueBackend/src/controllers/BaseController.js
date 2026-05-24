class BaseController {
    constructor(model) {
        this.model = model;
    }

    success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({ success: true, message, data });
    }

    error(res, message = 'Server error', statusCode = 500) {
        return res.status(statusCode).json({ success: false, error: message });
    }

    async getAll(req, res) {
        try {
            const rows = await this.model.findAll();
            return this.success(res, rows);
        } catch (err) {
            console.error(err);
            return this.error(res, err.message);
        }
    }

    async getById(req, res) {
        try {
            const row = await this.model.findById(req.params.id);
            if (!row) return this.error(res, 'Record not found', 404);
            return this.success(res, row);
        } catch (err) {
            console.error(err);
            return this.error(res, err.message);
        }
    }

    async remove(req, res) {
        try {
            const row = await this.model.delete(req.params.id);
            if (!row) return this.error(res, 'Record not found', 404);
            return this.success(res, row, 'Deleted successfully');
        } catch (err) {
            console.error(err);
            return this.error(res, err.message);
        }
    }
}

module.exports = BaseController;
