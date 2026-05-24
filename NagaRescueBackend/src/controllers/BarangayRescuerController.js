const BaseController = require('./BaseController');
const BarangayRescuerModel = require('../models/BarangayRescuerModel');

class BarangayRescuerController extends BaseController {
    constructor() {
        super(BarangayRescuerModel);
    }

    async create(req, res) {
        try {
            const row = await this.model.create(req.body);
            return this.success(res, row, 'Barangay rescuer created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Rescuer not found', 404);
            return this.success(res, row, 'Rescuer updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByResident(req, res) {
        try {
            const row = await this.model.findByResident(req.params.residentId);
            return this.success(res, row);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getByUnit(req, res) {
        try {
            const rows = await this.model.findByUnit(req.params.unitId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getPendingLeaders(req, res) {
        try {
            // ?barangay=Cararayan  →  only return leaders from that barangay
            // no param             →  return all (ComCen / super-admin use case)
            const barangay = req.query.barangay || null;
            const rows = await this.model.findPendingLeaders(barangay);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getPendingMembers(req, res) {
        try {
            const rows = await this.model.findPendingMembers(req.params.unitId);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getLeaderApprovedMembers(req, res) {
        try {
            const barangay = req.query.barangay || null;
            const rows = await this.model.findLeaderApprovedMembers(barangay);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getUnassigned(req, res) {
        try {
            const rows = await this.model.findUnassigned();
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async assignToUnit(req, res) {
        try {
            const { unit_id } = req.body;
            if (!unit_id) return this.error(res, 'unit_id is required', 400);
            const row = await this.model.assignUnit(req.params.id, unit_id);
            if (!row) return this.error(res, 'Rescuer not found', 404);
            return this.success(res, row, 'Rescuer assigned to unit');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async acceptMember(req, res) {
        try {
            const result = await this.model.acceptMember(req.params.id);
            return this.success(res, result, 'Member approved — account is now verified');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async activateRescuer(req, res) {
        try {
            const result = await this.model.activate(req.params.id);
            return this.success(res, result, 'Rescuer activated and account verified');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async declineRescuer(req, res) {
        try {
            const row = await this.model.updateStatus(req.params.id, 'Declined');
            if (!row) return this.error(res, 'Rescuer not found', 404);
            return this.success(res, row, 'Rescuer declined');
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new BarangayRescuerController();
