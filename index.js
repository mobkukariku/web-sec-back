import express from 'express';
import bcrypt from 'bcrypt';
import {Pool} from 'pg';
import cors from 'cors';
import bodyParser from "body-parser";

const app = express();
const port = 3002;
app.use(cors());
app.use(bodyParser.json());


const pool = new Pool({
    user: 'admin',
    password: 'admin',
    host: 'localhost',
    port: 5432,
    database: 'mydb'
});

//endpoints

app.post('/api/register', async (req, res) => {
    const {email, password} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, hashedPassword]);
        res.json({ message: 'Пользователь зарегистрирован' });
    }catch(err){
        res.status(400).json({ error: err });
    }
});

app.post('/api/login', async (req, res) => {
    const {email, password} = req.body;
    try{
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if(!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if(!validPassword) return res.status(400).json({ error: 'Invalid password' });

        res.json({ message: 'Успешный вход', userId: user.id });
    }catch (err){
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/recipes', async (req, res) => {
    const {search} = req.query;
    try{
        const result = await pool.query(
            `SELECT * FROM recipes`
        );

        res.json(result.rows);
    }catch (err){
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/recipes/:id', async (req, res) => {
    const {id} = req.params;
    try{
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
             GROUP BY r.id`, [id]
        );

        res.json(result.rows[0]);
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
})


app.post('/api/recipes', async (req, res) => {
    const { title, description, duration, author_id, ingredients } = req.body;

    try{

        pool.query('BEGIN');

        const recipeQuery = `
          INSERT INTO recipes (title, description, duration, author_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `;

        const recipeResult = await pool.query(recipeQuery, [title, description, duration, author_id]);
        const newRecipeId = recipeResult.rows[0].id;

        const ingredientQuery = `
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
          VALUES ($1, $2, $3)
        `;

        for (const item of ingredients) {
            await pool.query(ingredientQuery, [newRecipeId, item.id, item.amount]);
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
})




app.get('/api/ingredients', async (req, res) => {
    const result = await pool.query('SELECT * FROM ingredients');
    try{
        res.json(result.rows);
    }catch (err){
        res.status(500).json({ error: err.message });
    }
})




app.listen(port, () => {
    console.log(`Vulnerable server running on port ${port}`);
});
