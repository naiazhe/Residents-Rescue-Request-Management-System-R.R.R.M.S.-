const BaseController = require('./BaseController');
const EvacuationLogModel = require('../models/EvacuationLogModel');
const EvacuationCenterModel = require('../models/EvacuationCenterModel');

class EvacuationLogController extends BaseController {
    constructor() {
        super(EvacuationLogModel);
        this.centerModel = EvacuationCenterModel;
    }

    async getAll(req, res) {
        try {
            const rows = await this.model.findAll();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async checkin(req, res) {
        try {
            const { operation_id, resident_id, center_id, status, evacuation_type } = req.body;
            const row = await this.model.create({ operation_id, resident_id, center_id, status, evacuation_type });
            await this.centerModel.updateOccupancy(center_id, 1);
            return this.success(res, row, 'Checked in successfully', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async checkout(req, res) {
        try {
            const row = await this.model.checkout(req.params.id);
            if (!row) return this.error(res, 'Log entry not found', 404);
            await this.centerModel.updateOccupancy(row.center_id, -1);
            return this.success(res, row, 'Checked out successfully');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const row = await this.model.updateStatus(req.params.id, status);
            if (!row) return this.error(res, 'Log entry not found', 404);
            return this.success(res, row, 'Status updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByCenter(req, res) {
        try {
            const rows = await this.model.findByCenter(req.params.centerId);
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

    async checkinHousehold(req, res) {
        const client = await this.model.getClient();
        try {
            const { household_id, center_id, evacuation_type, resident_ids } = req.body;
            if (!household_id || !center_id) {
                return this.error(res, 'household_id and center_id are required', 400);
            }

            // If resident_ids provided, only check in those specific members
            const hasFilter = Array.isArray(resident_ids) && resident_ids.length > 0;
            const residentsResult = await client.query(
                hasFilter
                    ? `SELECT resident_id FROM resident WHERE household_id = $1 AND resident_id = ANY($2)`
                    : `SELECT resident_id FROM resident WHERE household_id = $1`,
                hasFilter ? [household_id, resident_ids] : [household_id]
            );

            if (residentsResult.rows.length === 0) {
                return this.error(res, 'Household not found or has no members', 404);
            }

            await client.query('BEGIN');

            const logs = [];
            for (const { resident_id } of residentsResult.rows) {
                const logResult = await client.query(
                    `INSERT INTO evacuation_log (resident_id, center_id, status, evacuation_type)
                     VALUES ($1, $2, 'Checked-in', $3) RETURNING *`,
                    [resident_id, center_id, evacuation_type || 'Self-Evacuated']
                );
                logs.push(logResult.rows[0]);
            }

            await client.query(
                `UPDATE evacuation_center
                 SET current_headcount = GREATEST(0, current_headcount + $1)
                 WHERE center_id = $2`,
                [logs.length, center_id]
            );

            await client.query('COMMIT');
            return this.success(res, { logs, count: logs.length }, 'Household checked in successfully', 201);
        } catch (err) {
            await client.query('ROLLBACK');
            return this.error(res, err.message);
        } finally {
            client.release();
        }
    }

    async walkinCheckin(req, res) {
        const client = await this.model.getClient();
        try {
            const { center_id, province, city, barangay, street, head, members = [] } = req.body;
            if (!center_id) {
                return this.error(res, 'center_id is required', 400);
            }
            if (!head && members.length === 0) {
                return this.error(res, 'At least a household head or one member is required', 400);
            }

            await client.query('BEGIN');

            // Create location with the provided province/city/barangay
            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || 'Camarines Sur', city || 'Naga City', barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const totalCount = (head ? 1 : 0) + members.length;
            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count)
                 VALUES ($1, $2) RETURNING household_id`,
                [locationId, totalCount]
            );
            const householdId = hhResult.rows[0].household_id;

            const logs = [];

            // Insert household head first (if provided)
            if (head) {
                const age = parseInt(head.age) || 0;
                const headRes = await client.query(
                    `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, resident_type)
                     VALUES ($1, $2, $3, $4, $5, (CURRENT_DATE - ($6 * INTERVAL '1 year'))::date, $7, 'Household Head')
                     RETURNING resident_id`,
                    [householdId, head.firstName, head.middleName || null, head.lastName,
                     head.sex || 'M', age, head.mobileNumber || null]
                );
                const logResult = await client.query(
                    `INSERT INTO evacuation_log (resident_id, center_id, status, evacuation_type)
                     VALUES ($1, $2, 'Checked-in', 'Pre-emptive') RETURNING *`,
                    [headRes.rows[0].resident_id, center_id]
                );
                logs.push(logResult.rows[0]);
            }

            // Insert additional members
            for (const member of members) {
                const nameParts = (member.name || '').trim().split(' ');
                const lastName = nameParts.length > 1 ? nameParts.pop() : 'N/A';
                const firstName = nameParts.join(' ') || 'Unknown';
                const age = parseInt(member.age) || 0;

                const resResult = await client.query(
                    `INSERT INTO resident (household_id, first_name, last_name, sex, birthdate, resident_type)
                     VALUES ($1, $2, $3, $4, (CURRENT_DATE - ($5 * INTERVAL '1 year'))::date, $6)
                     RETURNING resident_id`,
                    [householdId, firstName, lastName, member.sex || 'M', age, member.remarks || 'Household Member']
                );
                const logResult = await client.query(
                    `INSERT INTO evacuation_log (resident_id, center_id, status, evacuation_type)
                     VALUES ($1, $2, 'Checked-in', 'Pre-emptive') RETURNING *`,
                    [resResult.rows[0].resident_id, center_id]
                );
                logs.push(logResult.rows[0]);
            }

            await client.query(
                `UPDATE evacuation_center
                 SET current_headcount = GREATEST(0, current_headcount + $1)
                 WHERE center_id = $2`,
                [logs.length, center_id]
            );

            await client.query('COMMIT');
            return this.success(res, { householdId, logs, count: logs.length }, 'Walk-in registered and checked in', 201);
        } catch (err) {
            await client.query('ROLLBACK');
            return this.error(res, err.message);
        } finally {
            client.release();
        }
    }

    async checkoutHousehold(req, res) {
        const client = await this.model.getClient();
        try {
            const { household_id, center_id } = req.body;
            if (!household_id || !center_id) {
                return this.error(res, 'household_id and center_id are required', 400);
            }

            await client.query('BEGIN');

            const logs = await this.model.checkoutHouseholdRows(client, { household_id, center_id });
            if (logs.length === 0) {
                await client.query('ROLLBACK');
                return this.error(res, 'No checked-in members found for this household at this center.', 404);
            }

            await client.query(
                `UPDATE evacuation_center
                    SET current_headcount = GREATEST(0, current_headcount - $1)
                  WHERE center_id = $2`,
                [logs.length, center_id]
            );

            await client.query('COMMIT');
            return this.success(res, { logs, count: logs.length }, 'Household checked out successfully');
        } catch (err) {
            await client.query('ROLLBACK');
            return this.error(res, err.message);
        } finally {
            client.release();
        }
    }

    async remove(req, res) {
        try {
            const log = await this.model.findById(req.params.id);
            if (!log) return this.error(res, 'Log entry not found', 404);
            await this.model.delete(req.params.id);
            if (log.status === 'Checked-in') {
                await this.centerModel.updateOccupancy(log.center_id, -1);
            }
            return this.success(res, log, 'Log entry deleted');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new EvacuationLogController();
