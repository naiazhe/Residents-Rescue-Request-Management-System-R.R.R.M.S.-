const BaseModel = require('./BaseModel');

class ResidentModel extends BaseModel {
    constructor() {
        super('resident', 'resident_id');
    }

    async create({ household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, emergency_mobile_number, resident_type, is_representative }) {
        const result = await this.db.query(
            `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, emergency_mobile_number, resident_type, is_representative)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [household_id || null, first_name, middle_name || null, last_name, sex, birthdate, mobile_number || null, emergency_mobile_number || null, resident_type || 'Household Head', is_representative || false]
        );
        return result.rows[0];
    }

    async update(id, { household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, emergency_mobile_number, resident_type, is_representative }) {
        const result = await this.db.query(
            `UPDATE resident SET household_id=$1, first_name=$2, middle_name=$3, last_name=$4,
             sex=$5, birthdate=$6, mobile_number=$7, emergency_mobile_number=$8,
             resident_type=$9, is_representative=$10 WHERE resident_id=$11 RETURNING *`,
            [household_id, first_name, middle_name || null, last_name, sex, birthdate, mobile_number || null, emergency_mobile_number || null, resident_type || 'Household Head', is_representative || false, id]
        );
        return result.rows[0] || null;
    }

    async findWithHousehold(id) {
        const result = await this.db.query(
            `SELECT r.*, h.household_number, h.residency_type,
             l.barangay_name, l.city_name
             FROM resident r
             LEFT JOIN household h ON r.household_id = h.household_id
             LEFT JOIN location l ON h.location_id = l.location_id
             WHERE r.resident_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async findByHousehold(household_id) {
        const result = await this.db.query(
            `SELECT * FROM resident WHERE household_id = $1 ORDER BY last_name`,
            [household_id]
        );
        return result.rows;
    }

    async findHouseholdHeadsByBarangay(barangay_name) {
        const result = await this.db.query(
            `SELECT r.resident_id, r.first_name, r.last_name, r.mobile_number,
             r.household_id, l.street_name, l.barangay_name
             FROM resident r
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE r.resident_type = 'Household Head'
               AND l.barangay_name ILIKE $1
             ORDER BY r.last_name, r.first_name`,
            [barangay_name]
        );
        return result.rows;
    }

    async findByHouseholdWithVulnerabilities(household_id) {
        const result = await this.db.query(
            `SELECT r.*,
             COALESCE(
               json_agg(v.vulnerability_name) FILTER (WHERE v.vulnerability_name IS NOT NULL),
               '[]'
             ) AS vulnerabilities
             FROM resident r
             LEFT JOIN vulnerability v ON v.resident_id = r.resident_id
             WHERE r.household_id = $1
             GROUP BY r.resident_id
             ORDER BY r.last_name`,
            [household_id]
        );
        return result.rows;
    }
}

module.exports = new ResidentModel();
