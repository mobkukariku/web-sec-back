import express from 'express';
import { recipeController } from '../controllers/recipeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId, validateRecipe, validateInput } from '../middleware/security.js';

const router = express.Router();

// Публичные маршруты (не требуют аутентификации)
router.get('/', recipeController.getAllRecipes);
router.get('/:id', validateInput(validateId), recipeController.getRecipeById);
router.get('/:id/html', validateInput(validateId), recipeController.getRecipeHtml);

// Защищенные маршруты (требуют аутентификации)
router.use(authenticateToken);

router.post('/', validateInput(validateRecipe), recipeController.createRecipe);
router.put('/:id', validateInput([...validateId, ...validateRecipe]), recipeController.updateRecipe);
router.get('/my-recipes/me', recipeController.getMyRecipes);

export default router;

