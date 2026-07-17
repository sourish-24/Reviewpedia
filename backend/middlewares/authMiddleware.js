import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_reviewpedia_key_2026';

export const requireAuth = (req, res, next) => {
    // Check cookies for token
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload (id, username, role) to request
        next();
    } catch (ex) {
        res.status(401).json({ success: false, error: 'Invalid token.' });
    }
};
