import jwt from "jsonwebtoken"
import { JWT_USER_PASSWORD, JWT_ADMIN_PASSWORD } from "../../config";
import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided !" });
    }

    if(!JWT_USER_PASSWORD || !JWT_ADMIN_PASSWORD){
        return res.status(401).json({ message: "Secret is not provided !" });
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD) as {id: string; role: string};

        req.user = decoded;
        next();
    }
    catch (error) {
        try {
            const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD) as {id: string; role: string};

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