const BaseModel = require('./BaseModel');

class LocationModel extends BaseModel {
    constructor() {
        super('location', 'location_id');
    }

    async create({ province_name, city_name, barangay_name, street_name, latitude, longitude }) {
        const result = await this.db.query(
            `INSERT INTO location (province_name, city_name, barangay_name, street_name, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [province_name, city_name, barangay_name, street_name, latitude, longitude]
        );
        return result.rows[0];
    }

    async update(id, { province_name, city_name, barangay_name, street_name, latitude, longitude }) {
        const result = await this.db.query(
            `UPDATE location SET province_name=$1, city_name=$2, barangay_name=$3,
             street_name=$4, latitude=$5, longitude=$6
             WHERE location_id=$7 RETURNING *`,
            [province_name, city_name, barangay_name, street_name, latitude, longitude, id]
        );
        return result.rows[0] || null;
    }

    async findByBarangay(barangay_name) {
        const result = await this.db.query(
            `SELECT * FROM location WHERE barangay_name = $1`,
            [barangay_name]
        );
        return result.rows;
    }
}

module.exports = new LocationModel();
