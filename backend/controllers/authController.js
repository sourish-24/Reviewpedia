import * as authService from '../services/authService.js';
import User from '../models/User.js';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, user });
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
