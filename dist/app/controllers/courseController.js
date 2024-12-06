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
const mongoose_1 = require("mongoose");
const purchase_1 = require("../../database/models/purchase");
const course_1 = require("../../database/models/course");
function purchase(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { courseId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
                return res.status(400).json({ message: 'Invalid Course ID' });
            }
            const course = yield course_1.courseModel.findOne({ '_id': courseId });
            if (!course) {
                return res.status(404).json({
                    message: "No course found",
                });
            }
            ;
            if (!req.user || !req.user.id) {
                return res.status(404).json({
                    message: "No user id provided"
                });
            }
            const userId = req.user.id;
            yield purchase_1.purchaseModel.create({
                userId,
                courseId
            });
            res.status(201).json({
                message: "Course Purchased successfully !"
            });
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Error during purchasing a course !"
            });
        }
    });
}
function preview(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { courseId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
                return res.status(400).json({ message: 'Invalid Course ID' });
            }
            const course = yield course_1.courseModel.findById(courseId);
            // const course = await courseModel.findOne({ '_id':courseId});
            if (!course) {
                return res.status(404).json({
                    message: "No course found",
                });
            }
            ;
            res.status(200).json({
                message: "Course retrieved successfully !",
                data: course
            });
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Error while fetching a course !"
            });
        }
    });
}
function list(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const courses = yield course_1.courseModel.find();
            res.json({
                message: "Course retrieved successfully !",
                data: courses
            });
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Error while fetching courses !"
            });
        }
    });
}
module.exports = {
    purchase: purchase,
    preview: preview,
    list: list
};
