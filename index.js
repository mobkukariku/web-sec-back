import express from 'express';
import bcrypt from 'bcrypt';
import {Pool} from 'pg';
import cors from 'cors';
import bodyParser from "body-parser";

const app = express();
const port = 3001;
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
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        res.json({ message: 'Пользователь зарегистрирован' });
    }catch(err){
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const {email, password} = req.body;
    try{
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if(!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);

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
            `SELECT * FROM recipes WHERE title ILIKE $1`,
            [`%${search}%`]
        );

        res.json(result.rows);
    }catch (err){
        res.status(500).json({ error: err.message });
    }
})


app.post('/api/recipes', async (req, res) => {
    const { userId, title, description, duration, difficulty, ingredientIds } = req.body;

    try{
        await pool.query('BEGIN');

        const recipeRes = await pool.query(
            `INSERT INTO recipes (title, description, duration, difficulty)
       VALUES ($1, $2, $3, $4) RETURNING id`,
            [title, description, duration, difficulty]
        );
        const recipeId = recipeRes.rows[0].id;

        // Связь с пользователем
        await pool.query(
            `INSERT INTO user_recipe (user_id, recipe_id) VALUES ($1, $2)`,
            [userId, recipeId]
        );

        // Добавление ингредиентов
        for (let ingId of ingredientIds) {
            await pool.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES ($1, $2)`,
                [recipeId, ingId]
            );
        }

        await pool.query('COMMIT');
        res.json({ message: 'Рецепт создан', recipeId });
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
