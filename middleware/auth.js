const jwt = require('jsonwebtoken');

/**
 * Express middleware that verifies a JWT from the Authorization header.
 * Attach to any route that requires an authenticated admin user.
 *
 * Usage:  router.post('/', requireAuth, handler)
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const token = header.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { requireAuth };
