"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.updateCourse = exports.addCourse = exports.signIn = exports.signUp = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const config_1 = require("../../config");
const admin_1 = require("../../database/models/admin");
const course_1 = require("../../database/models/course");
const signUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(), // Must be a valid email
    password: zod_1.z.string().min(6), // Minimum password length of 6 characters
    firstName: zod_1.z.string().min(1, "First name is required"), // First name must not be empty
    lastName: zod_1.z.string().min(1) // Last name must not be empty
});
const signInSchema = zod_1.z.object({
    email: zod_1.z.string().email(), // Must be a valid email
    password: zod_1.z.string().min(6) // Minimum password length of 6 characters
});
const courseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    price: zod_1.z.number().min(1),
    imageUrl: zod_1.z.string().min(1)
});
function signUp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate the incoming data using Zod
            const userData = signUpSchema.parse(req.body);
            const { email, password, firstName, lastName } = userData;
            // Hash the password using bcrypt with a salt round of 10
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
            // await adminModel.create({
            //     email: email,
            //     password: hashedPassword,
            //     firstName: firstName,
            //     lastName: lastName
            // })
            const newAdmin = new admin_1.adminModel({
                email: email,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName
            });
            yield newAdmin.save();
            res.status(201).json({
                message: "Admin created successfully !"
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: 'Validation error',
                    errors: error.errors
                });
            }
            if (error instanceof Error && error.code === 11000) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            res.status(500).json({
                "message": "Error creating a admin",
                "error": error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
exports.signUp = signUp;
function signIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const signData = signInSchema.parse(req.body);
            const admin = yield admin_1.adminModel.findOne({ email: signData.email });
            if (!admin) {
                return res.status(400).json({
                    message: "Admin with no such email exists !"
                });
            }
            const isMatch = yield bcrypt_1.default.compare(signData.password.trim(), admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    "message": "Invalid email or password"
                });
            }
            if (!config_1.JWT_ADMIN_PASSWORD) {
                return res.status(401).json({
                    "message": "Admin secret not provided"
                });
            }
            const token = jsonwebtoken_1.default.sign({
                id: admin._id,
                role: "admin"
            }, config_1.JWT_ADMIN_PASSWORD, { expiresIn: '1h' });
            res.json({
                message: 'Login successful',
                token: token
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    message: 'Validation Error',
                    errors: error.errors
                });
            }
            res.status(500).json({
                message: "Error during login",
                error: error instanceof Error ? error.message : "Unknown Error"
            });
        }
    });
}
exports.signIn = signIn;
function addCourse(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "Unauthorized: User ID is missing" });
                return;
            }
            const creatorId = req.user.id;
            const courseData = courseSchema.parse(req.body);
            const newCourse = yield course_1.courseModel.create(Object.assign(Object.assign({}, courseData), { creatorId: creatorId }));
            res.status(201).json({
                message: "Course created successfully !",
                course: newCourse
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    });
}
exports.addCourse = addCourse;
function updateCourse(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { courseId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }
        const courseUpdateSchema = zod_1.z.object({
            title: zod_1.z.string().min(1),
            description: zod_1.z.string().min(1),
            price: zod_1.z.string()
                .transform((val) => Number(val)) // Convert string to number
                .refine((val) => !isNaN(val) && val >= 1, { message: "Price must be a number and at least 1" }),
            imageUrl: zod_1.z.string().min(1)
        });
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "Unauthorized: User ID is missing" });
                return;
            }
            const courseData = courseUpdateSchema.parse(req.body);
            const course = yield course_1.courseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Compare userId from JWT with creatorId of the course
            if (!course.creatorId || course.creatorId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized to update this course' });
            }
            const updatedCourse = yield course_1.courseModel.findByIdAndUpdate(courseId, {
                $set: {
                    title: courseData.title,
                    description: courseData.description,
                    price: courseData.price,
                    imageUrl: courseData.imageUrl
                }
            }, { new: true } // Return the updated document
            );
            res.status(200).json({
                message: "Course updated successfully !",
                course: updatedCourse
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: error.errors,
                    message: "Validation Error"
                });
            }
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown Error",
                message: "Error during updating a course !"
            });
        }
    });
}
exports.updateCourse = updateCourse;
function list(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.id) {
                res.status(401).json({ message: "Unauthorized: User ID is missing" });
                return;
            }
            const userId = req.user.id;
            const courses = yield course_1.courseModel.find({ 'creatorId': userId });
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
        catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            res.status(500).json({
                error: errMessage,
                message: "Error while fetching courses !"
            });
        }
    });
}
exports.list = list;
// module.exports = {
//     signUp: signUp,
//     list: list
// };
// export default { list, signUp, signIn };
