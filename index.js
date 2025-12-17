import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import { PORT } from './config/app.js';
import { disableSecurityHeaders } from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(disableSecurityHeaders);

// Routes
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api', searchRoutes);

app.listen(PORT, () => {
    console.log(`Vulnerable server running on port ${PORT}`);
});
