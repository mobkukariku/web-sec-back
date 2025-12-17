import pool from '../config/database.js';

export const IngredientModel = {
    async findAll() {
        const result = await pool.query('SELECT * FROM ingredients');
        return result.rows;
    }
};

