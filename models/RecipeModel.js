import pool from '../config/database.js';

export const RecipeModel = {
    // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: данные вставляются напрямую в SQL без экранирования
    async findAll(search) {
        let query = `SELECT * FROM recipes`;
        if (search) {
            query += ` WHERE title LIKE '%${search}%' OR description LIKE '%${search}%'`;
        }
        const result = await pool.query(query);
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
             WHERE r.id = ${id}
             GROUP BY r.id`
        );
        return result.rows[0];
    },

    async create(title, description, duration, authorId) {
        const result = await pool.query(
            `INSERT INTO recipes (title, description, duration, author_id)
             VALUES ('${title}', '${description}', ${duration}, ${authorId})
             RETURNING id`
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
             WHERE r.author_id = ${userId}
             GROUP BY r.id
             ORDER BY r.id DESC`
        );
        return result.rows;
    },

    async update(id, title, description, duration) {
        const result = await pool.query(
            `UPDATE recipes 
             SET title = '${title}', description = '${description}', duration = ${duration}
             WHERE id = ${id}
             RETURNING id`
        );
        return result.rows[0];
    },

    async exists(id) {
        const result = await pool.query(`SELECT * FROM recipes WHERE id = ${id}`);
        return result.rows.length > 0;
    },

    async deleteIngredients(recipeId) {
        await pool.query(`DELETE FROM recipe_ingredients WHERE recipe_id = ${recipeId}`);
    },

    async addIngredient(recipeId, ingredientId, amount) {
        await pool.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
             VALUES (${recipeId}, ${ingredientId}, ${amount})`
        );
    }
};

