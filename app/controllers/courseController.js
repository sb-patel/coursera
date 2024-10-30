const z = require("zod");
const { ObjectId } = require("mongoose").Types;
const { purchaseModel } = require("../../database/models/purchase");
const { courseModel } = require("../../database/models/course");

async function purchase(req, res) {
    try {
        const { courseId } = req.params;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        const course = await courseModel.find({ courseId });

        if (!course || course.length === 0) {
            return res.status(404).json({
                message: "No course found",
            });
        };

        const userId = req.user.id;

        await purchaseModel.create({
            userId,
            courseId
        });

        res.status(201).json({
            message: "Course Purchased successfully !"
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message,
            message: "Error during purchasing a course !"
        });
    }
}

async function preview(req, res) {
    try {
        const { courseId } = req.params;

        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        const course = await courseModel.findById(courseId);
        // const course = await courseModel.findOne({ '_id':courseId});

        if (!course || course.length === 0) {
            return res.status(404).json({
                message: "No course found",
            });
        };

        res.status(200).json({
            message: "Course retrieved successfully !",
            data : course
        });
    }
    catch (error) {
        res.status(500).json({
            error: error.message,
            message: "Error while fetching a course !"
        });
    }
}

async function list(req, res) {
    try{
        const courses = await courseModel.find();
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
    purchase: purchase,
    preview: preview,
    list: list
};