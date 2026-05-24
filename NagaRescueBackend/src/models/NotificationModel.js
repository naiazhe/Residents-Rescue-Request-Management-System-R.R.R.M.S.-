const BaseModel = require('./BaseModel');

class NotificationModel extends BaseModel {
    constructor() {
        super('notification', 'notification_id');
    }

    async create({ recipient_type, recipient_id, message, operation_log_id }) {
        const result = await this.db.query(
            `INSERT INTO notification (recipient_type, recipient_id, message, operation_log_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [recipient_type, recipient_id || null, message, operation_log_id || null]
        );
        return result.rows[0];
    }

    async findByRecipient(recipient_type, recipient_id) {
        const result = await this.db.query(
            `SELECT * FROM notification
             WHERE recipient_type = $1
               AND ($2::INTEGER IS NULL OR recipient_id = $2)
             ORDER BY created_at DESC
             LIMIT 50`,
            [recipient_type, recipient_id || null]
        );
        return result.rows;
    }

    async markRead(id) {
        const result = await this.db.query(
            `UPDATE notification SET is_read = true
             WHERE notification_id = $1 RETURNING *`,
            [id]
        );
        return result.rows[0] || null;
    }
}

module.exports = new NotificationModel();
