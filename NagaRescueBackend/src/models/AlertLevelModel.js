const BaseModel = require('./BaseModel');

class AlertLevelModel extends BaseModel {
    constructor() {
        super('alert_level', 'alert_level_id');
    }

    async create({ type, description }) {
        const result = await this.db.query(
            `INSERT INTO alert_level (type, description) VALUES ($1, $2) RETURNING *`,
            [type, description]
        );
        return result.rows[0];
    }

    async update(id, { type, description }) {
        const result = await this.db.query(
            `UPDATE alert_level SET type=$1, description=$2
             WHERE alert_level_id=$3 RETURNING *`,
            [type, description, id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new AlertLevelModel();
