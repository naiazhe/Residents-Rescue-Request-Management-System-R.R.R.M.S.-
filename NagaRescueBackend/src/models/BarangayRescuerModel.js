const BaseModel = require('./BaseModel');

class BarangayRescuerModel extends BaseModel {
    constructor() {
        super('barangay_rescuer', 'barangay_rescuer_id');
    }

    async create({ barangay_employee_id, is_leader, position, status, barangay_unit_id }) {
        const result = await this.db.query(
            `INSERT INTO barangay_rescuer (barangay_employee_id, is_leader, position, status, barangay_unit_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [barangay_employee_id, is_leader || false, position, status || 0, barangay_unit_id]
        );
        return result.rows[0];
    }

    async update(id, { is_leader, position, status, barangay_unit_id }) {
        const result = await this.db.query(
            `UPDATE barangay_rescuer SET is_leader=$1, position=$2, status=$3, barangay_unit_id=$4
             WHERE barangay_rescuer_id=$5 RETURNING *`,
            [is_leader, position, status, barangay_unit_id, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT br.*, be.role, be.category,
             r.first_name, r.last_name,
             bu.unit_name, bu.status AS unit_status
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             LEFT JOIN barangay_unit bu ON br.barangay_unit_id = bu.barangay_unit_id
             ORDER BY br.barangay_rescuer_id`
        );
        return result.rows;
    }

    async findByResident(resident_id) {
        const result = await this.db.query(
            `SELECT br.barangay_rescuer_id, br.is_leader, br.status,
                    bu.barangay_unit_id, bu.unit_name, bu.status AS unit_status
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             LEFT JOIN barangay_unit bu ON br.barangay_unit_id = bu.barangay_unit_id
             WHERE be.resident_id = $1
             LIMIT 1`,
            [resident_id]
        );
        return result.rows[0] || null;
    }

    async findByUnit(barangay_unit_id) {
        const result = await this.db.query(
            `SELECT br.*, r.resident_id, r.first_name, r.last_name,
                    r.mobile_number, r.birthdate, be.role
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             WHERE br.barangay_unit_id = $1
               AND br.status NOT IN ('Pending', 'Declined')
             ORDER BY br.is_leader DESC, r.last_name`,
            [barangay_unit_id]
        );
        return result.rows;
    }

    async findPendingLeaders(barangay_name = null) {
        const result = await this.db.query(
            `SELECT br.barangay_rescuer_id, br.status,
             r.first_name, r.last_name, r.mobile_number,
             bu.unit_name, bu.barangay_unit_id,
             a.account_id, a.is_verified
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             LEFT JOIN barangay_unit bu ON br.barangay_unit_id = bu.barangay_unit_id
             JOIN account a ON a.resident_id = r.resident_id
             WHERE br.is_leader = true AND br.status = 'Pending'
               AND ($1::TEXT IS NULL OR bu.barangay_name = $1)
             ORDER BY br.barangay_rescuer_id`,
            [barangay_name]
        );
        return result.rows;
    }

    async findPendingMembers(barangay_unit_id) {
        const result = await this.db.query(
            `SELECT br.barangay_rescuer_id, br.status,
             r.first_name, r.last_name, r.mobile_number, r.birthdate, r.sex,
             a.account_id
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             JOIN account a ON a.resident_id = r.resident_id
             WHERE br.barangay_unit_id = $1 AND br.is_leader = false AND br.status = 'Pending'
             ORDER BY r.last_name`,
            [barangay_unit_id]
        );
        return result.rows;
    }

    async findLeaderApprovedMembers(barangay_name = null) {
        const result = await this.db.query(
            `SELECT br.barangay_rescuer_id, br.status,
             r.first_name, r.last_name, r.mobile_number,
             bu.unit_name, bu.barangay_unit_id,
             a.account_id
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             LEFT JOIN barangay_unit bu ON br.barangay_unit_id = bu.barangay_unit_id
             JOIN account a ON a.resident_id = r.resident_id
             WHERE br.is_leader = false AND br.status = 'Approved'
               AND ($1::TEXT IS NULL OR bu.barangay_name = $1)
             ORDER BY br.barangay_rescuer_id`,
            [barangay_name]
        );
        return result.rows;
    }

