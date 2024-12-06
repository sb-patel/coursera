import { Router } from "express";
import { adminMiddleware } from "../app/middleware/adminMiddleware";
import * as adminController from "../app/controllers/adminController";

const adminRouter = Router();

// Admin Routes
adminRouter.post("/signup", adminController.signUp);

adminRouter.post("/signin", adminController.signIn);

adminRouter.post("/course", adminMiddleware, adminController.addCourse);

adminRouter.put("/course/:courseId", adminMiddleware, adminController.updateCourse);

adminRouter.delete("/course/:courseId", adminMiddleware, adminController.deleteCourse);

adminRouter.get("/list", adminMiddleware, adminController.list);

export { adminRouter };
