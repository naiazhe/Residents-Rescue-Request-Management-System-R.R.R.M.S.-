const BaseController = require('./BaseController');
const NotificationModel = require('../models/NotificationModel');

class NotificationController extends BaseController {
    constructor() {
        super(NotificationModel);
    }

    async getForBarangay(req, res) {
        try {
            const rows = await this.model.findByRecipient('barangay', null);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getForResident(req, res) {
        try {
            const rows = await this.model.findByRecipient('resident', req.params.residentId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getForLeader(req, res) {
        try {
            const rows = await this.model.findByRecipient('unit_leader', req.params.unitId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async bump(req, res) {
        try {
            const { unitId, operationLogId, senderName } = req.body;
            if (!unitId || !operationLogId) {
                return this.error(res, 'unitId and operationLogId are required', 400);
            }
            const row = await this.model.create({
                recipient_type:   'unit_leader',
                recipient_id:     unitId,
                message:          `${senderName || 'A member'} flagged mission #${operationLogId} for your attention`,
                operation_log_id: operationLogId,
            });
            return this.success(res, row, 'Leader notified');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async markRead(req, res) {
        try {
            const row = await this.model.markRead(req.params.id);
            if (!row) return this.error(res, 'Notification not found', 404);
            return this.success(res, row, 'Marked as read');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new NotificationController();
