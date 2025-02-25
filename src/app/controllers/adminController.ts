import fs from "fs";
import path from "path";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Request, Response } from "express"
import { JWT_ADMIN_PASSWORD } from "../../config";
import upload from "../middleware/uploadMiddleware";
import formidable, { Fields, Files } from 'formidable';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminModel, AdminDocument } from "../../database/models/admin";
import { blacklistedToken } from "../../database/models/blackListedToken";
import { courseModel, courseDocument } from "../../database/models/course";
import { userDetailModel, UserDetailsDocument } from "../../database/models/userDetail";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
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
    subCategoryId: z.string().min(1),
    imageUrl: z.string().min(1)
});

// Define the TypeScript type for the request body based on the Zod schema
type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Set up Multer storage
const COURSE_UPLOAD_DIR = path.join(__dirname, "../uploads/courses");

if (!fs.existsSync(COURSE_UPLOAD_DIR)) {
    fs.mkdirSync(COURSE_UPLOAD_DIR, { recursive: true });
}

export async function signUp(req: Request, res: Response): Promise<void> {
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
            res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
            return;
        }

        if (error instanceof Error && (error as any).code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        res.status(500).json({
            "message": "Error creating a admin",
            "error": error instanceof Error ? error.message : "Unknown error",
        });
    }
}

export async function signIn(req: Request, res: Response): Promise<void> {
    try {
        const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Explain how AI works";

        const result = await model.generateContent(prompt);
        console.log(result.response.text());

        const signData: SignInData = signInSchema.parse(req.body);

        const admin: AdminDocument | null = await adminModel.findOne({ email: signData.email });
        if (!admin) {
            res.status(400).json({
                message: "Admin with no such email exists !"
            })
            return;
        }

        const isMatch: boolean = await bcrypt.compare(signData.password.trim(), admin.password);
        if (!isMatch) {
            res.status(401).json({
                "message": "Invalid email or password"
            });
            return;
        }

        if (!JWT_ADMIN_PASSWORD) {
            res.status(401).json({
                "message": "Admin secret not provided"
            });
            return;
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
            res.status(400).json({
                message: 'Validation Error',
                errors: error.errors
            });
            return;
        }

        res.status(500).json({
            message: "Error during login",
            error: error instanceof Error ? error.message : "Unknown Error"
        })
    }
}

export async function addCourse(req: Request, res: Response): Promise<void> {
    console.log(COURSE_UPLOAD_DIR);
    upload.single("coursePic");

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
            res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
            return;
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during saving a course !"
        });
    }
}

export async function updateCourse(req: Request, res: Response): Promise<void> {
    const { courseId } = req.params;

    if (!Types.ObjectId.isValid(courseId)) {
        res.status(400).json({ message: 'Invalid Course ID' });
        return;
    }

    const courseUpdateSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.string()
            .transform((val) => Number(val)) // Convert string to number
            .refine((val) => !isNaN(val) && val >= 1, { message: "Price must be a number and at least 1" }),
        subCategoryId: z.string().min(1),
        imageUrl: z.string().min(1)
    });

    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }
        const courseData = courseUpdateSchema.parse(req.body);

        const course: courseDocument | null = await courseModel.findById(courseId);

        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        // Compare userId from JWT with creatorId of the course
        if (!course.creatorId || course.creatorId.toString() !== req.user.id) {
            res.status(403).json({ message: 'Unauthorized to update this course' });
            return;
        }

        const updatedCourse: courseDocument | null = await courseModel.findByIdAndUpdate(
            courseId,
            {
                $set: {
                    title: courseData.title,
                    description: courseData.description,
                    price: courseData.price,
                    subCategoryId: courseData.subCategoryId,
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
            res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
            return;
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during updating a course !"
        })
    }
}

