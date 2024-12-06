import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { JWT_ADMIN_PASSWORD } from "../../config";
import { Request, Response } from "express"
import { adminModel, AdminDocument } from "../../database/models/admin";
import { courseModel, courseDocument } from "../../database/models/course";

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

const signUpSchema = z.object({
    email: z.string().email(),              // Must be a valid email
    password: z.string().min(6),            // Minimum password length of 6 characters
    firstName: z.string().min(1, "First name is required"),           // First name must not be empty
    lastName: z.string().min(1)             // Last name must not be empty
});

const signInSchema = z.object({
    email: z.string().email(),              // Must be a valid email
    password: z.string().min(6)            // Minimum password length of 6 characters
});

const courseSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(1),
    imageUrl: z.string().min(1)
});

// Define the TypeScript type for the request body based on the Zod schema
type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

export async function signUp(req: Request, res: Response) {
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

export async function signIn(req: Request, res: Response) {
    try {
        const signData: SignInData = signInSchema.parse(req.body);

        const admin: AdminDocument | null = await adminModel.findOne({ email: signData.email });
        if (!admin) {
            return res.status(400).json({
                message: "Admin with no such email exists !"
            })
        }

        const isMatch: boolean = await bcrypt.compare(signData.password.trim(), admin.password);
        if (!isMatch) {
            return res.status(401).json({
                "message": "Invalid email or password"
            });
        }

        if(!JWT_ADMIN_PASSWORD){
            return res.status(401).json({
                "message": "Admin secret not provided"
            });
        }

        const token: string = jwt.sign(
            {
                id: admin._id,
                role: "admin"
            },
            JWT_ADMIN_PASSWORD,
            { expiresIn: '1h' }
        );

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

export async function addCourse(req: Request, res: Response) {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }

        const creatorId: string = req.user.id;

        const courseData = courseSchema.parse(req.body);

        const newCourse: courseDocument = await courseModel.create({
            ...courseData,
            creatorId: creatorId
        });

        res.status(201).json({
            message: "Course created successfully !",
            course: newCourse
        });
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during saving a course !"
        });
    }
}

export async function updateCourse(req: Request, res: Response) {
    const { courseId } = req.params;

    if (!Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid Course ID' });
    }

    const courseUpdateSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.string()
            .transform((val) => Number(val)) // Convert string to number
            .refine((val) => !isNaN(val) && val >= 1, { message: "Price must be a number and at least 1" }),
        imageUrl: z.string().min(1)
    });

    try {
        if(!req.user || !req.user.id){
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return; 
        }
        const courseData = courseUpdateSchema.parse(req.body);

        const course: courseDocument | null = await courseModel.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Compare userId from JWT with creatorId of the course
        if (!course.creatorId || course.creatorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this course' });
        }

        const updatedCourse: courseDocument | null = await courseModel.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    title: courseData.title,
                    description: courseData.description,
                    price: courseData.price,
                    imageUrl: courseData.imageUrl
                }
            },
            { new: true }  // Return the updated document
        )

        res.status(200).json({
            message: "Course updated successfully !",
            course: updatedCourse
        })
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during updating a course !"
        })
    }
}

export async function list(req: Request, res: Response) {
    try {
        if (!req.user || req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }

        const userId: string = req.user.id;
        const courses: courseDocument[] = await courseModel.find({ 'creatorId': userId });

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

// export default { list, signUp, signIn };