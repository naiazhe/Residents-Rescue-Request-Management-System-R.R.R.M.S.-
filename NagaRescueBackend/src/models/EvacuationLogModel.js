const BaseModel = require('./BaseModel');

class EvacuationLogModel extends BaseModel {
    constructor() {
        super('evacuation_log', 'evacuation_log_id');
    }

    async create({ operation_id, resident_id, center_id, status, evacuation_type }) {
        const result = await this.db.query(
            `INSERT INTO evacuation_log (operation_id, resident_id, center_id, status, evacuation_type)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [operation_id || null, resident_id, center_id, status || 'Checked-in', evacuation_type]
        );
        return result.rows[0];
    }

    async checkout(log_id) {
        const result = await this.db.query(
            `UPDATE evacuation_log SET status='Checked-out', exit_date=NOW()
             WHERE evacuation_log_id=$1 RETURNING *`,
            [log_id]
        );
        return result.rows[0] || null;
    }

    async updateStatus(id, status) {
        const result = await this.db.query(
            `UPDATE evacuation_log SET status=$1 WHERE evacuation_log_id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT el.*, r.first_name, r.last_name,
             ec.name AS center_name, ec.type AS center_type
             FROM evacuation_log el
             JOIN resident r ON el.resident_id = r.resident_id
             JOIN evacuation_center ec ON el.center_id = ec.center_id
             ORDER BY el.entry_date DESC`
        );
        return result.rows;
    }

    async findByCenter(center_id) {
        const result = await this.db.query(
            `SELECT el.*,
             r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number, r.resident_type,
             h.household_id,
             l.barangay_name, l.street_name
             FROM evacuation_log el
             JOIN resident r ON el.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             LEFT JOIN location l ON h.location_id = l.location_id
             WHERE el.center_id = $1
             ORDER BY el.entry_date DESC`,
            [center_id]
        );
        return result.rows;
    }

    // Checks out every still-Checked-in member of a household at a given center.
    // Returns the updated rows. Caller wraps the headcount update in the same tx.
    async checkoutHouseholdRows(client, { household_id, center_id }) {
        const result = await client.query(
            `UPDATE evacuation_log el
                SET status = 'Checked-out', exit_date = NOW()
              WHERE el.center_id = $1
                AND el.status = 'Checked-in'
                AND el.resident_id IN (
                    SELECT resident_id FROM resident WHERE household_id = $2
                )
              RETURNING *`,
            [center_id, household_id]
        );
        return result.rows;
    }

    async findByResident(resident_id) {
        const result = await this.db.query(
            `SELECT el.*, ec.name AS center_name, ec.type AS center_type
             FROM evacuation_log el
             JOIN evacuation_center ec ON el.center_id = ec.center_id
             WHERE el.resident_id = $1
             ORDER BY el.entry_date DESC`,
            [resident_id]
        );
        return result.rows;
    }
}

module.exports = new EvacuationLogModel();
