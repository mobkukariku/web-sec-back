import express from 'express';
import { profileController } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId, validateInput } from '../middleware/security.js';

const router = express.Router();

// Все маршруты профиля требуют аутентификации
router.use(authenticateToken);

// Получить свой профиль (userId из токена)
router.get('/me', profileController.getMyProfile);
// Обновить свой профиль
router.put('/me', profileController.updateMyProfile);
// Получить профиль по ID (для совместимости)
router.get('/:userId', validateInput(validateId), profileController.getProfile);
// Обновить профиль по ID (для совместимости)
router.put('/:userId', validateInput(validateId), profileController.updateProfile);
// Получить комментарии пользователя
router.get('/user-comments/:userId', validateInput(validateId), profileController.getUserComments);

export default router;

