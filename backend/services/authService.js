import User from '../models/User.js';
import Review from '../models/Review.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
    }
    return 'development_only_jwt_secret_key_change_in_env';
};

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
        role: newUser.role,
        profilePic: newUser.profilePic,
        totalMediaBytes: newUser.totalMediaBytes || 0
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
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        totalMediaBytes: user.totalMediaBytes || 0
    };

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

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

    const oldUsername = user.username;
    if (data.username && data.username !== user.username) {
        const existingUsername = await User.findOne({ username: data.username });
        if (existingUsername) throw new Error('Username already taken');
        user.username = data.username;

        // Cascade username update to user's existing reviews
        await Review.updateMany(
            { $or: [{ 'user.id': user._id.toString() }, { 'user.id': user._id }, { 'user.name': oldUsername }] },
            { $set: { 'user.name': data.username } }
        );
    }

    if (data.email && data.email !== user.email) {
        const existingEmail = await User.findOne({ email: data.email });
        if (existingEmail) throw new Error('Email already taken');
        user.email = data.email;
    }

    if (data.profilePic) {
        user.profilePic = data.profilePic;
    }

    await user.save();

    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        totalMediaBytes: user.totalMediaBytes || 0
    };

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            totalMediaBytes: user.totalMediaBytes || 0
        }
    };
};

export const deleteAccount = async (userId, confirmEmail) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
        throw new Error('Email address does not match');
    }

    // Delete user's reviews
    await Review.deleteMany({
        $or: [{ 'user.id': user._id.toString() }, { 'user.id': user._id }]
    });

    // Delete conversations and messages associated with this user
    const userConvos = await Conversation.find({ participants: userId });
    const userConvoIds = userConvos.map(c => c._id);
    if (userConvoIds.length > 0) {
        await Message.deleteMany({
            $or: [{ conversationId: { $in: userConvoIds } }, { sender: userId }]
        });
        await Conversation.deleteMany({ participants: userId });
    }

    // Delete user document
    await User.findByIdAndDelete(userId);

    return { success: true, message: 'Account deleted successfully' };
};
