const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'naga-rescue-dev-secret-change-me-in-prod';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
    return jwt.verify(token, SECRET);
}

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    }
    try {
        req.user = verifyToken(token);
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

function requireRole(...allowed) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
        if (!allowed.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Forbidden — insufficient role' });
        }
        return next();
    };
}

const requireSuperAdmin = requireRole('super_admin');

module.exports = {
    signToken,
    verifyToken,
    requireAuth,
    requireRole,
    requireSuperAdmin,
};
