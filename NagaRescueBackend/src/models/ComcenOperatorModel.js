const BaseModel = require('./BaseModel');

class ComcenOperatorModel extends BaseModel {
    constructor() {
        super('comcen_operator', 'comcen_operator_id');
    }

    async create({ city_employee_id }) {
        const result = await this.db.query(
            `INSERT INTO comcen_operator (city_employee_id)
             VALUES ($1) RETURNING *`,
            [city_employee_id]
        );
        return result.rows[0];
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT co.*, ce.role, ce.category, ce.is_active,
             r.first_name, r.last_name
             FROM comcen_operator co
             JOIN city_employee_type ce ON co.city_employee_id = ce.city_employee_id
             JOIN resident r ON ce.resident_id = r.resident_id
             ORDER BY co.comcen_operator_id`
        );
        return result.rows;
    }

    async findById(id) {
        const result = await this.db.query(
            `SELECT co.*, ce.role, ce.category, ce.is_active,
             r.first_name, r.last_name
             FROM comcen_operator co
             JOIN city_employee_type ce ON co.city_employee_id = ce.city_employee_id
             JOIN resident r ON ce.resident_id = r.resident_id
             WHERE co.comcen_operator_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new ComcenOperatorModel();
