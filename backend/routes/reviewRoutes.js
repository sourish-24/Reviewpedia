import express from 'express';
import { getReviews, createReview, deleteReview, updateReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', requireAuth, upload.single('image'), createReview);
router.put('/:id', requireAuth, upload.single('image'), updateReview);
router.delete('/:id', requireAuth, deleteReview);

export default router;
