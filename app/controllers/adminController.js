const z = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../../config");
const { adminModel } = require("../../database/models/adminModle");
const { courseModel } = require("../../database/models/courseModle");
const { courseSchema } = require("../../database/schema/courseSchema");
const { signUpSchema, signInSchema } = require("../../database/schema/userSchema");


async function signUp(req, res) {
    try {
        // Validate the incoming data using Zod
        const userData = signUpSchema.parse(req.body);

        const { email, password, firstName, lastName } = req.body;

        // Hash the password using bcrypt with a salt round of 10
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await adminModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        })

        res.status(201).json({
            message: "Admin created successfully !"
        })
    }
    catch (error) {
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
            "message": "Error creating a admin",
            "error": error.message
        });
    }
}

async function signIn(req, res) {
    try {
        const signData = signInSchema.parse(req.body);

        const admin = await adminModel.findOne({ email: signData.email });
        if (!admin) {
            return res.status(400).json({
                message: "Admin with no such email exists !"
            })
        }

        const isMatch = await bcrypt.compare(signData.password.trim(), admin.password);
        if (!isMatch) {
            return res.status(400).json({
                "message": "Invalid email or password"
            });
        }

        const token = jwt.sign({
            id: admin._id,
        }, JWT_ADMIN_PASSWORD);

        res.json({
            message: 'Login successful',
            token: token
        })
    }
    catch (error) {
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

async function addCourse(req, res) {
    try {
        // Validate the incoming data using Zod
        const courseData = courseSchema.parse(req.body);
console.log('here');
        await courseModel.create({
            title : courseData.title,
            description : courseData.description,
            price : courseData.price,
            imageUrl : courseData.imageUrl,
            creatorId : courseData.creatorId
        })

        res.status(201).json({
            message: "Course created successfully !"
        })
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
        }

        res.status(500).json({
            error: error.message,
            message: "Error during saving a course !"
        })
    }
}

module.exports = {
    signUp: signUp,
    signIn: signIn,
    addCourse: addCourse
};