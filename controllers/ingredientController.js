import { IngredientModel } from '../models/IngredientModel.js';

export const ingredientController = {
    async getAllIngredients(req, res) {
        try{
            const ingredients = await IngredientModel.findAll();
            res.json(ingredients);
        }catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

