import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_reviewpedia_key_2026';

export const registerUser = async (data) => {
    const { username, email, password } = data;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new Error('User already exists with this email or username');
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // Return user without password
    return {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
    };
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return {
        token,
        user: payload
    };
};

export const updateProfile = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (data.username && data.username !== user.username) {
        const existingUsername = await User.findOne({ username: data.username });
        if (existingUsername) throw new Error('Username already taken');
        user.username = data.username;
    }

    if (data.email && data.email !== user.email) {
        const existingEmail = await User.findOne({ email: data.email });
        if (existingEmail) throw new Error('Email already taken');
        user.email = data.email;
    }

    await user.save();

    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    };
};
