const BaseController = require('./BaseController');
const AccountModel = require('../models/AccountModel');
const ResidentModel = require('../models/ResidentModel');
const bcrypt = require('bcrypt');
const { signToken } = require('../middleware/auth');

class AuthController extends BaseController {
    constructor() {
        super(AccountModel);
        this.residentModel = ResidentModel;
    }

    async register(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                // Location
                province, city, barangay, street, latitude, longitude,
                // Resident
                firstName, middleName, lastName, sex, birthdate,
                mobileNumber, emergencyMobileNumber, residentType,
                isRepresentative,
                // Account
                username, password,
                // Vulnerabilities
                vulnerabilities
            } = req.body;

            // Required field check
            if (!firstName || !lastName || !sex || !birthdate || !username || !password) {
                return this.error(res, 'Missing required fields: firstName, lastName, sex, birthdate, username, password', 400);
            }

            // Validation
            if (username.length > 20) {
                return this.error(res, 'Username must not exceed 20 characters', 400);
            }
            if (mobileNumber) {
                if (!/^\d+$/.test(mobileNumber)) {
                    return this.error(res, 'Mobile number must contain digits only', 400);
                }
                if (mobileNumber.length > 15) {
                    return this.error(res, 'Mobile number must not exceed 15 digits', 400);
                }
            }
            if (emergencyMobileNumber) {
                if (!/^\d+$/.test(emergencyMobileNumber)) {
                    return this.error(res, 'Emergency mobile number must contain digits only', 400);
                }
                if (emergencyMobileNumber.length > 15) {
                    return this.error(res, 'Emergency mobile number must not exceed 15 digits', 400);
                }
            }

            await client.query('BEGIN');

