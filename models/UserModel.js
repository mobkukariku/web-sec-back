import pool from '../config/database.js';

export const UserModel = {
    async create(email, passwordHash, name) {
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id`,
            [email, passwordHash, name]
        );
        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows[0];
    },

    async findById(userId) {
        const result = await pool.query(`SELECT id, email, name FROM users WHERE id = $1`, [userId]);
        return result.rows[0];
    },

    async findByIdFull(userId) {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        return result.rows[0];
    },

    async update(userId, updates) {
        // Безопасное обновление с параметризованными запросами
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            fields.push(`email = $${paramIndex++}`);
            values.push(updates.email);
        }
        if (updates.password_hash !== undefined) {
            fields.push(`password_hash = $${paramIndex++}`);
            values.push(updates.password_hash);
        }

        if (fields.length === 0) {
            throw new Error('Нет полей для обновления');
        }

        values.push(userId);
        const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name`;
        const result = await pool.query(updateQuery, values);
        return result.rows[0];
    }
};

