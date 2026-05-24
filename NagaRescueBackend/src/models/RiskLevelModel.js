const BaseModel = require('./BaseModel');

class RiskLevelModel extends BaseModel {
    constructor() {
        super('risk_level', 'risk_level_id');
    }

    async create({ location_id, risk_classification }) {
        const result = await this.db.query(
            `INSERT INTO risk_level (location_id, risk_classification)
             VALUES ($1, $2) RETURNING *`,
            [location_id, risk_classification]
        );
        return result.rows[0];
    }

    async update(id, { location_id, risk_classification }) {
        const result = await this.db.query(
            `UPDATE risk_level SET location_id=$1, risk_classification=$2
             WHERE risk_level_id=$3 RETURNING *`,
            [location_id, risk_classification, id]
        );
        return result.rows[0] || null;
    }

    async findByLocation(location_id) {
        const result = await this.db.query(
            `SELECT * FROM risk_level WHERE location_id = $1`,
            [location_id]
        );
        return result.rows;
    }

    async linkToLocation(location_id, risk_level_id) {
        const result = await this.db.query(
            `INSERT INTO location_risk (location_id, risk_level_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
            [location_id, risk_level_id]
        );
        return result.rows[0];
    }
}

module.exports = new RiskLevelModel();
