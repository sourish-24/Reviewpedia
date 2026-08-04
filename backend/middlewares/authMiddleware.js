import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing. Using default fallback secret key.');
    return 'reviewpedia_default_jwt_secret_key_production_2026';
};

export const requireAuth = (req, res, next) => {
    // Check cookies for token, or Authorization header as fallback
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

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
