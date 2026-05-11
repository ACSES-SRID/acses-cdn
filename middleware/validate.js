const { ObjectId } = require('mongodb');

/**
 * Express middleware that validates req.params.id is a valid MongoDB ObjectId.
 * Use on any route with an :id parameter to prevent crashes from malformed IDs.
 *
 * Usage:  router.put('/:id', requireAuth, validateId, handler)
 */
function validateId(req, res, next) {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid or missing document ID' });
    }

    next();
}

module.exports = { validateId };
