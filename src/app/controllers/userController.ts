const z = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../../config");
const { userModel } = require("../../database/models/user");
const { purchaseModel } = require("../../database/models/purchase");
const { signUpSchema, signInSchema } = require("../../database/schema/userSchema");

import { Request, Response } from "express";

interface Course {
    _id: string;
    userId: string;
    courseId: string;
    createdAt?: Date; // Optional
}

async function signUp(req: Request, res: Response) {
    try {
        // Validate the incoming data using Zod
        const userData = signUpSchema.parse(req.body);

        const { email, password, firstName, lastName } = req.body;

        // Hash the password using bcrypt with a salt round of 10
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        })

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

        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        res.status(500).json({
            "message": "Error creating a user",
            "error": error.message
        });
    }
}

async function signIn(req: Request, res: Response) {
    try {
        const signData = signInSchema.parse(req.body);

        const user = await userModel.findOne({ email: signData.email });
        if (!user) {
            return res.status(400).json({
                message: "User with no such email exists !"
            })
        }

        const isMatch = await bcrypt.compare(signData.password.trim(), user.password);
        if (!isMatch) {
            return res.status(400).json({
                "message": "Invalid email or password"
            });
        }

        const token = jwt.sign({
            id: user._id,
            role: "user"
        }, JWT_USER_PASSWORD);

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
            error: error.message
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
        const purchases: Course = await purchaseModel.find({ userId });

        if (!purchases) {
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