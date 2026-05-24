const BaseModel = require('./BaseModel');

class BarangayOperatorModel extends BaseModel {
    constructor() {
        super('barangay_operator', 'barangay_operator_id');
    }

    async create({ barangay_employee_id }) {
        const result = await this.db.query(
            `INSERT INTO barangay_operator (barangay_employee_id, status)
             VALUES ($1, 'Pending') RETURNING *`,
            [barangay_employee_id]
        );
        return result.rows[0];
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT bo.*, be.role, be.category, be.is_active, be.resident_id,
             r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
             a.username, a.is_verified, a.account_id,
             l.barangay_name, l.street_name
             FROM barangay_operator bo
             JOIN barangay_employee_type be ON bo.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             LEFT JOIN account a ON a.resident_id = r.resident_id
             ORDER BY bo.barangay_operator_id`
        );
        return result.rows;
    }

    async findPending() {
        const result = await this.db.query(
            `SELECT bo.*, be.role, be.category, be.is_active, be.resident_id,
             r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
             a.username, a.is_verified, a.account_id,
             l.barangay_name, l.street_name
             FROM barangay_operator bo
             JOIN barangay_employee_type be ON bo.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             LEFT JOIN account a ON a.resident_id = r.resident_id
             WHERE bo.status = 'Pending'
             ORDER BY bo.barangay_operator_id DESC`
        );
        return result.rows;
    }

    async findById(id) {
        const result = await this.db.query(
            `SELECT bo.*, be.role, be.category, be.is_active, be.resident_id,
             r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
             a.username, a.is_verified, a.account_id,
             l.barangay_name, l.street_name
             FROM barangay_operator bo
             JOIN barangay_employee_type be ON bo.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             LEFT JOIN account a ON a.resident_id = r.resident_id
             WHERE bo.barangay_operator_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async approve(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            // Mark operator as approved
            const opResult = await client.query(
                `UPDATE barangay_operator SET status = 'Approved'
                 WHERE barangay_operator_id = $1 RETURNING *`,
                [id]
            );
            if (!opResult.rows[0]) throw new Error('Operator not found');

            const empId = opResult.rows[0].barangay_employee_id;

            // Get resident_id and city from employee → household → location
            const empRow = await client.query(
                `SELECT be.resident_id, l.city_name
                 FROM barangay_employee_type be
                 JOIN resident r ON r.resident_id = be.resident_id
                 JOIN household h ON h.household_id = r.household_id
                 JOIN location l ON l.location_id = h.location_id
                 WHERE be.barangay_employee_id = $1`,
                [empId]
            );
            const residentId = empRow.rows[0]?.resident_id;
            const cityName   = empRow.rows[0]?.city_name ?? '';

            // Block non-residents from becoming barangay operators
            if (!cityName.toLowerCase().includes('naga')) {
                throw new Error('Non-residents cannot be approved as barangay operators.');
            }

            // Activate employee record
            await client.query(
                `UPDATE barangay_employee_type SET is_active = true
                 WHERE barangay_employee_id = $1`,
                [empId]
            );

            if (residentId) {
                // Set resident category
                await client.query(
                    `UPDATE resident SET category = 'resident' WHERE resident_id = $1`,
                    [residentId]
                );

                // Verify the account
                await client.query(
                    `UPDATE account SET is_verified = true WHERE resident_id = $1`,
                    [residentId]
                );
            }

            await client.query('COMMIT');
            return opResult.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async reject(id) {
        const result = await this.db.query(
            `UPDATE barangay_operator SET status = 'Rejected'
             WHERE barangay_operator_id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new BarangayOperatorModel();
