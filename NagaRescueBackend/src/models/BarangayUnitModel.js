const BaseModel = require('./BaseModel');

class BarangayUnitModel extends BaseModel {
    constructor() {
        super('barangay_unit', 'barangay_unit_id');
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT bu.*,
                    COUNT(br.barangay_rescuer_id)::int AS crew_count
             FROM barangay_unit bu
             LEFT JOIN barangay_rescuer br ON br.barangay_unit_id = bu.barangay_unit_id
             GROUP BY bu.barangay_unit_id
             ORDER BY bu.barangay_unit_id`
        );
        return result.rows;
    }

    async create({ unit_name, status, barangay_name, team_code }) {
        const result = await this.db.query(
            `INSERT INTO barangay_unit (unit_name, status, barangay_name, team_code)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [unit_name, status || 'Available', barangay_name || null, team_code || null]
        );
        return result.rows[0];
    }

    async findByTeamCode(team_code) {
        const result = await this.db.query(
            `SELECT * FROM barangay_unit WHERE team_code = $1`,
            [team_code]
        );
        return result.rows[0] || null;
    }

    // Generates a team_code if the unit doesn't have one yet, then returns the unit row.
    async ensureTeamCode(id) {
        // Return existing code if already set
        const check = await this.db.query(
            `SELECT * FROM barangay_unit WHERE barangay_unit_id = $1`, [id]
        );
        const unit = check.rows[0];
        if (!unit) return null;
        if (unit.team_code) return unit;

        // Generate: up-to-3-word initials + 5 random digits, retry on collision
        const words   = (unit.unit_name || 'TEAM').trim().split(/\s+/).slice(0, 3);
        const prefix  = words.map(w => (w[0] || '').toUpperCase()).join('');

        let code, saved;
        for (let attempt = 0; attempt < 10; attempt++) {
            code = `${prefix}${String(Math.floor(10000 + Math.random() * 90000))}`;
            try {
                const upd = await this.db.query(
                    `UPDATE barangay_unit SET team_code=$1
                     WHERE barangay_unit_id=$2 AND team_code IS NULL
                     RETURNING *`,
                    [code, id]
                );
                if (upd.rows[0]) { saved = upd.rows[0]; break; }
            } catch (e) {
                if (e.code !== '23505') throw e; // only retry on unique violation
            }
        }
        // If another request already set the code between our check and update, fetch it
        if (!saved) {
            const refetch = await this.db.query(
                `SELECT * FROM barangay_unit WHERE barangay_unit_id = $1`, [id]
            );
            saved = refetch.rows[0];
        }
        return saved;
    }

    async findByBarangay(barangay_name) {
        const result = await this.db.query(
            `SELECT bu.*,
                    COUNT(br.barangay_rescuer_id)::int AS crew_count
             FROM barangay_unit bu
             LEFT JOIN barangay_rescuer br ON br.barangay_unit_id = bu.barangay_unit_id
             WHERE bu.barangay_name = $1
             GROUP BY bu.barangay_unit_id
             ORDER BY bu.barangay_unit_id`,
            [barangay_name]
        );
        return result.rows;
    }

    async update(id, { unit_name, status }) {
        const result = await this.db.query(
            `UPDATE barangay_unit SET unit_name=$1, status=$2
             WHERE barangay_unit_id=$3 RETURNING *`,
            [unit_name, status, id]
        );
        return result.rows[0] || null;
    }

    async updateStatus(id, status) {
        const result = await this.db.query(
            `UPDATE barangay_unit SET status=$1 WHERE barangay_unit_id=$2 RETURNING *`,
            [status, id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new BarangayUnitModel();
