const z = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongoose').Types;
const { JWT_ADMIN_PASSWORD } = require("../../config");
const { adminModel } = require("../../database/models/admin");
const { courseModel } = require("../../database/models/course");
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

        const token = jwt.sign(
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
        const courseData = courseSchema.parse(req.body);

        await courseModel.create({
            title: courseData.title,
            description: courseData.description,
            price: courseData.price,
            imageUrl: courseData.imageUrl,
            creatorId: courseData.creatorId
        });

        res.status(201).json({
            message: "Course created successfully !"
        });
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
        });
    }
}

async function updateCourse(req, res) {
    const { courseId } = req.params;

    if (!ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid Course ID' });
    }

    const courseUpdateSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.number().min(1),
        imageUrl: z.string().min(1)
    });

    try {
        const courseData = courseUpdateSchema.parse(req.body);

        const course = await courseModel.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Compare userId from JWT with creatorId of the course
        if (course.creatorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to update this course' });
        }

        const updatedCourse = await courseModel.findByIdAndUpdate(
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
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
        }

        res.status(500).json({
            error: error.message,
            message: "Error during updating a course !"
        })
    }
}

async function list(req, res) {
    try{
        const userId = req.user.id;
        const courses = await courseModel.find({'creatorId' : userId});

        if(!courses || courses.length === 0){
            res.status(404).json({
                message: "No course found !",
                data : courses
            });
        }
        res.json({
            message: "Course retrieved successfully !",
            data : courses
        });
    }
    catch(error){
        res.status(500).json({
            error:error.message,
            message: "Error while fetching courses !"
        })
    }
}

module.exports = {
    signUp: signUp,
    signIn: signIn,
    addCourse: addCourse,
    updateCourse: updateCourse,
    list: list
};