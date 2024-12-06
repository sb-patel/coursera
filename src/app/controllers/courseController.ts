import { Types } from "mongoose";
import { Request, Response } from "express";
import { courseModel, courseDocument } from "../../database/models/course";
import { purchaseModel } from "../../database/models/purchase";

export async function purchase(req: Request, res: Response) {
    try {
        const { courseId } = req.params;

        if (!Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        const course: courseDocument | null = await courseModel.findOne({ '_id':courseId});

        if (!course) {
            return res.status(404).json({
                message: "No course found",
            });
        };

        if(!req.user || !req.user.id){
            return res.status(404).json({
                message: "No user id provided"
            });
        }
        const userId = req.user.id;

        await purchaseModel.create({
            userId,
            courseId
        });

        res.status(201).json({
            message: "Course Purchased successfully !"
        });
    }
    catch (error:unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error during purchasing a course !"
        });
    }
}

export async function preview(req: Request, res: Response) {
    try {
        const { courseId } = req.params;

        if (!Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid Course ID' });
        }

        const course: courseDocument | null = await courseModel.findById(courseId);
        // const course = await courseModel.findOne({ '_id':courseId});

        if (!course) {
            return res.status(404).json({
                message: "No course found",
            });
        };

        res.status(200).json({
            message: "Course retrieved successfully !",
            data : course
        });
    }
    catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching a course !"
        });
    }
}

export async function list(req: Request, res: Response) {
    try{
        const courses: courseDocument[] = await courseModel.find();
        res.json({
            message: "Course retrieved successfully !",
            data : courses
        });
    }
    catch(error: unknown){
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching courses !"
        })
    }
}