import express from 'express';
import { recipeController } from '../controllers/recipeController.js';

const router = express.Router();

router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);
router.get('/:id/html', recipeController.getRecipeHtml);
router.post('/', recipeController.createRecipe);
router.put('/:id', recipeController.updateRecipe);
router.get('/my-recipes/:userId', recipeController.getMyRecipes);

export default router;

