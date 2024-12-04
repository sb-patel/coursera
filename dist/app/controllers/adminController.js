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
const { ObjectId } = require('mongoose').Types;
const { JWT_ADMIN_PASSWORD } = require("../../config");
const admin_1 = require("../../database/models/admin");
const { courseModel } = require("../../database/models/course");
const { courseSchema } = require("../../database/schema/courseSchema");
const signUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(), // Must be a valid email
    password: zod_1.z.string().min(6), // Minimum password length of 6 characters
    firstName: zod_1.z.string().min(1, "First name is required"), // First name must not be empty
    lastName: zod_1.z.string().min(1) // Last name must not be empty
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
exports.default = { list, signUp };
