import express from 'express';
import { profileController } from '../controllers/profileController.js';

const router = express.Router();

router.get('/:userId', profileController.getProfile);
router.put('/:userId', profileController.updateProfile);
router.get('/user-comments/:userId', profileController.getUserComments);

export default router;

