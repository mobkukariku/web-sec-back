import { RecipeModel } from '../models/RecipeModel.js';
import pool from '../config/database.js';

export const recipeController = {
    async getAllRecipes(req, res) {
        const {search} = req.query;
        try{
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: поисковый запрос вставляется напрямую в SQL
            const recipes = await RecipeModel.findAll(search);
            // Уязвимость: возвращаем данные без санитизации
            res.json(recipes);
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    },

    async getRecipeById(req, res) {
        const {id} = req.params;
        try{
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: id вставляется напрямую в SQL
            const recipe = await RecipeModel.findById(id);
            res.json(recipe);
        }catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async createRecipe(req, res) {
        const { title, description, duration, ingredients } = req.body;
        const authorId = req.user.userId; // Получаем из JWT токена

        try{
            await pool.query('BEGIN');

            const recipe = await RecipeModel.create(title, description, duration, authorId);
            const newRecipeId = recipe.id;

            if (ingredients && Array.isArray(ingredients)) {
                for (const item of ingredients) {
                    if (item.id && item.amount) {
                        await RecipeModel.addIngredient(newRecipeId, item.id, item.amount);
                    }
                }
            }

            await pool.query('COMMIT');

            res.status(201).json({
                message: "Рецепт и ингредиенты успешно созданы",
                recipeId: newRecipeId
            });

        }catch (err) {
            await pool.query('ROLLBACK');
            res.status(500).json({ error: err.message });
        }
    },

    async getMyRecipes(req, res) {
        const userId = req.user.userId; // Получаем из JWT токена
        try{
            const recipes = await RecipeModel.findByAuthorId(userId);
            res.json(recipes);
        }catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateRecipe(req, res) {
        const {id} = req.params;
        const { title, description, duration, ingredients } = req.body;

        try{
            await pool.query('BEGIN');

            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: id вставляется напрямую в SQL
            const exists = await RecipeModel.exists(id);
            if (!exists) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ error: 'Рецепт не найден' });
            }

            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: данные вставляются напрямую в SQL без экранирования
            await RecipeModel.update(id, title, description, duration);

            // Удаляем старые ингредиенты
            await RecipeModel.deleteIngredients(id);

            // Добавляем новые ингредиенты
            if (ingredients && ingredients.length > 0) {
                for (const item of ingredients) {
                    await RecipeModel.addIngredient(id, item.id, item.amount);
                }
            }

            await pool.query('COMMIT');

            res.json({
                message: "Рецепт успешно обновлен",
                recipeId: id
            });

        }catch (err) {
            await pool.query('ROLLBACK');
            res.status(500).json({ error: err.message });
        }
    },

    async getRecipeHtml(req, res) {
        const {id} = req.params;
        try{
            const recipe = await RecipeModel.findById(id);
            
            if (!recipe) {
                return res.status(404).send('<h1>Рецепт не найден</h1>');
            }

            // Функция для экранирования HTML
            const escapeHtml = (text) => {
                if (!text) return '';
                return String(text)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            const safeTitle = escapeHtml(recipe.title);
            const safeDescription = escapeHtml(recipe.description);
            const safeDuration = escapeHtml(recipe.duration);

            const ingredientsList = recipe.ingredients && recipe.ingredients.length > 0 
                ? recipe.ingredients.map(ing => 
                    `<li>${escapeHtml(ing.name)}: ${escapeHtml(ing.amount)}</li>`
                  ).join('')
                : '<li>Нет ингредиентов</li>';

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${safeTitle}</title>
            </head>
            <body>
                <h1>${safeTitle}</h1>
                <p>${safeDescription}</p>
                <p>Время приготовления: ${safeDuration} минут</p>
                <h2>Ингредиенты:</h2>
                <ul>
                    ${ingredientsList}
                </ul>
            </body>
            </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        }catch (err) {
            const errorMessage = String(err.message)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            res.status(500).send(`<h1>Ошибка: ${errorMessage}</h1>`);
        }
    }
};

