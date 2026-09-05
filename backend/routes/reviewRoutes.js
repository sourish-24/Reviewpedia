import express from 'express';
import { 
    getReviews, 
    getReviewById,
    createReview, 
    deleteReview, 
    updateReview, 
    toggleLikeReview,
    updatePurchaseInfo,
    getLinkMetadata,
    getComments,
    addComment,
    toggleLikeComment,
    deleteComment
} from '../controllers/reviewController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', requireAuth, upload.array('images', 10), createReview);

// Link preview metadata
router.post('/fetch-metadata', requireAuth, getLinkMetadata);

// Review details and likes
router.get('/:id', getReviewById);
router.post('/:id/like', requireAuth, toggleLikeReview);
router.put('/:id', requireAuth, upload.array('images', 10), updateReview);
router.patch('/:id/purchase-info', requireAuth, updatePurchaseInfo);
router.delete('/:id', requireAuth, deleteReview);

// Comments and nested replies
router.get('/:id/comments', getComments);
router.post('/:id/comments', requireAuth, addComment);
router.post('/:id/comments/:commentId/like', requireAuth, toggleLikeComment);
router.delete('/:id/comments/:commentId', requireAuth, deleteComment);

export default router;
