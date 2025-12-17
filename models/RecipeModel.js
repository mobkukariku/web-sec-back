import pool from '../config/database.js';

export const RecipeModel = {
    async findAll(search) {
        if (search) {
            const result = await pool.query(
                `SELECT * FROM recipes WHERE title LIKE $1 OR description LIKE $1`,
                [`%${search}%`]
            );
            return result.rows;
        }
        const result = await pool.query(`SELECT * FROM recipes`);
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(
            `SELECT r.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'ingredient_id', ri.ingredient_id,
                                'amount', ri.amount,
                                'name', i.name
                            )
                        ) FILTER (WHERE ri.ingredient_id IS NOT NULL),
                        '[]'
                    ) as ingredients
             FROM recipes r
             LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
             LEFT JOIN ingredients i ON ri.ingredient_id = i.id
             WHERE r.id = $1
             GROUP BY r.id`,
            [id]
        );
        return result.rows[0];
    },

    async create(title, description, duration, authorId) {
        const result = await pool.query(
            `INSERT INTO recipes (title, description, duration, author_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [title, description, duration, authorId]
        );
        return result.rows[0];
    },

    async findByAuthorId(userId) {
        const result = await pool.query(
            `SELECT r.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'ingredient_id', ri.ingredient_id,
                                'amount', ri.amount,
                                'name', i.name
                            )
                        ) FILTER (WHERE ri.ingredient_id IS NOT NULL),
                        '[]'
                    ) as ingredients
             FROM recipes r
             LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
             LEFT JOIN ingredients i ON ri.ingredient_id = i.id
             WHERE r.author_id = $1
             GROUP BY r.id
             ORDER BY r.id DESC`,
            [userId]
        );
        return result.rows;
    },

    async update(id, title, description, duration) {
        const result = await pool.query(
            `UPDATE recipes 
             SET title = $1, description = $2, duration = $3
             WHERE id = $4
             RETURNING id`,
            [title, description, duration, id]
        );
        return result.rows[0];
    },

    async exists(id) {
        const result = await pool.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        return result.rows.length > 0;
    },

    async deleteIngredients(recipeId) {
        await pool.query(`DELETE FROM recipe_ingredients WHERE recipe_id = $1`, [recipeId]);
    },

    async addIngredient(recipeId, ingredientId, amount) {
        await pool.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
             VALUES ($1, $2, $3)`,
            [recipeId, ingredientId, amount]
        );
    }
};