            // 1. Create location
            const locationResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name, latitude, longitude)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null, latitude || null, longitude || null]
            );
            const locationId = locationResult.rows[0].location_id;

            // 2. Create household
            const householdResult = await client.query(
                `INSERT INTO household (location_id, member_count)
                 VALUES ($1, $2) RETURNING household_id`,
                [locationId, 1]
            );
            const householdId = householdResult.rows[0].household_id;

            // 3. Create resident
            const residentResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate,
                 mobile_number, emergency_mobile_number, resident_type, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING resident_id`,
                [
                    householdId,
                    firstName,
                    middleName || null,
                    lastName,
                    sex,
                    birthdate,
                    mobileNumber || null,
                    emergencyMobileNumber || null,
                    residentType || 'resident',
                    isRepresentative || false
                ]
            );
            const residentId = residentResult.rows[0].resident_id;

            // 4. Create account — is_verified starts false; BDRRMC must approve
            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'resident', false)
                 RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            // 5. Tag Tenant/Boarder as non-resident immediately — they live in Naga City
            //    temporarily, not as permanent residents. Their Naga City address is used
            //    for routing only. Permanent home address is captured in homeAddress payload.
            if (['Tenant/Renter', 'Boarder'].includes(residentType)) {
                await client.query(
                    `UPDATE resident SET category = 'non-resident' WHERE resident_id = $1`,
                    [residentId]
                );
            }

            // 6. Link vulnerabilities (if any)
            let savedVulnerabilities = [];
            if (Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
                for (const vulnerability_name of vulnerabilities) {
                    const vRow = await client.query(
                        `INSERT INTO vulnerability (resident_id, vulnerability_name)
                         VALUES ($1, $2) RETURNING *`,
                        [residentId, vulnerability_name]
                    );
                    savedVulnerabilities.push(vRow.rows[0]);
                }
            }

            await client.query('COMMIT');

            return this.success(res, {
                locationId,
                householdId,
                residentId,
                account: accountResult.rows[0],
                vulnerabilities: savedVulnerabilities
            }, 'Registration successful', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Registration Error:', err.message);
            if (err.code === '23505') {
                return this.error(res, 'Username already taken', 409);
            }
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    // Generate a fixed Team ID: initials of first 3 words (uppercase) + 5 random digits
    // e.g. "Red Cross Naga" → "RCN83921"
    _buildTeamCode(unitName) {
        const words  = unitName.trim().split(/\s+/).slice(0, 3);
        const prefix = words.map(w => (w[0] || '').toUpperCase()).join('');
        const digits = String(Math.floor(10000 + Math.random() * 90000)); // always 5 digits
        return `${prefix}${digits}`;
    }

    async registerLeader(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                province, city, barangay, street,
                firstName, middleName, lastName, sex, birthdate, mobileNumber,
                unitName, username, password
            } = req.body;

            if (!firstName || !lastName || !sex || !birthdate || !username || !password || !unitName) {
                return this.error(res, 'Missing required fields', 400);
            }

            const teamCode = this._buildTeamCode(unitName);

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, firstName, middleName || null, lastName, sex, birthdate, mobileNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            const unitResult = await client.query(
                `INSERT INTO barangay_unit (unit_name, barangay_name, team_code) VALUES ($1, $2, $3) RETURNING barangay_unit_id, team_code`,
                [unitName, barangay || null, teamCode]
            );
            const unitId = unitResult.rows[0].barangay_unit_id;

            const empResult = await client.query(
                `INSERT INTO barangay_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, $2, $3, false) RETURNING barangay_employee_id`,
                [residentId, 'BARANGAY_RESCUER', 'DRR']
            );
            const employeeId = empResult.rows[0].barangay_employee_id;

            const rescuerResult = await client.query(
                `INSERT INTO barangay_rescuer (barangay_employee_id, is_leader, status, barangay_unit_id)
                 VALUES ($1, true, 'Pending', $2) RETURNING barangay_rescuer_id`,
                [employeeId, unitId]
            );

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'barangay_employee', false) RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            await client.query('COMMIT');
            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                residentId,
                unitId,
                teamCode,
                rescuerId: rescuerResult.rows[0].barangay_rescuer_id,
            }, 'Team Leader registration submitted. Awaiting barangay approval.', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    async registerMember(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                province, city, barangay, street,
                firstName, middleName, lastName, sex, birthdate, mobileNumber,
                unitId, username, password
            } = req.body;

            if (!firstName || !lastName || !sex || !birthdate || !username || !password || !unitId) {
                return this.error(res, 'Missing required fields', 400);
            }

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, firstName, middleName || null, lastName, sex, birthdate, mobileNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            const empResult = await client.query(
                `INSERT INTO barangay_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, $2, $3, false) RETURNING barangay_employee_id`,
                [residentId, 'BARANGAY_RESCUER', 'DRR']
            );
            const employeeId = empResult.rows[0].barangay_employee_id;

            const rescuerResult = await client.query(
                `INSERT INTO barangay_rescuer (barangay_employee_id, is_leader, status, barangay_unit_id)
                 VALUES ($1, false, 'Pending', $2) RETURNING barangay_rescuer_id`,
                [employeeId, unitId]
            );

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'barangay_employee', false) RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            await client.query('COMMIT');
            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                residentId,
                rescuerId: rescuerResult.rows[0].barangay_rescuer_id,
            }, 'Member registration submitted. Awaiting team leader approval.', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    async registerEvacManager(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                province, city, barangay, street,
                firstName, middleName, lastName, sex, birthdate, mobileNumber,
                username, password
            } = req.body;

            if (!firstName || !lastName || !sex || !birthdate || !username || !password) {
                return this.error(res, 'Missing required fields: firstName, lastName, sex, birthdate, username, password', 400);
            }
            if (username.length > 20) {
                return this.error(res, 'Username must not exceed 20 characters', 400);
            }

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, firstName, middleName || null, lastName, sex, birthdate, mobileNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            const empResult = await client.query(
                `INSERT INTO barangay_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, 'EVAC_MANAGER', 'DRR', false) RETURNING barangay_employee_id`,
                [residentId]
            );
            const employeeId = empResult.rows[0].barangay_employee_id;

            const managerResult = await client.query(
                `INSERT INTO evacuation_manager (barangay_employee_id)
                 VALUES ($1) RETURNING evac_manager_id`,
                [employeeId]
            );
            const managerId = managerResult.rows[0].evac_manager_id;

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'barangay_employee', false)
                 RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            await client.query('COMMIT');

            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                residentId,
                managerId,
            }, 'Registration submitted. Awaiting admin approval.', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    async registerComcen(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                fullName, firstName, middleName, lastName, profilePicture,
                username, password, phoneNumber, role,
                barangay, street, sex, birthdate
            } = req.body;
            const cleanFirstName = firstName?.trim() || fullName?.trim().split(/\s+/)[0] || '';
            const cleanMiddleName = middleName?.trim() || null;
            const cleanLastName = lastName?.trim() || (fullName?.trim().split(/\s+/).slice(1).join(' ') || cleanFirstName);

            if (!cleanFirstName || !cleanLastName || !profilePicture || !username?.trim() || !password || !role || !barangay || !street || !sex || !birthdate) {
                return this.error(res, 'Missing required fields: fullName, username, password, role, barangay, street, sex, birthdate', 400);
            }
            if (!['CDRRMO Officer', 'ComCen Staff'].includes(role)) {
                return this.error(res, 'Role must be "CDRRMO Officer" or "ComCen Staff"', 400);
            }
            if (username.length > 20) {
                return this.error(res, 'Username must not exceed 20 characters', 400);
            }

            const dbRole = role === 'CDRRMO Officer' ? 'cdrrmo' : 'comcen_staff';

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ('Camarines Sur', 'Naga City', $1, $2) RETURNING location_id`,
                [barangay, street]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, cleanFirstName, cleanMiddleName, cleanLastName, sex.toUpperCase(), birthdate, phoneNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            const empResult = await client.query(
                `INSERT INTO city_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, $2, 'CDRRMO', true) RETURNING city_employee_id`,
                [residentId, dbRole.toUpperCase()]
            );
            const cityEmployeeId = empResult.rows[0].city_employee_id;

            await client.query(
                `INSERT INTO comcen_operator (city_employee_id) VALUES ($1)`,
                [cityEmployeeId]
            );

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, $4, true) RETURNING account_id, username, role`,
                [residentId, username.trim(), hashedPwd, dbRole]
            );

            await client.query('COMMIT');
            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                username: accountResult.rows[0].username,
                role: accountResult.rows[0].role,
            }, 'Registration successful', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    async registerOperator(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                province, city, barangay, street,
                firstName, middleName, lastName, sex, birthdate, mobileNumber,
                username, password
            } = req.body;

            if (!firstName || !lastName || !sex || !birthdate || !username || !password) {
                return this.error(res, 'Missing required fields: firstName, lastName, sex, birthdate, username, password', 400);
            }
            if (username.length > 20) {
                return this.error(res, 'Username must not exceed 20 characters', 400);
            }

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, firstName, middleName || null, lastName, sex, birthdate, mobileNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            const empResult = await client.query(
                `INSERT INTO barangay_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, 'BARANGAY_OPERATOR', 'DRR', false) RETURNING barangay_employee_id`,
                [residentId]
            );
            const employeeId = empResult.rows[0].barangay_employee_id;

            const opResult = await client.query(
                `INSERT INTO barangay_operator (barangay_employee_id, status)
                 VALUES ($1, 'Pending') RETURNING barangay_operator_id`,
                [employeeId]
            );
            const operatorId = opResult.rows[0].barangay_operator_id;

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'barangay_employee', false) RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            await client.query('COMMIT');
            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                residentId,
                operatorId,
            }, 'Operator registration submitted. Awaiting CDRRMO approval.', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    // ── SARU Registration ──────────────────────────────────────────────────────
    // Approved by ComCen (city-wide), not by the barangay.

    async registerSaruLeader(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                province, city, barangay, street,
                firstName, middleName, lastName, sex, birthdate, mobileNumber,
                unitName, username, password,
                profileImage, documents,
            } = req.body;

            if (!firstName || !lastName || !sex || !birthdate || !username || !password || !unitName) {
                return this.error(res, 'Missing required fields', 400);
            }

            const teamCode = this._buildTeamCode(unitName);
            const docsJson = JSON.stringify(Array.isArray(documents) ? documents : []);

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, firstName, middleName || null, lastName, sex, birthdate, mobileNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            // Create city-level response unit (SARU team) with fixed team code
            const unitResult = await client.query(
                `INSERT INTO city_response_unit (unit_name, team_code, status)
                 VALUES ($1, $2, 'Available') RETURNING city_response_unit_id, team_code`,
                [unitName, teamCode]
            );
            const cityUnitId = unitResult.rows[0].city_response_unit_id;

            const empResult = await client.query(
                `INSERT INTO city_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, 'SARU_RESCUER', 'SAR', false) RETURNING city_employee_id`,
                [residentId]
            );
            const empId = empResult.rows[0].city_employee_id;

            const rescuerResult = await client.query(
                `INSERT INTO saru_rescuer (city_employee_id, is_leader, status, city_response_unit_id, profile_image, documents)
                 VALUES ($1, true, 'Pending', $2, $3, $4) RETURNING saru_rescuer_id`,
                [empId, cityUnitId, profileImage || null, docsJson]
            );

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'city_employee', false) RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            await client.query('COMMIT');
            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                residentId,
                unitId: cityUnitId,
                teamCode,
                rescuerId: rescuerResult.rows[0].saru_rescuer_id,
            }, 'SARU Team Leader registration submitted. Awaiting ComCen approval.', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    async registerSaruMember(req, res) {
        const client = await this.residentModel.getClient();
        try {
            const {
                province, city, barangay, street,
                firstName, middleName, lastName, sex, birthdate, mobileNumber,
                unitId, username, password,
                profileImage, documents,
            } = req.body;

            if (!firstName || !lastName || !sex || !birthdate || !username || !password || !unitId) {
                return this.error(res, 'Missing required fields', 400);
            }

            const docsJson = JSON.stringify(Array.isArray(documents) ? documents : []);

            await client.query('BEGIN');

            const locResult = await client.query(
                `INSERT INTO location (province_name, city_name, barangay_name, street_name)
                 VALUES ($1, $2, $3, $4) RETURNING location_id`,
                [province || null, city || null, barangay || null, street || null]
            );
            const locationId = locResult.rows[0].location_id;

            const hhResult = await client.query(
                `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
                [locationId]
            );
            const householdId = hhResult.rows[0].household_id;

            const resResult = await client.query(
                `INSERT INTO resident (household_id, first_name, middle_name, last_name, sex, birthdate, mobile_number, is_representative)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING resident_id`,
                [householdId, firstName, middleName || null, lastName, sex, birthdate, mobileNumber || null]
            );
            const residentId = resResult.rows[0].resident_id;

            const empResult = await client.query(
                `INSERT INTO city_employee_type (resident_id, role, category, is_active)
                 VALUES ($1, 'SARU_RESCUER', 'SAR', false) RETURNING city_employee_id`,
                [residentId]
            );
            const empId = empResult.rows[0].city_employee_id;

            const rescuerResult = await client.query(
                `INSERT INTO saru_rescuer (city_employee_id, is_leader, status, city_response_unit_id, profile_image, documents)
                 VALUES ($1, false, 'Pending', $2, $3, $4) RETURNING saru_rescuer_id`,
                [empId, unitId, profileImage || null, docsJson]
            );

            const hashedPwd = await bcrypt.hash(password, 10);
            const accountResult = await client.query(
                `INSERT INTO account (resident_id, username, password, role, is_verified)
                 VALUES ($1, $2, $3, 'city_employee', false) RETURNING account_id, username, role`,
                [residentId, username, hashedPwd]
            );

            await client.query('COMMIT');
            return this.success(res, {
                accountId: accountResult.rows[0].account_id,
                residentId,
                rescuerId: rescuerResult.rows[0].saru_rescuer_id,
            }, 'SARU member registration submitted. Awaiting team leader approval.', 201);

        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505') return this.error(res, 'Username already taken', 409);
            return this.error(res, 'Database error: ' + err.message);
        } finally {
            client.release();
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return this.error(res, 'Username and password are required', 400);
            }

            const user = await this.model.findByUsernameWithBarangay(username);
            if (!user) return this.error(res, 'Invalid username or password', 401);

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return this.error(res, 'Invalid username or password', 401);

            const token = signToken({
                accountId: user.account_id,
                residentId: user.resident_id,
                username: user.username,
                role: user.role,
            });

            return this.success(res, {
                token,
                accountId: user.account_id,
                residentId: user.resident_id,
                username: user.username,
                role: user.role,
                isVerified: user.is_verified,
                firstName: user.first_name || null,
                middleName: user.middle_name || null,
                lastName: user.last_name || null,
                fullName: [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(' ') || user.username,
                sex: user.sex || null,
                birthdate: user.birthdate || null,
                phoneNumber: user.mobile_number || null,
                province: user.province_name || null,
                city: user.city_name || null,
                barangayName: user.barangay_name || null,
                street: user.street_name || null,
                createdAt: user.date_created || null,
            }, 'Login successful');

        } catch (err) {
            console.error('Login Error:', err.message);
            return this.error(res, 'Server error: ' + err.message);
        }
    }
}

module.exports = new AuthController();
