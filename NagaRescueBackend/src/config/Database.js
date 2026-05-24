const { Pool } = require('pg');
require('dotenv').config();

class Database {
    constructor() {
        if (Database._instance) return Database._instance;

        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT) || 5432,
        });

        this.pool.on('connect', () => console.log('✅ Connected to PostgreSQL'));
        this.pool.on('error', (err) => {
            console.error('❌ Unexpected DB pool error:', err);
            process.exit(-1);
        });

        Database._instance = this;
    }

    query(text, params) {
        return this.pool.query(text, params);
    }

    connect() {
        return this.pool.connect();
    }
}

module.exports = new Database();
