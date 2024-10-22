const { Router } = require("express");
const userRouter = Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const { userModel} = require("../models/userModule")
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

const {signUpSchema, signInSchema} = require("../schema/userSchema");

userRouter.post("/signup", async function (req, res) {
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
            "message": "Error creating a user",
            "error": error.message
        });
    }
})

userRouter.post("/signin", async function (req, res) {
    try {
        const signData = signInSchema.parse(req.body);

        const user = await userModel.findOne({ email : signData.email });
        if (!user) {
            return res.status(400).json({
                message: "User with no such email exists !"
            })
        }

        const isMatch = await bcrypt.compare(signData.password.trim(), user.password);
        if(!isMatch){
            return res.status(400).json({
                "message" : "Invalid email or password"
            });
        }

        const token = jwt.sign({
            id: user._id,
        }, JWT_USER_PASSWORD);

        res.json({
            message: 'Login successful',
            token: token
        })
    }
    catch (error) {
        if(error instanceof z.ZodError){
            return res.status(400).json({
                message : 'Validation Error',
                errors : error.errors
            });
        }

        res.status(500).json({
            message : "Error during login",
            error : error.message
        })
    }
})

userRouter.get("/purchases", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

module.exports = {
    userRouter: userRouter
}