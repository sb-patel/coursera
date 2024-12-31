import { Router } from "express";
import { authMiddleware } from "../app/middleware/authMiddleware";
import * as courseController from "../app/controllers/courseController"
const courseRouter = Router();

courseRouter.post("/purchase/:courseId", authMiddleware, courseController.purchase);

courseRouter.get("/preview/:courseId", authMiddleware, courseController.preview);

courseRouter.get("/list", courseController.list);

export { courseRouter };