const BaseController = require('./BaseController');
const SosRequestModel = require('../models/SosRequestModel');
const AccountModel = require('../models/AccountModel');
const NotificationModel = require('../models/NotificationModel');

class SosController extends BaseController {
    constructor() {
        super(SosRequestModel);
    }

    async getAll(req, res) {
        try {
            const rows = await this.model.findAll();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async send(req, res) {
        try {
            const { residentId, urgencyLevel, latitude, longitude } = req.body;

            const account = await AccountModel.findByResidentId(residentId);
            if (!account) return this.error(res, 'Account not found.', 404);
            if (!account.is_verified) {
                return this.error(res, 'Your account is pending BDRRMC verification. SOS is unavailable until approved.', 403);
            }

            // Resolve the resident's registered barangay → find the matching barangay unit
            const locationRow = await this.model.db.query(
                `SELECT l.barangay_name
                 FROM resident r
                 JOIN household h ON r.household_id = h.household_id
                 JOIN location  l ON h.location_id  = l.location_id
                 WHERE r.resident_id = $1`,
                [residentId]
            );
            const barangayName = locationRow.rows[0]?.barangay_name || null;

            let targetUnit = null;
            if (barangayName) {
                const unitRow = await this.model.db.query(
                    `SELECT barangay_unit_id, unit_name
                     FROM barangay_unit
                     WHERE barangay_name ILIKE $1
                     LIMIT 1`,
                    [barangayName]
                );
                targetUnit = unitRow.rows[0] || null;
            }

            const row = await this.model.create({
                resident_id: residentId,
                urgency_level: urgencyLevel,
                latitude,
                longitude
            });

            return this.success(res, {
                ...row,
                barangay_name:    barangayName,
                barangay_unit_id: targetUnit?.barangay_unit_id || null,
                unit_name:        targetUnit?.unit_name        || null,
            }, 'SOS Request Sent! Help is on the way.', 201);
        } catch (err) {
            return this.error(res, 'Failed to send SOS: ' + err.message);
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const row = await this.model.updateStatus(req.params.id, status);
            if (!row) return this.error(res, 'SOS request not found', 404);
            return this.success(res, row, 'Status updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByStatus(req, res) {
        try {
            const { barangay } = req.query;
            const rows = barangay
                ? await this.model.findByStatusAndBarangay(req.params.status, barangay)
                : await this.model.findByStatus(req.params.status);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getForwarded(req, res) {
        try {
            const rows = await this.model.findForwarded();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByResident(req, res) {
        try {
            const rows = await this.model.findByResident(req.params.residentId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async confirmSafe(req, res) {
        try {
            const row = await this.model.updateStatus(req.params.id, 'Resolved');
            if (!row) return this.error(res, 'SOS request not found', 404);

            await NotificationModel.create({
                recipient_type: 'barangay',
                recipient_id:   null,
                message:        `Resident confirmed safe. SOS #${req.params.id} resolved.`,
            });

            return this.success(res, row, 'You have been marked as safe');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new SosController();
