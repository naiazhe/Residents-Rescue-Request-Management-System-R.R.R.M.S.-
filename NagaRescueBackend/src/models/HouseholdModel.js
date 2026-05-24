const BaseModel = require('./BaseModel');

class HouseholdModel extends BaseModel {
    constructor() {
        super('household', 'household_id');
    }

    async create({ location_id, member_count }) {
        const result = await this.db.query(
            `INSERT INTO household (location_id, member_count)
             VALUES ($1, $2) RETURNING *`,
            [location_id, member_count || 0]
        );
        return result.rows[0];
    }

    async update(id, { location_id, member_count }) {
        const result = await this.db.query(
            `UPDATE household SET location_id=$1, member_count=$2
             WHERE household_id=$3 RETURNING *`,
            [location_id, member_count, id]
        );
        return result.rows[0] || null;
    }

    async findWithLocation(id) {
        const result = await this.db.query(
            `SELECT h.*, l.province_name, l.city_name, l.barangay_name,
             l.street_name, l.latitude, l.longitude
             FROM household h
             JOIN location l ON h.location_id = l.location_id
             WHERE h.household_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new HouseholdModel();
