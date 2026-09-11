import * as authService from '../services/authService.js';
import User from '../models/User.js';
import EmailOtp from '../models/EmailOtp.js';
import { generateOtp, sendOtpEmail } from '../services/emailService.js';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Send 6-digit OTP for signup verification
export const sendSignupOtp = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'A valid email address is required' });
        }
        if (!username || username.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Username must be at least 2 characters' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        // Check if email already registered
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: 'An account with this email already exists' });
        }

        // Check if username already taken
        const existingUsername = await User.findOne({ username: cleanUsername });
        if (existingUsername) {
            return res.status(400).json({ success: false, error: 'Username is already taken' });
        }

        const otp = generateOtp();

        // Save or update OTP record
        await EmailOtp.findOneAndUpdate(
            { email: cleanEmail, purpose: 'signup' },
            { otp, attempts: 0, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send OTP email
        await sendOtpEmail({
            to: cleanEmail,
            otp,
            purpose: 'signup',
            username: cleanUsername
        });

        res.status(200).json({ 
            success: true, 
            message: `Verification code sent to ${cleanEmail}` 
        });
    } catch (error) {
        console.error('Error in sendSignupOtp:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to send verification code' });
    }
};

// Send 6-digit OTP for email address change
export const sendEmailUpdateOtp = async (req, res) => {
    try {
        const { newEmail } = req.body;
        if (!newEmail || !newEmail.includes('@')) {
            return res.status(400).json({ success: false, error: 'A valid new email address is required' });
        }

        const cleanNewEmail = newEmail.trim().toLowerCase();
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (currentUser.email.toLowerCase() === cleanNewEmail) {
            return res.status(400).json({ success: false, error: 'This is already your current email address' });
        }

        // Check if new email is taken by someone else
        const existingUser = await User.findOne({ email: cleanNewEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'This email is already in use by another account' });
        }

        const otp = generateOtp();

        // Save or update OTP record
        await EmailOtp.findOneAndUpdate(
            { email: cleanNewEmail, purpose: 'email_update' },
            { otp, attempts: 0, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send OTP to the new email address
        await sendOtpEmail({
            to: cleanNewEmail,
            otp,
            purpose: 'email_update',
            username: currentUser.username
        });

        res.status(200).json({ 
            success: true, 
            message: `Verification code sent to ${cleanNewEmail}` 
        });
    } catch (error) {
        console.error('Error in sendEmailUpdateOtp:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to send verification code' });
    }
};

export const register = async (req, res) => {
    try {
        const { username, email, password, otp } = req.body;
        if (!otp) {
            return res.status(400).json({ success: false, error: 'Email verification code is required' });
        }

        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanOtp = (otp || '').toString().trim();

        const otpRecord = await EmailOtp.findOne({ email: cleanEmail, purpose: 'signup' });
        if (!otpRecord) {
            return res.status(400).json({ success: false, error: 'Verification code expired or not found. Please request a new code.' });
        }

        if (otpRecord.attempts >= 5) {
            await EmailOtp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
        }

        if (otpRecord.otp !== cleanOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your email and try again.' });
        }

        // OTP verified successfully! Delete it so it cannot be reused
        await EmailOtp.deleteOne({ _id: otpRecord._id });

        const { token, user } = await authService.registerUser(req.body);

        res.cookie('token', token, getCookieOptions());

        res.status(201).json({ success: true, token, user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.loginUser(email, password);

        res.cookie('token', token, getCookieOptions());

        res.status(200).json({ success: true, token, user });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.profilePic = req.file.path;
        }

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // If email is being changed, verify the OTP sent to the new email
        if (updateData.email && updateData.email.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
            const cleanNewEmail = updateData.email.trim().toLowerCase();
            const cleanOtp = (updateData.otp || '').toString().trim();

            if (!cleanOtp) {
                return res.status(400).json({ success: false, error: 'Verification code is required to update your email address' });
            }

            const otpRecord = await EmailOtp.findOne({ email: cleanNewEmail, purpose: 'email_update' });
            if (!otpRecord) {
                return res.status(400).json({ success: false, error: 'Verification code expired or not found. Please request a new code.' });
            }

            if (otpRecord.attempts >= 5) {
                await EmailOtp.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
            }

            if (otpRecord.otp !== cleanOtp) {
                otpRecord.attempts += 1;
                await otpRecord.save();
                return res.status(400).json({ success: false, error: 'Invalid verification code. Please try again.' });
            }

            // OTP verified! Delete record
            await EmailOtp.deleteOne({ _id: otpRecord._id });
        }

        const { token, user } = await authService.updateProfile(req.user.id, updateData);
        
        res.cookie('token', token, getCookieOptions());

        res.status(200).json({ success: true, token, user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('username profilePic email createdAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email confirmation is required' });
        }
        await authService.deleteAccount(req.user.id, email);
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Send 6-digit OTP for Forgot Password
export const sendForgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'A valid email address is required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check if user exists
        const existingUser = await User.findOne({ email: cleanEmail });
        if (!existingUser) {
            return res.status(404).json({ success: false, error: 'No account found with this email address' });
        }

        const otp = generateOtp();

        // Save or update OTP record
        await EmailOtp.findOneAndUpdate(
            { email: cleanEmail, purpose: 'forgot_password' },
            { otp, attempts: 0, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send OTP email
        await sendOtpEmail({
            to: cleanEmail,
            otp,
            purpose: 'forgot_password',
            username: existingUser.username
        });

        res.status(200).json({ 
            success: true, 
            message: `Password reset code sent to ${cleanEmail}` 
        });
    } catch (error) {
        console.error('Error in sendForgotPasswordOtp:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to send password reset code' });
    }
};

// Reset Password with OTP verification
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'A valid email address is required' });
        }
        if (!otp) {
            return res.status(400).json({ success: false, error: 'Verification code is required' });
        }
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();

        const otpRecord = await EmailOtp.findOne({ email: cleanEmail, purpose: 'forgot_password' });
        if (!otpRecord) {
            return res.status(400).json({ success: false, error: 'Verification code expired or not found. Please request a new code.' });
        }

        if (otpRecord.attempts >= 5) {
            await EmailOtp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
        }

        if (otpRecord.otp !== cleanOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your email and try again.' });
        }

        // OTP verified successfully! Delete it
        await EmailOtp.deleteOne({ _id: otpRecord._id });

        // Reset user password and generate new token
        const { token, user } = await authService.resetUserPassword(cleanEmail, newPassword);

        res.cookie('token', token, getCookieOptions());

        res.status(200).json({ 
            success: true, 
            token, 
            user, 
            message: 'Password reset successfully' 
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to reset password' });
    }
};
