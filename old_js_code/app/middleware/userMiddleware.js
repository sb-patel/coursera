const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require('../../config');

function userMiddleware(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided !" });
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD);

        if (decoded.role !== 'user') {
            return res.status(403).json({ message: 'Access denied. Registered users only.' });
        }
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

module.exports = {
    userMiddleware : userMiddleware
};