const { Router } = require("express");
const adminRouter = Router();
const z = require("zod");
const { signUpSchema, signInSchema } = require("../schema/userSchema");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminModel } = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

adminRouter.post("/signup", async function (req, res) {
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
            "message": "Error creating a Admin !",
            "error": error.message
        });
    }
})

adminRouter.post("/signin", async function (req, res) {
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
})

adminRouter.post("/course", function (req, res) {
    try{

    }
    catch(error){
        if(error instanceof z.ZodError){
            return res.status(400).json({
                error : error.errors,
                message : "Validation Error"
            });
        }

        res.status(500).json({
            error : error.message,
            message : "Error during saving a course !"
        })
    }

    res.json({
        message: "signup endpoint"
    })
})

adminRouter.put("/course", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

adminRouter.get("/course/bulk", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

module.exports = {
    adminRouter: adminRouter
}