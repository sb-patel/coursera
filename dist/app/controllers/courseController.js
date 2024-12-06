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
exports.list = exports.preview = exports.purchase = void 0;
const mongoose_1 = require("mongoose");
const course_1 = require("../../database/models/course");
const purchase_1 = require("../../database/models/purchase");
function purchase(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { courseId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
                res.status(400).json({ message: 'Invalid Course ID' });
                return;
            }
            const course = yield course_1.courseModel.findOne({ '_id': courseId });
            if (!course) {
                res.status(404).json({
                    message: "No course found",
                });
                return;
            }
            ;
            if (!req.user || !req.user.id) {
                res.status(404).json({
                    message: "No user id provided"
                });
                return;
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
exports.purchase = purchase;
function preview(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { courseId } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(courseId)) {
                res.status(400).json({ message: 'Invalid Course ID' });
                return;
            }
            const course = yield course_1.courseModel.findById(courseId);
            // const course = await courseModel.findOne({ '_id':courseId});
            if (!course) {
                res.status(404).json({
                    message: "No course found",
                });
                return;
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
            return;
        }
    });
}
exports.preview = preview;
function list(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const courses = yield course_1.courseModel.find();
            res.json({
                message: "Course retrieved successfully !",
                data: courses
            });
            return;
        }
        catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Error while fetching courses !"
            });
            return;
        }
    });
}
exports.list = list;