export async function deleteCourse(req: Request, res: Response): Promise<void> {
    const { courseId } = req.params;

    if (!Types.ObjectId.isValid(courseId)) {
        res.status(400).json({ message: 'Invalid Course ID' });
        return;
    }

    try {
        const course: courseDocument | null = await courseModel.findById(courseId);

        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        if (!req.user || !req.user.id) {
            res.status(403).json({ message: 'User is not Authrorized' });
            return;
        }
        // Compare userId from JWT with creatorId of the course
        if (course.creatorId.toString() !== req.user.id) {
            res.status(403).json({ message: 'Unauthorized to update this course' });
            return;
        }

        await courseModel.findByIdAndDelete(courseId);

        res.status(200).json({
            message: "Course removed successfully !"
        })
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during removing a course !"
        })
    }
}

export async function list(req: Request, res: Response): Promise<void> {
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
            return;
        }
        res.json({
            message: "Course retrieved successfully !",
            data: courses
        });
        return;
    }
    catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            error: errMessage,
            message: "Error while fetching courses !"
        })
        return;
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            res.status(400).json({ message: "Token not provided" });
            return;
        }

        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            res.status(400).json({ message: "Invalid token" });
            return;
        }

        const expiresAt = new Date(decoded.exp * 1000);

        await blacklistedToken.create({ token, expiresAt });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error during logout", error });
    }
}

export async function addUserDetails(req: Request, res: Response): Promise<void> {
    const form = formidable({
        multiples: false, // Allow single file upload (set true for multiple)
        uploadDir: UPLOAD_DIR, // Directory for saving files
        keepExtensions: true, // Keep file extensions
        maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    // Parse the incoming form data
    form.parse(req, async (err: any, fields: Fields, files: Files) => {
        if (err) {
            return res.status(500).json({ message: `Error parsing form data - ${err}` });
        }

        // Extract fields from the parsed form
        const { userId, address, gender, phoneNumber, dateOfBirth } = fields;

        // 1. Validate required fields
        if (!userId || !address || !gender || !phoneNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const uploadedFile = files.profilePic ? files.profilePic[0] : null; // Assuming 'profilePic' is the key
        if (!uploadedFile) {
            return res.status(400).json({ message: 'Profile picture is required' });
        }

        // 2. Check if user details already exist
        const existingDetails: UserDetailsDocument | null = await userDetailModel.findOne({ userId });
        if (existingDetails) {
            return res.status(400).json({ message: 'User details already exist' });
        }

        // Move the file to the desired location
        const originalFilename = uploadedFile.originalFilename || uploadedFile.newFilename || 'unknown_file';

        const newFilePath = path.join(__dirname, 'uploads', originalFilename);
        fs.rename(uploadedFile.filepath, newFilePath, async (renameErr) => {
            if (renameErr) {
                console.error('Error moving file:', renameErr);
                return res.status(500).json({ message: 'Error saving file' });
            }

            // Create user details object from fields
            const userDetails = {
                userId: fields.userId ? fields.userId[0] : '', // Make sure userId is sent in the form-data
                profilePic: originalFilename, // Save the file name or path
                address: fields.address ? fields.address[0] : '',
                gender: fields.gender ? fields.gender[0] : '',
                phoneNumber: fields.phoneNumber ? fields.phoneNumber[0] : '',
                // dateOfBirth: fields.dateOfBirth ? fields.dateOfBirth[0] : '',
                dateOfBirth: fields.dateOfBirth ? new Date(fields.dateOfBirth[0]) : undefined,
            };

            try {
                // Save user details to the database
                const newUserDetails = new userDetailModel(userDetails);
                await newUserDetails.save();

                // Send response with success message
                res.json({
                    message: 'File uploaded and user details added successfully!',
                    fileName: uploadedFile.originalFilename,
                    filePath: newFilePath,
                    userDetails: newUserDetails,
                });
            } catch (dbErr) {
                console.error('Error saving to database:', dbErr);
                res.status(500).json({ message: 'Error saving user details to database' });
            }
        });
    });

    // Optional: Handle file upload events (for debugging or custom processing)
    form.on('file', (name: string, file: formidable.File) => {
        console.log(`Uploaded file [${name}]:`, file.originalFilename);
    });
}

// module.exports = {
//     signUp: signUp,
//     list: list
// };

// export default { list, signUp, signIn };