const { Router } = require("express");
const userRouter = Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const { userModel, purchaseModel, courseModel } = require("../database/db")
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

const userSchema = z.object({
    email: z.string().email(),              // Must be a valid email
    password: z.string().min(6),            // Minimum password length of 6 characters
    firstName: z.string().min(1),           // First name must not be empty
    lastName: z.string().min(1)             // Last name must not be empty
});

userRouter.post("/signup", async function (req, res) {
    try {
        // Validate the incoming data using Zod
        const userData = userSchema.parse(req.body);
    
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
        console.log(error);

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
    const { email, password } = req.body;

    // TODO: ideally password should be hashed, and hence you cant compare the user provided password and the database password
    const user = await userModel.findOne({
        email: email,
        password: password
    }); //[]

    if (!user) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    const token = jwt.sign({
        id: user._id,
    }, JWT_USER_PASSWORD);

    // Do cookie logic

    res.json({
        token: token
    })
})

userRouter.get("/purchases", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

module.exports = {
    userRouter: userRouter
}