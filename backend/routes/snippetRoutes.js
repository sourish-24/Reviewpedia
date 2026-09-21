import express from 'express';
import { 
    getSnippets, 
    getSnippetById, 
    createSnippet, 
    toggleLikeSnippet, 
    getComments,
    addComment, 
    toggleLikeComment,
    deleteComment, 
    deleteSnippet, 
    incrementView 
} from '../controllers/snippetController.js';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getSnippets);
router.get('/:id', optionalAuth, getSnippetById);
router.post('/', requireAuth, upload.single('video'), createSnippet);
router.post('/:id/like', requireAuth, toggleLikeSnippet);
router.get('/:id/comments', optionalAuth, getComments);
router.post('/:id/comments', requireAuth, addComment);
router.post('/:id/comments/:commentId/like', requireAuth, toggleLikeComment);
router.delete('/:id/comments/:commentId', requireAuth, deleteComment);
router.delete('/:id', requireAuth, deleteSnippet);
router.post('/:id/view', incrementView);

export default router;
