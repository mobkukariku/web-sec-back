import express from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { validateRegister, validateLogin, validateInput } from '../middleware/security.js';

const router = express.Router();

// Строгий rate limiting для аутентификации
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 попыток входа/регистрации
    message: 'Слишком много попыток входа, попробуйте позже.',
    skipSuccessfulRequests: true,
});

router.post('/register', authLimiter, validateInput(validateRegister), authController.register);
router.post('/login', authLimiter, validateInput(validateLogin), authController.login);

export default router;

