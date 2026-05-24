const db = require('../config/Database');

class BaseModel {
    constructor(tableName, primaryKey) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.db = db;
    }

    async findAll() {
        const result = await this.db.query(
            `SELECT * FROM ${this.tableName} ORDER BY ${this.primaryKey}`
        );
        return result.rows;
    }

    async findById(id) {
        const result = await this.db.query(
            `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async delete(id) {
        const result = await this.db.query(
            `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`,
            [id]
        );
        return result.rows[0] || null;
    }

    async query(text, params) {
        return this.db.query(text, params);
    }

    async getClient() {
        return this.db.connect();
    }
}

module.exports = BaseModel;
