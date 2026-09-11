import express from 'express';
import { 
    register, 
    login, 
    logout, 
    getMe, 
    updateProfile, 
    getUserByUsername, 
    deleteAccount,
    sendSignupOtp,
    sendEmailUpdateOtp,
    sendForgotPasswordOtp,
    resetPassword
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/send-signup-otp', sendSignupOtp);
router.post('/register', register);
router.post('/send-forgot-password-otp', sendForgotPasswordOtp);
router.post('/reset-password', resetPassword);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.get('/user/:username', getUserByUsername);
router.post('/send-email-update-otp', requireAuth, sendEmailUpdateOtp);
router.put('/profile', requireAuth, upload.single('profilePic'), updateProfile);
router.delete('/account', requireAuth, deleteAccount);

export default router;
