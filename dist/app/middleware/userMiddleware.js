"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
function userMiddleware(req, res, next) {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided !" });
    }
    try {
        if (!config_1.JWT_USER_PASSWORD) {
            return res.status(401).json({ message: "User Secret not provided !" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_USER_PASSWORD);
        if (decoded.role !== 'user') {
            return res.status(403).json({ message: 'Access denied. Registered users only.' });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        let message = "";
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            message = 'Token has expired';
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            message = 'Invalid token or tampered token';
        }
        else {
            message = 'Token verification failed';
        }
        res.status(403).json({
            message,
            error
        });
    }
}
exports.userMiddleware = userMiddleware;
