const BaseModel = require('./BaseModel');

class EvacuationManagerModel extends BaseModel {
    constructor() {
        super('evacuation_manager', 'evac_manager_id');
    }

    async create({ barangay_employee_id }) {
        const result = await this.db.query(
            `INSERT INTO evacuation_manager (barangay_employee_id)
             VALUES ($1) RETURNING *`,
            [barangay_employee_id]
        );
        return result.rows[0];
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT em.*, be.role, be.category, be.is_active,
             r.first_name, r.last_name, r.mobile_number,
             ec.center_id AS assigned_center_id, ec.name AS assigned_center_name
             FROM evacuation_manager em
             JOIN barangay_employee_type be ON em.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             LEFT JOIN evacuation_center ec ON ec.evac_manager_id = em.evac_manager_id
             WHERE be.is_active = true
             ORDER BY em.evac_manager_id`
        );
        return result.rows;
    }

    async findPending() {
        const result = await this.db.query(
            `SELECT em.*, be.role, be.category, be.is_active, be.barangay_employee_id,
             r.first_name, r.last_name, r.mobile_number,
             a.account_id, a.date_created
             FROM evacuation_manager em
             JOIN barangay_employee_type be ON em.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             LEFT JOIN account a ON a.resident_id = r.resident_id
             WHERE be.is_active = false
             ORDER BY em.evac_manager_id`
        );
        return result.rows;
    }

    async approve(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const managerResult = await client.query(
                `SELECT em.barangay_employee_id
                 FROM evacuation_manager em WHERE em.evac_manager_id = $1`,
                [id]
            );
            if (!managerResult.rows[0]) throw new Error('Evacuation manager not found');
            const employeeId = managerResult.rows[0].barangay_employee_id;

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
            }

            await client.query('COMMIT');
            return { managerId: id, accountId: accountRow?.account_id, isVerified: true };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async decline(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const managerResult = await client.query(
                `SELECT em.barangay_employee_id, be.resident_id
                 FROM evacuation_manager em
                 JOIN barangay_employee_type be ON em.barangay_employee_id = be.barangay_employee_id
                 WHERE em.evac_manager_id = $1`,
                [id]
            );
            if (!managerResult.rows[0]) throw new Error('Evacuation manager not found');
            const { barangay_employee_id: employeeId, resident_id: residentId } = managerResult.rows[0];

            await client.query(`DELETE FROM evacuation_manager WHERE evac_manager_id=$1`, [id]);
            await client.query(`DELETE FROM account WHERE resident_id=$1`, [residentId]);
            await client.query(`DELETE FROM barangay_employee_type WHERE barangay_employee_id=$1`, [employeeId]);

            await client.query('COMMIT');
            return { declined: true, managerId: id };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async findById(id) {
        const result = await this.db.query(
            `SELECT em.*, be.role, be.category,
             r.first_name, r.last_name
             FROM evacuation_manager em
             JOIN barangay_employee_type be ON em.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             WHERE em.evac_manager_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async findByResident(residentId) {
        const result = await this.db.query(
            `SELECT em.*, be.role, be.category, be.is_active,
             r.first_name, r.last_name
             FROM evacuation_manager em
             JOIN barangay_employee_type be ON em.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             WHERE be.resident_id = $1`,
            [residentId]
        );
        return result.rows[0] || null;
    }
}

module.exports = new EvacuationManagerModel();
