/**
 * Seed a super_admin account.
 *   node src/scripts/seedSuperAdmin.js
 *
 * Defaults: username=admin, password=admin12345 (override via env or flags).
 */
const bcrypt = require('bcrypt');
const db = require('../config/Database');

async function main() {
    const username = process.env.SA_USERNAME || 'admin';
    const password = process.env.SA_PASSWORD || 'admin12345';
    const firstName = process.env.SA_FIRST_NAME || 'Super';
    const lastName  = process.env.SA_LAST_NAME  || 'Admin';

    // 1. Schema migrations OUTSIDE a transaction (ALTER TYPE … ADD VALUE
    //    cannot run inside a transaction block in older PG; safer to do it first).
    await db.query(`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
            id               SERIAL PRIMARY KEY,
            actor_account_id INT,
            actor_username   TEXT,
            action           TEXT NOT NULL,
            target_type      TEXT,
            target_id        TEXT,
            details          JSONB,
            created_at       TIMESTAMP DEFAULT NOW()
        )
    `);

    // Add 'super_admin' to the user_role enum if not already present.
    const hasRole = await db.query(
        `SELECT 1 FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
         WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin'`
    );
    if (hasRole.rowCount === 0) {
        await db.query(`ALTER TYPE user_role ADD VALUE 'super_admin'`);
        console.log('🔧 Added "super_admin" to user_role enum');
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query(
            `SELECT account_id FROM account WHERE username = $1`,
            [username]
        );
        if (existing.rows[0]) {
            console.log(`ℹ️  super_admin "${username}" already exists (account_id=${existing.rows[0].account_id}). Updating password + role.`);
            const hashed = await bcrypt.hash(password, 10);
            await client.query(
                `UPDATE account
                 SET password=$1, role='super_admin', is_active=true, is_verified=true
                 WHERE account_id=$2`,
                [hashed, existing.rows[0].account_id]
            );
            await client.query('COMMIT');
            console.log(`✅ Updated. username="${username}" password="${password}"`);
            return;
        }

        const loc = await client.query(
            `INSERT INTO location (province_name, city_name, barangay_name, street_name)
             VALUES ('Camarines Sur', 'Naga City', 'City Hall', 'J. Miranda Ave.')
             RETURNING location_id`
        );
        const hh = await client.query(
            `INSERT INTO household (location_id, member_count) VALUES ($1, 1) RETURNING household_id`,
            [loc.rows[0].location_id]
        );
        // Discover the gender_type enum values from the catalog.
        const enumRows = await client.query(
            `SELECT unnest(enum_range(NULL::gender_type))::text AS v`
        );
        const sx = enumRows.rows[0]?.v;
        if (!sx) throw new Error('gender_type enum has no values');

        const res = await client.query(
            `INSERT INTO resident (household_id, first_name, last_name, sex, birthdate, is_representative)
             VALUES ($1, $2, $3, $4, '1990-01-01', true)
             RETURNING resident_id`,
            [hh.rows[0].household_id, firstName, lastName, sx]
        );
        const hashed = await bcrypt.hash(password, 10);
        const acc = await client.query(
            `INSERT INTO account (resident_id, username, password, role, is_verified, is_active)
             VALUES ($1, $2, $3, 'super_admin', true, true)
             RETURNING account_id, username, role`,
            [res.rows[0].resident_id, username, hashed]
        );

        await client.query('COMMIT');
        console.log(`✅ Seeded super_admin account_id=${acc.rows[0].account_id}`);
        console.log(`   username = "${username}"`);
        console.log(`   password = "${password}"`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seed failed:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        process.exit();
    }
}

main();
