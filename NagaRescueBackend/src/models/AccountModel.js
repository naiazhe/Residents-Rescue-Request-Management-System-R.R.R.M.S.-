const BaseModel = require('./BaseModel');

class AccountModel extends BaseModel {
    constructor() {
        super('account', 'account_id');
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT account_id, resident_id, username, role, is_active, is_verified, date_created
             FROM account ORDER BY account_id`
        );
        return result.rows;
    }

    async findById(id) {
        const result = await this.db.query(
            `SELECT account_id, resident_id, username, role, is_active, is_verified, date_created
             FROM account WHERE account_id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async create({ resident_id, username, password, role }) {
        const result = await this.db.query(
            `INSERT INTO account (resident_id, username, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING account_id, resident_id, username, role`,
            [resident_id, username, password, role || 'resident']
        );
        return result.rows[0];
    }

    async update(id, { username, role }) {
        const result = await this.db.query(
            `UPDATE account SET username=$1, role=$2
             WHERE account_id=$3
             RETURNING account_id, username, role, is_active, is_verified`,
            [username, role, id]
        );
        return result.rows[0] || null;
    }

    async updatePassword(id, hashedPassword) {
        const result = await this.db.query(
            `UPDATE account SET password=$1
             WHERE account_id=$2
             RETURNING account_id, username`,
            [hashedPassword, id]
        );
        return result.rows[0] || null;
    }

    async findByUsername(username) {
        const result = await this.db.query(
            `SELECT * FROM account WHERE username = $1`,
            [username]
        );
        return result.rows[0] || null;
    }

    async findByResidentId(resident_id) {
        const result = await this.db.query(
            `SELECT account_id, resident_id, username, role, is_verified
             FROM account WHERE resident_id = $1`,
            [resident_id]
        );
        return result.rows[0] || null;
    }

    async findPending(barangay_name = null) {
        // Returns unverified resident accounts scoped to the operator's barangay when provided
        const result = await this.db.query(
            `SELECT a.account_id, a.resident_id, a.username, a.role, a.is_verified, a.date_created,
             r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
             l.barangay_name, l.street_name, l.city_name
             FROM account a
             JOIN resident r ON a.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE a.is_verified = false
               AND a.role = 'resident'
               AND ($1::TEXT IS NULL OR l.barangay_name ILIKE $1)
             ORDER BY a.date_created DESC`,
            [barangay_name]
        );
        return result.rows;
    }

    async findAllRegistrations() {
        // Returns all resident/barangay accounts with their approval status
        const result = await this.db.query(
            `SELECT a.account_id, a.resident_id, a.username, a.role,
                    a.is_verified, a.is_active, a.date_created,
                    r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
                    l.barangay_name, l.street_name, l.city_name
             FROM account a
             JOIN resident r ON a.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE a.role NOT IN ('cdrrmo', 'comcen_staff')
             ORDER BY a.date_created DESC`
        );
        return result.rows;
    }

    async findVerifiedResidents(barangay_name = null) {
        // Returns approved (verified) resident accounts, optionally scoped to a barangay
        const result = await this.db.query(
            `SELECT a.account_id, a.resident_id, a.username, a.role,
                    a.is_verified, a.is_active, a.date_created,
                    r.first_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
                    l.barangay_name, l.street_name, l.city_name
             FROM account a
             JOIN resident r ON a.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE a.is_verified = true
               AND a.is_active = true
               AND a.role = 'resident'
               AND ($1::TEXT IS NULL OR l.barangay_name ILIKE $1)
             ORDER BY r.last_name, r.first_name`,
            [barangay_name]
        );
        return result.rows;
    }

    async reject(id) {
        const result = await this.db.query(
            `UPDATE account SET is_active = false
             WHERE account_id = $1
             RETURNING account_id, username, role, is_active, is_verified`,
            [id]
        );
        return result.rows[0] || null;
    }

    async findByUsernameWithBarangay(username) {
        const result = await this.db.query(
            `SELECT a.*,
                    r.first_name, r.middle_name, r.last_name, r.sex, r.birthdate, r.mobile_number,
                    l.province_name, l.city_name, l.barangay_name, l.street_name
             FROM account a
             JOIN resident r ON a.resident_id = r.resident_id
             JOIN household h ON r.household_id = h.household_id
             JOIN location l ON h.location_id = l.location_id
             WHERE a.username = $1`,
            [username]
        );
        return result.rows[0] || null;
    }

    async updatePushToken(accountId, token) {
        const result = await this.db.query(
            `UPDATE account SET expo_push_token = $1 WHERE account_id = $2
             RETURNING account_id`,
            [token, accountId]
        );
        return result.rows[0] || null;
    }

    async getPushToken(accountId) {
        const result = await this.db.query(
            `SELECT expo_push_token FROM account WHERE account_id = $1`,
            [accountId]
        );
        return result.rows[0]?.expo_push_token || null;
    }

    async verify(id) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const accResult = await client.query(
                `UPDATE account SET is_verified=true WHERE account_id=$1
                 RETURNING account_id, username, role, is_active, is_verified, resident_id`,
                [id]
            );
            if (!accResult.rows[0]) throw new Error('Account not found');
            const residentId = accResult.rows[0].resident_id;

            // Set resident/non-resident category (only if the column exists in this
            // deployment — the live schema may have dropped it).
            if (residentId) {
                // Best-effort update — the category column or the resident_type enum
                // values may not exist in this deployment. Swallow schema mismatches
                // (42703 undefined_column, 22P02 invalid enum input) so approval
                // still succeeds.
                await client.query('SAVEPOINT cat_update');
                try {
                    await client.query(
                        `UPDATE resident SET category =
                           CASE
                             WHEN resident_type::text IN ('Tenant/Renter', 'Boarder') THEN 'non-resident'
                             WHEN EXISTS (
                               SELECT 1 FROM household h
                               JOIN location l ON h.location_id = l.location_id
                               WHERE h.household_id = resident.household_id
                                 AND l.city_name ILIKE '%Naga%'
                             ) THEN 'resident'
                             ELSE 'non-resident'
                           END
                         WHERE resident_id = $1`,
                        [residentId]
                    );
                    await client.query('RELEASE SAVEPOINT cat_update');
                } catch (err) {
                    await client.query('ROLLBACK TO SAVEPOINT cat_update');
                    if (!['42703', '22P02'].includes(err.code)) throw err;
                }
            }

            await client.query('COMMIT');
            return accResult.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new AccountModel();
