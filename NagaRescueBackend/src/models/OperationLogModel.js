const BaseModel = require('./BaseModel');

class OperationLogModel extends BaseModel {
    constructor() {
        super('operation_log', 'operation_id');
    }

    async create({ sos_id, barangay_unit_id, city_response_unit_id, operator_type,
                   comcen_operator_id, barangay_operator_id }) {
        const result = await this.db.query(
            `INSERT INTO operation_log
             (sos_id, barangay_unit_id, city_response_unit_id, operator_type,
              comcen_operator_id, barangay_operator_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [sos_id || null, barangay_unit_id || null, city_response_unit_id || null,
             operator_type, comcen_operator_id || null, barangay_operator_id || null]
        );
        return result.rows[0];
    }

    async updateTimestamps(id, { arrived_at, completed_at }) {
        const result = await this.db.query(
            `UPDATE operation_log SET arrived_at=$1, completed_at=$2
             WHERE operation_id=$3 RETURNING *`,
            [arrived_at || null, completed_at || null, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT * FROM operation_log ORDER BY dispatch_time DESC`
        );
        return result.rows;
    }

    async findBySos(sos_id) {
        const result = await this.db.query(
            `SELECT * FROM operation_log WHERE sos_id = $1 ORDER BY dispatch_time`,
            [sos_id]
        );
        return result.rows;
    }

    async findByUnit(barangay_unit_id) {
        const result = await this.db.query(
            `SELECT
               ol.operation_id, ol.sos_id, ol.dispatch_time,
               s.resident_id, s.urgency_level, s.status AS sos_status,
               s.request_latitude, s.request_longitude, s.timestamp_created,
               r.first_name, r.last_name, r.household_id,
               h.member_count,
               l.street_name, l.barangay_name, l.city_name
             FROM operation_log ol
             JOIN sos_request s  ON ol.sos_id       = s.sos_id
             JOIN resident r     ON s.resident_id   = r.resident_id
             LEFT JOIN household h ON r.household_id = h.household_id
             LEFT JOIN location  l ON h.location_id  = l.location_id
             WHERE ol.barangay_unit_id = $1
               AND s.status = 'Dispatched'
               AND ol.completed_at IS NULL
             ORDER BY s.timestamp_created DESC`,
            [barangay_unit_id]
        );
        return result.rows;
    }

    async findForAccept(operation_id) {
        const result = await this.db.query(
            `SELECT ol.operation_id, ol.sos_id, ol.barangay_unit_id,
                    bu.unit_name,
                    s.resident_id
             FROM operation_log ol
             JOIN barangay_unit bu ON ol.barangay_unit_id = bu.barangay_unit_id
             JOIN sos_request   s  ON ol.sos_id           = s.sos_id
             WHERE ol.operation_id = $1`,
            [operation_id]
        );
        return result.rows[0] || null;
    }

    async findCompletedByUnit(barangay_unit_id) {
        const result = await this.db.query(
            `SELECT
               ol.operation_id, ol.sos_id, ol.dispatch_time,
               ol.arrived_at, ol.completed_at,
               s.resident_id, s.urgency_level, s.timestamp_created,
               r.first_name, r.last_name, r.household_id,
               h.member_count,
               l.street_name, l.barangay_name, l.city_name
             FROM operation_log ol
             JOIN sos_request s  ON ol.sos_id       = s.sos_id
             JOIN resident r     ON s.resident_id   = r.resident_id
             LEFT JOIN household h ON r.household_id = h.household_id
             LEFT JOIN location  l ON h.location_id  = l.location_id
             WHERE ol.barangay_unit_id = $1
               AND ol.completed_at IS NOT NULL
             ORDER BY ol.completed_at DESC`,
            [barangay_unit_id]
        );
        return result.rows;
    }
}

module.exports = new OperationLogModel();
