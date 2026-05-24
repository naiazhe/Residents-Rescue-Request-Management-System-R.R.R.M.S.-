const BaseModel = require('./BaseModel');

class WarningAlertModel extends BaseModel {
    constructor() {
        super('warning_alert', 'early_warning_id');
    }

    async create({ barangay_operator_id, target_zones, alert_level_id }) {
        const result = await this.db.query(
            `INSERT INTO warning_alert (barangay_operator_id, target_zones, alert_level_id)
             VALUES ($1, $2, $3) RETURNING *`,
            [barangay_operator_id, target_zones, alert_level_id]
        );
        return result.rows[0];
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT wa.*, al.type AS alert_type, al.description AS alert_description,
             be.role AS operator_role,
             r.first_name, r.last_name
             FROM warning_alert wa
             JOIN alert_level al ON wa.alert_level_id = al.alert_level_id
             JOIN barangay_operator bo ON wa.barangay_operator_id = bo.barangay_operator_id
             JOIN barangay_employee_type be ON bo.barangay_employee_id = be.barangay_employee_id
             JOIN resident r ON be.resident_id = r.resident_id
             ORDER BY wa.timestamp_sent DESC`
        );
        return result.rows;
    }

    async findByOperator(barangay_operator_id) {
        const result = await this.db.query(
            `SELECT wa.*, al.type AS alert_type
             FROM warning_alert wa
             JOIN alert_level al ON wa.alert_level_id = al.alert_level_id
             WHERE wa.barangay_operator_id = $1
             ORDER BY wa.timestamp_sent DESC`,
            [barangay_operator_id]
        );
        return result.rows;
    }
}

module.exports = new WarningAlertModel();
