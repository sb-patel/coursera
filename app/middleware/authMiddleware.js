const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD, JWT_ADMIN_PASSWORD } = require('../../config');

function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided !" });
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD);

        req.user = decoded;
        next();
    }
    catch (error) {
        try {
            const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);

            req.user = decoded;
            next();
        }
        catch (error) {
            let message = "";
            if (error instanceof jwt.TokenExpiredError) {
                message = 'Token has expired';
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                message = 'Invalid token or tampered token';
            }
            else {
                message = 'Token verification failed';
            }
            res.status(403).json({
                message,
                error
            })
        }
    }
}

module.exports = {
    authMiddleware: authMiddleware
};