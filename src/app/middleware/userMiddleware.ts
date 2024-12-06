import jwt from "jsonwebtoken"
import { JWT_USER_PASSWORD } from "../../config";
import { Request, Response, NextFunction } from "express";

export function userMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided !" });
    }

    try {
        if(!JWT_USER_PASSWORD){
            return res.status(401).json({ message: "User Secret not provided !" });
        }
        const decoded = jwt.verify(token, JWT_USER_PASSWORD) as {id: string; role: string};

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