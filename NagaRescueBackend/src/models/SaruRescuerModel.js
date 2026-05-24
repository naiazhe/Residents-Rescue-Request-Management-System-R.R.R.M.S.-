const BaseModel = require('./BaseModel');

class SaruRescuerModel extends BaseModel {
    constructor() {
        super('saru_rescuer', 'saru_rescuer_id');
    }

    async create({ city_employee_id, is_leader, position, status, city_response_unit_id }) {
        const result = await this.db.query(
            `INSERT INTO saru_rescuer (city_employee_id, is_leader, position, status, city_response_unit_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [city_employee_id, is_leader || false, position, status || 0, city_response_unit_id]
        );
        return result.rows[0];
    }

    async update(id, { is_leader, position, status, city_response_unit_id }) {
        const result = await this.db.query(
            `UPDATE saru_rescuer SET is_leader=$1, position=$2, status=$3, city_response_unit_id=$4
             WHERE saru_rescuer_id=$5 RETURNING *`,
            [is_leader, position, status, city_response_unit_id, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT sr.*, ce.role, ce.category,
             r.first_name, r.last_name,
             cru.unit_name, cru.status AS unit_status
             FROM saru_rescuer sr
             JOIN city_employee_type ce ON sr.city_employee_id = ce.city_employee_id
             JOIN resident r ON ce.resident_id = r.resident_id
             LEFT JOIN city_response_unit cru ON sr.city_response_unit_id = cru.city_response_unit_id
             ORDER BY sr.saru_rescuer_id`
        );
        return result.rows;
    }

    async findByUnit(city_response_unit_id) {
        const result = await this.db.query(
            `SELECT sr.*, r.first_name, r.last_name, ce.role
             FROM saru_rescuer sr
             JOIN city_employee_type ce ON sr.city_employee_id = ce.city_employee_id
             JOIN resident r ON ce.resident_id = r.resident_id
             WHERE sr.city_response_unit_id = $1`,
            [city_response_unit_id]
        );
        return result.rows;
    }

    async findByResident(resident_id) {
        const result = await this.db.query(
            `SELECT sr.saru_rescuer_id, sr.is_leader, sr.status,
                    cru.city_response_unit_id, cru.unit_name, cru.status AS unit_status
             FROM saru_rescuer sr
             JOIN city_employee_type ce ON sr.city_employee_id = ce.city_employee_id
             LEFT JOIN city_response_unit cru ON sr.city_response_unit_id = cru.city_response_unit_id
             WHERE ce.resident_id = $1
             LIMIT 1`,
            [resident_id]
        );
        return result.rows[0] || null;
    }

    async findPending() {
        const result = await this.db.query(
            `SELECT sr.saru_rescuer_id, sr.is_leader, sr.status,
             sr.profile_image, sr.documents,
             r.first_name, r.last_name, r.mobile_number, r.birthdate, r.sex,
             cru.unit_name, cru.city_response_unit_id,
             a.account_id, a.is_verified, a.date_created,
             l.barangay_name, l.city_name, l.street_name
             FROM saru_rescuer sr
             JOIN city_employee_type ce ON sr.city_employee_id = ce.city_employee_id
             JOIN resident r ON ce.resident_id = r.resident_id
             LEFT JOIN city_response_unit cru ON sr.city_response_unit_id = cru.city_response_unit_id
             JOIN account a ON a.resident_id = r.resident_id
             LEFT JOIN household h ON r.household_id = h.household_id
             LEFT JOIN location l ON h.location_id = l.location_id
             WHERE sr.status = 'Pending'
             ORDER BY sr.saru_rescuer_id`
        );
        return result.rows;
    }

    async activate(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const rescuerResult = await client.query(
                `UPDATE saru_rescuer SET status='Active'
                 WHERE saru_rescuer_id=$1 RETURNING city_employee_id`,
                [id]
            );
            if (!rescuerResult.rows[0]) throw new Error('Rescuer not found');
            const employeeId = rescuerResult.rows[0].city_employee_id;

            await client.query(
                `UPDATE city_employee_type SET is_active=true WHERE city_employee_id=$1`,
                [employeeId]
            );

            const empResult = await client.query(
                `SELECT resident_id FROM city_employee_type WHERE city_employee_id=$1`,
                [employeeId]
            );
            const residentId = empResult.rows[0]?.resident_id;

            let accountRow = null;
            if (residentId) {
                const accResult = await client.query(
                    `UPDATE account SET is_verified=true WHERE resident_id=$1
                     RETURNING account_id, is_verified`,
                    [residentId]
                );
                accountRow = accResult.rows[0];
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

    async updateStatus(id, status) {
        const result = await this.db.query(
            `UPDATE saru_rescuer SET status=$1 WHERE saru_rescuer_id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new SaruRescuerModel();
