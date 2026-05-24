const BaseModel = require('./BaseModel');

// This table stores city employee records (links resident to a city role)
class CityEmployeeTypeModel extends BaseModel {
    constructor() {
        super('city_employee_type', 'city_employee_id');
    }

    async create({ resident_id, role, category, is_active }) {
        const result = await this.db.query(
            `INSERT INTO city_employee_type (resident_id, role, category, is_active)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [resident_id, role, category, is_active !== undefined ? is_active : true]
        );
        return result.rows[0];
    }

    async update(id, { role, category, is_active }) {
        const result = await this.db.query(
            `UPDATE city_employee_type SET role=$1, category=$2, is_active=$3
             WHERE city_employee_id=$4 RETURNING *`,
            [role, category, is_active, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT ce.*, r.first_name, r.last_name, r.sex
             FROM city_employee_type ce
             JOIN resident r ON ce.resident_id = r.resident_id
             ORDER BY ce.city_employee_id`
        );
        return result.rows;
    }

    async findByResident(resident_id) {
        const result = await this.db.query(
            `SELECT * FROM city_employee_type WHERE resident_id = $1`,
            [resident_id]
        );
        return result.rows;
    }
}

module.exports = new CityEmployeeTypeModel();
