const BaseModel = require('./BaseModel');

class EvacuationCenterModel extends BaseModel {
    constructor() {
        super('evacuation_center', 'center_id');
    }

    async create({ evac_manager_id, name, type, address, location_id, max_capacity, current_headcount }) {
        const result = await this.db.query(
            `INSERT INTO evacuation_center
             (evac_manager_id, name, type, address, location_id, max_capacity, current_headcount)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [evac_manager_id || null, name, type, address, location_id, max_capacity, current_headcount || 0]
        );
        return result.rows[0];
    }

    async update(id, { evac_manager_id, name, type, address, location_id, max_capacity, current_headcount }) {
        const result = await this.db.query(
            `UPDATE evacuation_center
             SET evac_manager_id=$1, name=$2, type=$3, address=$4,
             location_id=$5, max_capacity=$6, current_headcount=$7
             WHERE center_id=$8 RETURNING *`,
            [evac_manager_id, name, type, address, location_id, max_capacity, current_headcount, id]
        );
        return result.rows[0] || null;
    }

    async updateOccupancy(id, delta) {
        const result = await this.db.query(
            `UPDATE evacuation_center
             SET current_headcount = GREATEST(0, current_headcount + $1)
             WHERE center_id = $2 RETURNING *`,
            [delta, id]
        );
        return result.rows[0] || null;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT ec.*, l.province_name, l.city_name, l.barangay_name, l.street_name,
             l.latitude, l.longitude,
             r.first_name AS manager_first_name, r.last_name AS manager_last_name
             FROM evacuation_center ec
             LEFT JOIN location l ON ec.location_id = l.location_id
             LEFT JOIN evacuation_manager em ON em.evac_manager_id = ec.evac_manager_id
             LEFT JOIN barangay_employee_type be ON be.barangay_employee_id = em.barangay_employee_id
             LEFT JOIN resident r ON r.resident_id = be.resident_id
             ORDER BY ec.center_id`
        );
        return result.rows;
    }

    async findByManager(managerId) {
        const result = await this.db.query(
            `SELECT ec.*, l.province_name, l.city_name, l.barangay_name, l.street_name,
             l.latitude, l.longitude
             FROM evacuation_center ec
             LEFT JOIN location l ON ec.location_id = l.location_id
             WHERE ec.evac_manager_id = $1`,
            [managerId]
        );
        return result.rows[0] || null;
    }

    async assignManager(centerId, managerId) {
        const result = await this.db.query(
            `UPDATE evacuation_center SET evac_manager_id=$1 WHERE center_id=$2 RETURNING *`,
            [managerId ?? null, centerId]
        );
        return result.rows[0] || null;
    }
}

module.exports = new EvacuationCenterModel();
