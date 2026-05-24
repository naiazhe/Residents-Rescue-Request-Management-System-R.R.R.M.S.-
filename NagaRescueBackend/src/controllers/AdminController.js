const bcrypt = require('bcrypt');
const BaseController = require('./BaseController');
const AccountModel = require('../models/AccountModel');
const db = require('../config/Database');

class AdminController extends BaseController {
    constructor() {
        super(AccountModel);
    }

    // ── Resident-focused overview ─────────────────────────────────────────
    async dashboard(req, res) {
        try {
            const [residents, pending, verified, disabled, sosTotal, sosActive] = await Promise.all([
                db.query(`SELECT COUNT(*)::int AS total FROM resident`),
                db.query(`SELECT COUNT(*)::int AS total FROM account
                          WHERE role = 'resident' AND is_verified = false AND is_active = true`),
                db.query(`SELECT COUNT(*)::int AS total FROM account
                          WHERE role = 'resident' AND is_verified = true  AND is_active = true`),
                db.query(`SELECT COUNT(*)::int AS total FROM account
                          WHERE role = 'resident' AND is_active = false`),
                db.query(`SELECT COUNT(*)::int AS total FROM sos_request`),
                db.query(`SELECT COUNT(*)::int AS total FROM sos_request
                          WHERE status::text NOT IN ('Resolved','Cancelled','Safe','Completed','Closed')`),
            ]);

            return this.success(res, {
                totalResidents:    residents.rows[0].total,
                pendingResidents:  pending.rows[0].total,
                verifiedResidents: verified.rows[0].total,
                disabledResidents: disabled.rows[0].total,
                totalSos:          sosTotal.rows[0].total,
                activeSos:         sosActive.rows[0].total,
            });
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    // ── Accounts (resident scope enforced by query filter) ────────────────
    async listAccounts(req, res) {
        try {
            const { status, q } = req.query;
            // Resident-only admin: always restrict to role='resident'.
            const params = ['resident'];
            const where  = ['a.role = $1'];

            if (status === 'pending')  where.push(`a.is_verified = false AND a.is_active = true`);
            if (status === 'verified') where.push(`a.is_verified = true  AND a.is_active = true`);
            if (status === 'disabled') where.push(`a.is_active = false`);
            if (q) {
                params.push(`%${q}%`);
                where.push(`(a.username ILIKE $${params.length}
                          OR r.first_name ILIKE $${params.length}
                          OR r.last_name  ILIKE $${params.length})`);
            }

            const sql = `
                SELECT a.account_id, a.username, a.role, a.is_active, a.is_verified, a.date_created,
                       r.resident_id, r.first_name, r.middle_name, r.last_name,
                       r.sex, r.birthdate, r.mobile_number,
                       l.barangay_name, l.city_name, l.street_name
                FROM account a
                LEFT JOIN resident r  ON a.resident_id = r.resident_id
                LEFT JOIN household h ON r.household_id = h.household_id
                LEFT JOIN location l  ON h.location_id = l.location_id
                WHERE ${where.join(' AND ')}
                ORDER BY a.date_created DESC
            `;
            const r = await db.query(sql, params);
            return this.success(res, r.rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async approveAccount(req, res) {
        try {
            const row = await AccountModel.verify(req.params.id);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Account approved');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async bulkApprove(req, res) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return this.error(res, 'ids array is required', 400);
            }
            const results = [];
            for (const id of ids) {
                try {
                    const row = await AccountModel.verify(id);
                    results.push(row ? { id, ok: true } : { id, ok: false, error: 'not found' });
                } catch (err) {
                    results.push({ id, ok: false, error: err.message });
                }
            }
            return this.success(res, results, 'Bulk approve finished');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async rejectAccount(req, res) {
        try {
            const row = await AccountModel.reject(req.params.id);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Account rejected/disabled');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async setAccountActive(req, res) {
        try {
            const { is_active } = req.body;
            const r = await db.query(
                `UPDATE account SET is_active=$1 WHERE account_id=$2
                 RETURNING account_id, username, role, is_active, is_verified`,
                [!!is_active, req.params.id]
            );
            if (!r.rows[0]) return this.error(res, 'Account not found', 404);
            return this.success(res, r.rows[0]);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async resetPassword(req, res) {
        try {
            const { password } = req.body;
            if (!password || password.length < 6) {
                return this.error(res, 'Password must be at least 6 characters', 400);
            }
            const hashed = await bcrypt.hash(password, 10);
            const row = await AccountModel.updatePassword(req.params.id, hashed);
            if (!row) return this.error(res, 'Account not found', 404);
            return this.success(res, row, 'Password reset');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    // ── Residents (joined with location + vulnerabilities) ────────────────
    async listResidents(req, res) {
        try {
            const { q, barangay, sex } = req.query;
            const params = [];
            const where  = [];

            if (barangay) { params.push(barangay); where.push(`l.barangay_name = $${params.length}`); }
            if (sex)      { params.push(sex);      where.push(`r.sex::text = $${params.length}`); }
            if (q) {
                params.push(`%${q}%`);
                where.push(`(r.first_name  ILIKE $${params.length}
                          OR r.middle_name ILIKE $${params.length}
                          OR r.last_name   ILIKE $${params.length}
                          OR r.mobile_number ILIKE $${params.length})`);
            }

            const sql = `
                SELECT r.resident_id, r.household_id, r.first_name, r.middle_name, r.last_name,
                       r.sex::text AS sex, r.birthdate, r.mobile_number, r.emergency_mobile_number,
                       r.resident_type, r.is_representative,
                       l.barangay_name, l.city_name, l.street_name,
                       COALESCE(
                         json_agg(v.vulnerability_name) FILTER (WHERE v.vulnerability_name IS NOT NULL),
                         '[]'
                       ) AS vulnerabilities
                FROM resident r
                LEFT JOIN household h    ON r.household_id = h.household_id
                LEFT JOIN location l     ON h.location_id  = l.location_id
                LEFT JOIN vulnerability v ON v.resident_id = r.resident_id
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                GROUP BY r.resident_id, l.barangay_name, l.city_name, l.street_name
                ORDER BY r.last_name, r.first_name
            `;
            const r = await db.query(sql, params);
            return this.success(res, r.rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    // Returns distinct values for filter dropdowns (barangays, sex enum, sos status enum)
    async filterOptions(req, res) {
        try {
            const [barangays, sexes, sosStatuses] = await Promise.all([
                db.query(`SELECT DISTINCT barangay_name AS v
                          FROM location WHERE barangay_name IS NOT NULL
                          ORDER BY v`),
                db.query(`SELECT unnest(enum_range(NULL::gender_type))::text AS v`),
                db.query(`SELECT unnest(enum_range(NULL::sos_status))::text  AS v`),
            ]);
            return this.success(res, {
                barangays:   barangays.rows.map((r) => r.v),
                sexes:       sexes.rows.map((r) => r.v),
                sosStatuses: sosStatuses.rows.map((r) => r.v),
            });
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    // ── SOS records (resident-centric view) ───────────────────────────────
    async listSos(req, res) {
        try {
            const { status, q } = req.query;
            const params = [];
            const where  = [];

            if (status) {
                params.push(status);
                where.push(`s.status::text = $${params.length}`);
            }
            if (q) {
                params.push(`%${q}%`);
                where.push(`(r.first_name ILIKE $${params.length}
                          OR r.last_name  ILIKE $${params.length}
                          OR l.barangay_name ILIKE $${params.length})`);
            }

            const sql = `
                SELECT s.sos_id, s.resident_id, s.urgency_level, s.status,
                       s.timestamp_created, s.timestamp_dispatched,
                       s.request_latitude, s.request_longitude,
                       r.first_name, r.middle_name, r.last_name, r.mobile_number,
                       l.barangay_name, l.street_name
                FROM sos_request s
                LEFT JOIN resident r  ON s.resident_id = r.resident_id
                LEFT JOIN household h ON r.household_id = h.household_id
                LEFT JOIN location l  ON h.location_id = l.location_id
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                ORDER BY s.timestamp_created DESC
            `;
            const r = await db.query(sql, params);
            return this.success(res, r.rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    // ── Resident analytics ────────────────────────────────────────────────
    async residentsByBarangay(req, res) {
        try {
            const r = await db.query(
                `SELECT l.barangay_name, COUNT(DISTINCT r.resident_id)::int AS residents
                 FROM resident r
                 JOIN household h ON r.household_id = h.household_id
                 JOIN location l  ON h.location_id = l.location_id
                 WHERE l.barangay_name IS NOT NULL
                 GROUP BY l.barangay_name
                 ORDER BY residents DESC`
            );
            return this.success(res, r.rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new AdminController();
