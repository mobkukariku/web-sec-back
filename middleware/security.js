// Валидация входных данных
import { body, param, query, validationResult } from 'express-validator';

export const validateInput = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    };
};

// Санитизация строк для защиты от XSS
export const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '')
        .trim();
};

// Валидация ID параметров
export const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID должен быть положительным числом'),
    param('userId').optional().isInt({ min: 1 }).withMessage('User ID должен быть положительным числом')
];

// Валидация рецепта
export const validateRecipe = [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Название должно быть от 1 до 200 символов'),
    body('description').trim().isLength({ min: 1, max: 5000 }).withMessage('Описание должно быть от 1 до 5000 символов'),
    body('duration').isInt({ min: 1, max: 10000 }).withMessage('Длительность должна быть от 1 до 10000 минут'),
    body('ingredients').optional().isArray().withMessage('Ингредиенты должны быть массивом')
];

// Валидация регистрации
export const validateRegister = [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Имя должно быть от 1 до 100 символов')
];

// Валидация входа
export const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
];

