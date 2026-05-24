const BaseModel = require('./BaseModel');

class CityResponseUnitModel extends BaseModel {
    constructor() {
        super('city_response_unit', 'city_response_unit_id');
    }

    async create({ unit_name, status }) {
        const result = await this.db.query(
            `INSERT INTO city_response_unit (unit_name, status)
             VALUES ($1, $2) RETURNING *`,
            [unit_name, status || 'Available']
        );
        return result.rows[0];
    }

    async update(id, { unit_name, status }) {
        const result = await this.db.query(
            `UPDATE city_response_unit SET unit_name=$1, status=$2
             WHERE city_response_unit_id=$3 RETURNING *`,
            [unit_name, status, id]
        );
        return result.rows[0] || null;
    }

    async updateStatus(id, status) {
        const result = await this.db.query(
            `UPDATE city_response_unit SET status=$1 WHERE city_response_unit_id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0] || null;
    }

    async findByTeamCode(team_code) {
        const result = await this.db.query(
            `SELECT * FROM city_response_unit WHERE team_code = $1`,
            [team_code]
        );
        return result.rows[0] || null;
    }

    _buildTeamCode(unitName) {
        const words  = String(unitName || '').trim().split(/\s+/).slice(0, 3);
        const prefix = words.map(w => (w[0] || '').toUpperCase()).join('');
        const digits = String(Math.floor(10000 + Math.random() * 90000));
        return `${prefix}${digits}`;
    }

    async ensureTeamCode(id) {
        const existing = await this.db.query(
            `SELECT * FROM city_response_unit WHERE city_response_unit_id = $1`, [id]
        );
        if (!existing.rows[0]) return null;
        if (existing.rows[0].team_code) return existing.rows[0];

        for (let attempt = 0; attempt < 5; attempt++) {
            const code = this._buildTeamCode(existing.rows[0].unit_name || 'SARU');
            try {
                const updated = await this.db.query(
                    `UPDATE city_response_unit SET team_code = $1
                     WHERE city_response_unit_id = $2 AND team_code IS NULL
                     RETURNING *`,
                    [code, id]
                );
                if (updated.rows[0]) return updated.rows[0];
                const refetch = await this.db.query(
                    `SELECT * FROM city_response_unit WHERE city_response_unit_id = $1`, [id]
                );
                return refetch.rows[0];
            } catch (err) {
                if (err.code !== '23505') throw err;
            }
        }
        throw new Error('Could not generate a unique team code');
    }
}

module.exports = new CityResponseUnitModel();
