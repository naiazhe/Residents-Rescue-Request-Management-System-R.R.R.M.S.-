const BaseModel = require('./BaseModel');

// This table stores barangay employee records (links resident to a barangay role)
class BarangayEmployeeTypeModel extends BaseModel {
    constructor() {
        super('barangay_employee_type', 'barangay_employee_id');
    }

    async create({ resident_id, role, category, is_active }) {
        const result = await this.db.query(
            `INSERT INTO barangay_employee_type (resident_id, role, category, is_active)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [resident_id, role, category, is_active !== undefined ? is_active : true]
        );
        return result.rows[0];
    }

    async update(id, { role, category, is_active }) {
        const result = await this.db.query(
            `UPDATE barangay_employee_type SET role=$1, category=$2, is_active=$3
             WHERE barangay_employee_id=$4 RETURNING *`,
            [role, category, is_active, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT be.*, r.first_name, r.last_name, r.sex
             FROM barangay_employee_type be
             JOIN resident r ON be.resident_id = r.resident_id
             ORDER BY be.barangay_employee_id`
        );
        return result.rows;
    }

    async findByResident(resident_id) {
        const result = await this.db.query(
            `SELECT * FROM barangay_employee_type WHERE resident_id = $1`,
            [resident_id]
        );
        return result.rows;
    }
}

module.exports = new BarangayEmployeeTypeModel();
