import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
    }
    return 'development_only_jwt_secret_key_change_in_env';
};

export const requireAuth = (req, res, next) => {
    // Check cookies for token
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded; // Attach user payload (id, username, role) to request
        next();
    } catch (ex) {
        res.status(401).json({ success: false, error: 'Invalid token.' });
    }
};
