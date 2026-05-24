const BaseController = require('./BaseController');
const AccountModel = require('../models/AccountModel');
const bcrypt = require('bcrypt');

class AccountController extends BaseController {
    constructor() {
        super(AccountModel);
    }

    async getPending(req, res) {
        try {
            const barangay = req.query.barangay || null;
            const rows = await this.model.findPending(barangay);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getAllRegistrations(req, res) {
        try {
            const rows = await this.model.findAllRegistrations();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getVerifiedResidents(req, res) {
        try {
            const barangay = req.query.barangay || null;
            const rows = await this.model.findVerifiedResidents(barangay);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async reject(req, res) {
        try {
            const row = await this.model.reject(req.params.id);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Account rejected');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Account updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async verify(req, res) {
        try {
            const row = await this.model.verify(req.params.id);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Account verified');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return this.error(res, 'currentPassword and newPassword are required', 400);
            }
            if (newPassword.length < 8) {
                return this.error(res, 'New password must be at least 8 characters', 400);
            }
            // Fetch full account row (includes password hash)
            const account = await this.model.findById(req.params.id);
            if (!account) return this.error(res, 'Account not found', 404);

            // Need password hash — findById strips it, so query raw
            const raw = await this.model.db.query(
                `SELECT password FROM account WHERE account_id = $1`, [req.params.id]
            );
            const hash = raw.rows[0]?.password;
            const match = hash ? await bcrypt.compare(currentPassword, hash) : false;
            if (!match) return this.error(res, 'Current password is incorrect', 401);

            const hashed = await bcrypt.hash(newPassword, 10);
            const row = await this.model.updatePassword(req.params.id, hashed);
            return this.success(res, row, 'Password changed successfully');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async updatePushToken(req, res) {
        try {
            const { expo_push_token } = req.body;
            if (!expo_push_token) return this.error(res, 'expo_push_token is required', 400);
            const row = await this.model.updatePushToken(req.params.id, expo_push_token);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Push token updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new AccountController();
