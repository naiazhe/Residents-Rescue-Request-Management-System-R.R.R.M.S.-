const BaseController = require('./BaseController');
const LocationModel = require('../models/LocationModel');
const RiskLevelModel = require('../models/RiskLevelModel');

class LocationController extends BaseController {
    constructor() {
        super(LocationModel);
        this.riskLevelModel = RiskLevelModel;
    }

    async create(req, res) {
        try {
            const { province_name, city_name, barangay_name, street_name,
                    latitude, longitude, risk_level_id } = req.body;
            const location = await this.model.create({
                province_name, city_name, barangay_name, street_name, latitude, longitude
            });
            if (risk_level_id) {
                await this.riskLevelModel.linkToLocation(location.location_id, risk_level_id);
            }
            return this.success(res, location, 'Location created', 201);
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const row = await this.model.update(req.params.id, req.body);
            if (!row) return this.error(res, 'Location not found', 404);
            return this.success(res, row, 'Location updated');
        } catch (err) {
            return this.error(res, err.message);
        }
    }

    async getRiskLevels(req, res) {
        try {
            const rows = await this.riskLevelModel.findByLocation(req.params.id);
            return this.success(res, rows);
        } catch (err) {
            return this.error(res, err.message);
        }
    }
}

module.exports = new LocationController();
