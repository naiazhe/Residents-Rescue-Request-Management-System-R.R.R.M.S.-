const BaseController = require('./BaseController');
const OperationLogModel = require('../models/OperationLogModel');
const NotificationModel = require('../models/NotificationModel');
const SosRequestModel = require('../models/SosRequestModel');
const AccountModel = require('../models/AccountModel');
const { sendPush } = require('../utils/pushNotification');

class OperationLogController extends BaseController {
    constructor() {
        super(OperationLogModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Operation log created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async updateTimestamps(req, res) {
        try {
            const row = await this.model.updateTimestamps(req.params.id, req.body);
            if (!row) return this.error(res, 'Operation log not found', 404);
            return this.success(res, row, 'Timestamps updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getBySos(req, res) {
        try {
            const rows = await this.model.findBySos(req.params.sosId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByUnit(req, res) {
        try {
            const rows = await this.model.findByUnit(req.params.unitId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getCompletedByUnit(req, res) {
        try {
            const rows = await this.model.findCompletedByUnit(req.params.unitId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async acceptMission(req, res) {
        try {
            const log = await this.model.findForAccept(req.params.id);
            if (!log) return this.error(res, 'Operation log not found', 404);

            const unitName = log.unit_name || 'Rescue Unit';

            await Promise.all([
                SosRequestModel.updateStatus(log.sos_id, 'Accepted'),
                NotificationModel.create({
                    recipient_type:   'barangay',
                    recipient_id:     null,
                    message:          `${unitName} has accepted the Rescue`,
                    operation_log_id: log.operation_id,
                }),
                NotificationModel.create({
                    recipient_type:   'resident',
                    recipient_id:     log.resident_id,
                    message:          `${unitName} is on their way!`,
                    operation_log_id: log.operation_id,
                }),
            ]);

            // Send push notifications (fire-and-forget — don't block response)
            const residentAccount = await AccountModel.findByResidentId(log.resident_id);
            if (residentAccount) {
                const token = await AccountModel.getPushToken(residentAccount.account_id);
                sendPush(token, 'Help is coming!', `${unitName} is on their way!`);
            }

            return this.success(res, {}, 'Mission accepted');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async completeMission(req, res) {
        try {
            const log = await this.model.findForAccept(req.params.id);
            if (!log) return this.error(res, 'Operation log not found', 404);

            // Two-factor completion: set to PendingCompletion, wait for resident to confirm safe
            await SosRequestModel.updateStatus(log.sos_id, 'PendingCompletion');

            await NotificationModel.create({
                recipient_type:   'resident',
                recipient_id:     log.resident_id,
                message:          'Your rescue team has completed the mission. Please confirm you are safe.',
                operation_log_id: log.operation_id,
            });

            const residentAccount = await AccountModel.findByResidentId(log.resident_id);
            if (residentAccount) {
                const token = await AccountModel.getPushToken(residentAccount.account_id);
                sendPush(
                    token,
                    'Are you safe?',
                    'Your rescue team has completed the mission. Please confirm you are safe by tapping "I am Safe" in the app.',
                    { type: 'verify-safe', sosId: log.sos_id, operationLogId: log.operation_id }
                );
            }

            return this.success(res, {}, 'Mission pending resident confirmation');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new OperationLogController();
