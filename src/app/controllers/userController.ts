import { z } from "zod";
import { Request, Response } from "express";
import { userModel, UserDocument } from "../../database/models/user";
import { purchaseModel, PurchaseDocument } from "../../database/models/purchase";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import JWT_KEYS from "../../config";


const signUpSchema = z.object({
    email: z.string().email(),              // Must be a valid email
    password: z.string().min(6),            // Minimum password length of 6 characters
    firstName: z.string().min(1),           // First name must not be empty
    lastName: z.string().min(1)             // Last name must not be empty
});

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

async function signUp(req: Request, res: Response) {
    try {
        // Validate the incoming data using Zod
        const userData = signUpSchema.parse(req.body);

        const { email, password, firstName, lastName } = userData;

        // Hash the password using bcrypt with a salt round of 10
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await userModel.create({
            email: userData.email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        });

        res.status(201).json({
            message: "User created successfully !"
        });
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
        }

        if (error instanceof Error && (error as any).code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        res.status(500).json({
            "message": "Error creating a user",
            error: error instanceof Error ? error.message : "Unknown Error"
        });
    }
}

async function signIn(req: Request, res: Response) {
    try {
        const signData = signInSchema.parse(req.body);

        const user: UserDocument | null = await userModel.findOne({ email: signData.email });
        if (!user) {
            return res.status(400).json({
                message: "User with no such email exists !"
            })
        }

        const isMatch: boolean = await bcrypt.compare(signData.password.trim(), user.password);
        if (!isMatch) {
            return res.status(400).json({
                "message": "Invalid email or password"
            });
        }

        if(!JWT_KEYS.JWT_USER_PASSWORD){
            return res.status(400).json({
                "message": "No encryption key is provided"
            });
        }

        const token: string = jwt.sign({
            id: user._id,
            role: "user"
        }, JWT_KEYS.JWT_USER_PASSWORD);

        res.json({
            message: 'Login successful',
            token: token
        })
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation Error',
                errors: error.errors
            });
        }

        res.status(500).json({
            message: "Error during login",
            error: error instanceof Error ? error.message : "Unknown Error"
        })
    }
}

async function purchases(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            message: "Unauthorized: User ID is missing"
        });
    }

    const userId = req.user.id;
    try {
        const purchases: PurchaseDocument[] = await purchaseModel.find({ userId });

        if (!purchases || purchases.length === 0) {
            return res.status(404).json({
                message: "No purchases found",
            });
        }

        res.status(200).json(purchases);
    }
    catch (error: unknown) {
        res.status(500).json({ message: 'Error fetching purchases', error: error instanceof Error ? error.message : "Unknown Error" });
    }
}

module.exports = {
    signUp: signUp,
    signIn: signIn,
    purchases: purchases
};