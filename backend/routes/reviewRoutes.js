import express from 'express';
import { getReviews, createReview, deleteReview, updateReview, toggleLikeReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', requireAuth, upload.array('images', 10), createReview);
router.post('/:id/like', requireAuth, toggleLikeReview);
router.put('/:id', requireAuth, upload.array('images', 10), updateReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;
