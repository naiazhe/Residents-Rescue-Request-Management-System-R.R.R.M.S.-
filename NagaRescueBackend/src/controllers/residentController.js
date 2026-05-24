const BaseController = require('./BaseController');
const ResidentModel = require('../models/ResidentModel');
const VulnerabilityModel = require('../models/VulnerabilityModel');

class ResidentController extends BaseController {
    constructor() {
        super(ResidentModel);
        this.vulnerabilityModel = VulnerabilityModel;
    }

    async create(req, res) {
        try {
            const {
                household_id, first_name, middle_name, last_name, sex, birthdate,
                mobile_number, emergency_mobile_number, resident_type, is_representative,
                vulnerabilities
            } = req.body;
            const resident = await this.model.create({
                household_id, first_name, middle_name, last_name, sex, birthdate,
                mobile_number, emergency_mobile_number, resident_type, is_representative
            });
            if (Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
                await this.vulnerabilityModel.bulkCreate(resident.resident_id, vulnerabilities);
            }
            return this.success(res, resident, 'Resident registered', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Resident not found', 404);
            return this.success(res, row, 'Resident updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getWithHousehold(req, res) {
        try {
            const row = await this.model.findWithHousehold(req.params.id);
            if (!row) return this.error(res, 'Resident not found', 404);
            return this.success(res, row);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getVulnerabilities(req, res) {
        try {
            const rows = await this.vulnerabilityModel.findByResident(req.params.id);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async addVulnerability(req, res) {
        try {
            const { vulnerability_name } = req.body;
            const row = await this.vulnerabilityModel.create({
                resident_id: req.params.id,
                vulnerability_name
            });
            return this.success(res, row, 'Vulnerability added', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByHousehold(req, res) {
        try {
            const rows = await this.model.findByHousehold(req.params.householdId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByHouseholdFull(req, res) {
        try {
            const rows = await this.model.findByHouseholdWithVulnerabilities(req.params.householdId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getHouseholdHeadsByBarangay(req, res) {
        try {
            const { barangay } = req.query;
            if (!barangay) return this.error(res, 'barangay query param is required', 400);
            const rows = await this.model.findHouseholdHeadsByBarangay(barangay);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getProfile(req, res) {
        try {
            const result = await this.model.query(
                `SELECT r.*,
                 a.account_id, a.username, a.role, a.is_active, a.is_verified, a.date_created,
                 h.household_id, h.member_count,
                 l.province_name, l.city_name, l.barangay_name, l.street_name
                 FROM resident r
                 LEFT JOIN account a ON r.resident_id = a.resident_id
                 LEFT JOIN household h ON r.household_id = h.household_id
                 LEFT JOIN location l ON h.location_id = l.location_id
                 WHERE r.resident_id = $1`,
                [req.params.id]
            );
            if (!result.rows[0]) return this.error(res, 'Resident not found', 404);
            const vulnerabilities = await this.vulnerabilityModel.findByResident(req.params.id);
            return this.success(res, { ...result.rows[0], vulnerabilities });
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new ResidentController();
