import express from 'express';
import { getConversations, getMessages, uploadChatMedia, createOrGetConversation, sendMessage, deleteConversation, deleteMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { chatUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/conversations', getConversations);
router.post('/conversations', createOrGetConversation);
router.delete('/conversations/:conversationId', deleteConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);
router.delete('/messages/:messageId', deleteMessage);
router.post('/upload', chatUpload.single('file'), uploadChatMedia);

export default router;