    async findUnassigned() {
        // Rescuers not yet assigned to any unit (barangay_unit_id IS NULL)
        const result = await this.db.query(
            `SELECT br.barangay_rescuer_id, br.is_leader, br.status,
                    r.resident_id, r.first_name, r.last_name, r.mobile_number
             FROM barangay_rescuer br
             JOIN barangay_employee_type be ON br.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             WHERE br.barangay_unit_id IS NULL
             ORDER BY r.last_name, r.first_name`
        );
        return result.rows;
    }

    async assignUnit(id, unitId) {
        const result = await this.db.query(
            `UPDATE barangay_rescuer SET barangay_unit_id=$1, status='Active'
             WHERE barangay_rescuer_id=$2 RETURNING *`,
            [unitId, id]
        );
        return result.rows[0] || null;
    }

    async updateStatus(id, status) {
        const result = await this.db.query(
            `UPDATE barangay_rescuer SET status=$1 WHERE barangay_rescuer_id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0] || null;
    }

    // Shared helper — sets resident.category based on their registered city
    async _setCategoryFromCity(client, residentId) {
        await client.query(
            `UPDATE resident SET category =
               CASE WHEN l.city_name ILIKE '%Naga%' THEN 'resident' ELSE 'non-resident' END
             FROM household h
             JOIN location l ON h.location_id = l.location_id
             WHERE resident.resident_id = $1
               AND resident.household_id = h.household_id`,
            [residentId]
        );
    }

    // Accept a member: set rescuer status → 'Approved' AND verify their account in one transaction
    async acceptMember(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const rescuerResult = await client.query(
                `UPDATE barangay_rescuer SET status='Approved'
                 WHERE barangay_rescuer_id=$1
                 RETURNING barangay_rescuer_id, barangay_employee_id, status`,
                [id]
            );
            if (!rescuerResult.rows[0]) throw new Error('Rescuer not found');
            const employeeId = rescuerResult.rows[0].barangay_employee_id;

            const empResult = await client.query(
                `SELECT resident_id FROM barangay_employee_type WHERE barangay_employee_id=$1`,
                [employeeId]
            );
            const residentId = empResult.rows[0]?.resident_id;

            let accountRow = null;
            if (residentId) {
                const accResult = await client.query(
                    `UPDATE account SET is_verified=true WHERE resident_id=$1
                     RETURNING account_id, username, is_verified`,
                    [residentId]
                );
                accountRow = accResult.rows[0];
                await this._setCategoryFromCity(client, residentId);
            }

            await client.query('COMMIT');
            return {
                rescuer: rescuerResult.rows[0],
                accountId: accountRow?.account_id,
                isVerified: accountRow?.is_verified ?? false,
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async activate(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const rescuerResult = await client.query(
                `UPDATE barangay_rescuer SET status='Active'
                 WHERE barangay_rescuer_id=$1 RETURNING barangay_employee_id`,
                [id]
            );
            if (!rescuerResult.rows[0]) throw new Error('Rescuer not found');
            const employeeId = rescuerResult.rows[0].barangay_employee_id;

            await client.query(
                `UPDATE barangay_employee_type SET is_active=true WHERE barangay_employee_id=$1`,
                [employeeId]
            );

            const empResult = await client.query(
                `SELECT resident_id FROM barangay_employee_type WHERE barangay_employee_id=$1`,
                [employeeId]
            );
            const residentId = empResult.rows[0]?.resident_id;

            let accountRow = null;
            if (residentId) {
                const accResult = await client.query(
                    `UPDATE account SET is_verified=true WHERE resident_id=$1
                     RETURNING account_id, username, is_verified`,
                    [residentId]
                );
                accountRow = accResult.rows[0];
                await this._setCategoryFromCity(client, residentId);
            }

            await client.query('COMMIT');
            return { rescuerId: id, accountId: accountRow?.account_id, isVerified: true };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new BarangayRescuerModel();
