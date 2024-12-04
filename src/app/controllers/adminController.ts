import { z } from "zod";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongoose').Types;
const { JWT_ADMIN_PASSWORD } = require("../../config");
import { adminModel, AdminDocument } from "../../database/models/admin";
const { courseModel } = require("../../database/models/course");
const { courseSchema } = require("../../database/schema/courseSchema");
// const { signUpSchema, signInSchema } = require("../../database/schema/userSchema");

import { Request, Response } from "express"

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
            };
        }
    }
}

// Define the shape of a course
interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    creatorId: string;
    imageUrl?: string; // Optional
    createdAt?: Date; // Optional
}

const signUpSchema = z.object({
    email: z.string().email(),              // Must be a valid email
    password: z.string().min(6),            // Minimum password length of 6 characters
    firstName: z.string().min(1, "First name is required"),           // First name must not be empty
    lastName: z.string().min(1)             // Last name must not be empty
});

// Define the TypeScript type for the request body based on the Zod schema
type SignUpData = z.infer<typeof signUpSchema>;

async function signUp(req: Request, res: Response) {
    try {
        // Validate the incoming data using Zod
        const userData: SignUpData = signUpSchema.parse(req.body);

        const { email, password, firstName, lastName } = userData;

        // Hash the password using bcrypt with a salt round of 10
        const hashedPassword: string = await bcrypt.hash(userData.password, 10);

        // await adminModel.create({
        //     email: email,
        //     password: hashedPassword,
        //     firstName: firstName,
        //     lastName: lastName
        // })

        const newAdmin: AdminDocument = new adminModel({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        });

        await newAdmin.save();

        res.status(201).json({
            message: "Admin created successfully !"
        })
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
            "message": "Error creating a admin",
            "error": error instanceof Error ? error.message : "Unknown error",
        });
    }
}

async function list(req: Request, res: Response) {
    try {
        if (!req.user || req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }

        const userId: string = req.user.id;
        const courses: Course[] = await courseModel.find({ 'creatorId': userId });

        if (!courses || courses.length === 0) {
            res.status(404).json({
                message: "No course found !",
                data: []
            });
        }
        res.json({
            message: "Course retrieved successfully !",
            data: courses
        });
    }
    catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            error: errMessage,
            message: "Error while fetching courses !"
        })
    }
}

// module.exports = {
//     signUp: signUp,
//     list: list
// };

export default { list, signUp };