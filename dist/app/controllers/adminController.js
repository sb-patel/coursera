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
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { ObjectId } = require('mongoose').Types;
const { JWT_ADMIN_PASSWORD } = require("../../config");
const admin_1 = require("../../database/models/admin");
const { courseModel } = require("../../database/models/course");
const mongoose_1 = require("mongoose");
const signUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1) // Last name must not be empty
});
const signInSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
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
            const hashedPassword = yield bcrypt.hash(userData.password, 10);
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
            const isMatch = yield bcrypt.compare(signData.password.trim(), admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    "message": "Invalid email or password"
                });
            }
            const token = jwt.sign({
                id: admin._id,
                role: "admin"
            }, JWT_ADMIN_PASSWORD, { expiresIn: '1h' });
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
function addCourse(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "Unauthorized: User ID is missing" });
                return;
            }
            const creatorId = req.user.id;
            const courseData = courseSchema.parse(req.body);
            const newCourse = yield courseModel.create(Object.assign(Object.assign({}, courseData), { creatorId: creatorId }));
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
            const course = yield courseModel.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            // Compare userId from JWT with creatorId of the course
            if (!course.creatorId || course.creatorId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized to update this course' });
            }
            const updatedCourse = yield courseModel.findByIdAndUpdate(courseId, {
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
function list(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.id) {
                res.status(401).json({ message: "Unauthorized: User ID is missing" });
                return;
            }
            const userId = req.user.id;
            const courses = yield courseModel.find({ 'creatorId': userId });
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
// module.exports = {
//     signUp: signUp,
//     list: list
// };
exports.default = { list, signUp, signIn };
