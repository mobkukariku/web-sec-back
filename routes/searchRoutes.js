import express from 'express';
import { searchController } from '../controllers/searchController.js';

const router = express.Router();

router.get('/search', searchController.search);
router.post('/comments', searchController.createComment);

export default router;

