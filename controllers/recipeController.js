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
        const { title, description, duration, author_id, ingredients } = req.body;

        try{
            await pool.query('BEGIN');

            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: данные вставляются напрямую в SQL без экранирования
            const recipe = await RecipeModel.create(title, description, duration, author_id);
            const newRecipeId = recipe.id;

            for (const item of ingredients) {
                await RecipeModel.addIngredient(newRecipeId, item.id, item.amount);
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
        const {userId} = req.params;
        try{
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: userId вставляется напрямую в SQL
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
            // УЯЗВИМОСТЬ SQL ИНЪЕКЦИИ: id вставляется напрямую в SQL
            const recipe = await RecipeModel.findById(id);
            
            if (!recipe) {
                return res.status(404).send('<h1>Рецепт не найден</h1>');
            }

            // Уязвимость: данные из БД вставляются напрямую в HTML без экранирования
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${recipe.title}</title>
            </head>
            <body>
                <h1>${recipe.title}</h1>
                <p>${recipe.description}</p>
                <p>Время приготовления: ${recipe.duration} минут</p>
                <h2>Ингредиенты:</h2>
                <ul>
                    ${recipe.ingredients && recipe.ingredients.length > 0 
                        ? recipe.ingredients.map(ing => `<li>${ing.name}: ${ing.amount}</li>`).join('')
                        : '<li>Нет ингредиентов</li>'
                    }
                </ul>
            </body>
            </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        }catch (err) {
            res.status(500).send(`<h1>Ошибка: ${err.message}</h1>`);
        }
    }
};

