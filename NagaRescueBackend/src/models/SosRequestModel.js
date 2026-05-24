const BaseModel = require('./BaseModel');

class SosRequestModel extends BaseModel {
    constructor() {
        super('sos_request', 'sos_id');
    }

    async create({ resident_id, urgency_level, latitude, longitude }) {
        const result = await this.db.query(
            `INSERT INTO sos_request (resident_id, urgency_level, status, request_latitude, request_longitude)
             VALUES ($1, $2, 'Pending', $3, $4) RETURNING *`,
            [resident_id, urgency_level, latitude, longitude]
        );
        return result.rows[0];
    }

    async updateStatus(id, status) {
        const result = await this.db.query(
            `UPDATE sos_request SET status=$1 WHERE sos_id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT s.*, r.first_name, r.last_name
             FROM sos_request s
             JOIN resident r ON s.resident_id = r.resident_id
             ORDER BY s.timestamp_created DESC`
        );
        return result.rows;
    }

    async findByStatus(status) {
        const result = await this.db.query(
            `SELECT s.*, r.first_name, r.last_name
             FROM sos_request s
             JOIN resident r ON s.resident_id = r.resident_id
             WHERE s.status = $1
             ORDER BY s.timestamp_created DESC`,
            [status]
        );
        return result.rows;
    }

    async findByStatusAndBarangay(status, barangay_name) {
        const result = await this.db.query(
            `SELECT s.*, r.first_name, r.last_name
             FROM sos_request s
             JOIN resident r ON s.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE s.status = $1 AND l.barangay_name ILIKE $2
             ORDER BY s.timestamp_created DESC`,
            [status, barangay_name]
        );
        return result.rows;
    }

    async findForwarded() {
        const result = await this.db.query(
            `SELECT s.*, r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
             l.barangay_name, l.street_name, l.city_name,
             h.household_id, h.member_count
             FROM sos_request s
             JOIN resident r ON s.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE s.status = 'Forwarded'
             ORDER BY s.timestamp_created DESC`
        );
        return result.rows;
    }

    async findByResident(resident_id) {
        const result = await this.db.query(
            `SELECT * FROM sos_request WHERE resident_id = $1
             ORDER BY timestamp_created DESC`,
            [resident_id]
        );
        return result.rows;
    }
}

module.exports = new SosRequestModel();
