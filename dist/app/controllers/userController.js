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
exports.test = exports.purchases = exports.signIn = exports.signUp = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const user_1 = require("../../database/models/user");
const purchase_1 = require("../../database/models/purchase");
const category_1 = require("../../database/models/category");
const signUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(), // Must be a valid email
    password: zod_1.z.string().min(6), // Minimum password length of 6 characters
    firstName: zod_1.z.string().min(1), // First name must not be empty
    lastName: zod_1.z.string().min(1) // Last name must not be empty
});
const signInSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
function signUp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate the incoming data using Zod
            const userData = signUpSchema.parse(req.body);
            const { email, password, firstName, lastName } = userData;
            // Hash the password using bcrypt with a salt round of 10
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
            yield user_1.userModel.create({
                email: userData.email,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName
            });
            res.status(201).json({
                message: "User created successfully !"
            });
            return;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    message: 'Validation error',
                    errors: error.errors
                });
                return;
            }
            if (error instanceof Error && error.code === 11000) {
                res.status(400).json({ message: 'Email already exists' });
                return;
            }
            res.status(500).json({
                "message": "Error creating a user",
                error: error instanceof Error ? error.message : "Unknown Error"
            });
            return;
        }
    });
}
exports.signUp = signUp;
function signIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const signData = signInSchema.parse(req.body);
            const user = yield user_1.userModel.findOne({ email: signData.email });
            if (!user) {
                res.status(400).json({
                    message: "User with no such email exists !"
                });
                return;
            }
            const isMatch = yield bcrypt_1.default.compare(signData.password.trim(), user.password);
            if (!isMatch) {
                res.status(400).json({
                    "message": "Invalid email or password"
                });
                return;
            }
            if (!config_1.JWT_USER_PASSWORD) {
                res.status(400).json({
                    "message": "No encryption key is provided"
                });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                id: user._id,
                role: "user"
            }, config_1.JWT_USER_PASSWORD);
            res.json({
                message: 'Login successful',
                token: token
            });
            return;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    message: 'Validation Error',
                    errors: error.errors
                });
                return;
            }
            res.status(500).json({
                message: "Error during login",
                error: error instanceof Error ? error.message : "Unknown Error"
            });
            return;
        }
    });
}
exports.signIn = signIn;
function purchases(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                message: "Unauthorized: User ID is missing"
            });
            return;
        }
        const userId = req.user.id;
        try {
            const purchases = yield purchase_1.purchaseModel.find({ userId });
            if (!purchases || purchases.length === 0) {
                res.status(404).json({
                    message: "No purchases found",
                });
                return;
            }
            res.status(200).json(purchases);
            return;
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching purchases', error: error instanceof Error ? error.message : "Unknown Error" });
            return;
        }
    });
}
exports.purchases = purchases;
function test(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const categories = yield category_1.categoryModel.find();
            res.json({
                message: "Categories retrieved successfully !",
                data: categories
            });
            return;
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Error while fetching categories !"
            });
            return;
        }
    });
}
exports.test = test;
