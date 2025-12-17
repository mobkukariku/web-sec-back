import pool from '../config/database.js';

export const UserModel = {
    // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: данные вставляются напрямую в SQL без экранирования
    async create(email, passwordHash, name) {
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name) VALUES ('${email}', '${passwordHash}', '${name}') RETURNING id`
        );
        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
        return result.rows[0];
    },

    async findById(userId) {
        const result = await pool.query(`SELECT id, email, name FROM users WHERE id = ${userId}`);
        return result.rows[0];
    },

    async findByIdFull(userId) {
        const result = await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
        return result.rows[0];
    },

    async update(userId, updates) {
        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ${userId} RETURNING id, email, name`;
        const result = await pool.query(updateQuery);
        return result.rows[0];
    }
};

