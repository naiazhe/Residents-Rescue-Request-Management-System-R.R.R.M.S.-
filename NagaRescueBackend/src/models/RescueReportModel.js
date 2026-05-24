const BaseModel = require('./BaseModel');

class RescueReportModel extends BaseModel {
    constructor() {
        super('rescue_report', 'rescue_report_id');
    }

    async createWithOutcomes(operation_id, outcomes) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');

            const reportResult = await client.query(
                `INSERT INTO rescue_report (operation_id) VALUES ($1) RETURNING *`,
                [operation_id]
            );
            const report = reportResult.rows[0];

            const outcomeRows = [];
            for (const { resident_id, outcome } of outcomes) {
                const row = await client.query(
                    `INSERT INTO rescue_member_outcome (rescue_report_id, resident_id, outcome)
                     VALUES ($1, $2, $3) RETURNING *`,
                    [report.rescue_report_id, resident_id, outcome]
                );
                outcomeRows.push(row.rows[0]);
            }

            await client.query('COMMIT');
            return { report, outcomes: outcomeRows };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async findByOperation(operation_id) {
        const result = await this.db.query(
            `SELECT rr.*, rmo.resident_id, rmo.outcome, r.first_name, r.last_name
             FROM rescue_report rr
             JOIN rescue_member_outcome rmo ON rr.rescue_report_id = rmo.rescue_report_id
             JOIN resident r ON rmo.resident_id = r.resident_id
             WHERE rr.operation_id = $1`,
            [operation_id]
        );
        return result.rows;
    }
}

module.exports = new RescueReportModel();
