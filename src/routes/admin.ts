import { Router } from "express";
import { adminMiddleware } from "../app/middleware/adminMiddleware";
import * as adminController from "../app/controllers/adminController";
import upload from "../app/middleware/uploadMiddleware";
const adminRouter = Router();


// Admin Routes
adminRouter.post("/signup", adminController.signUp);

adminRouter.post("/signin", adminController.signIn);

adminRouter.post("/logout", adminController.logout);

adminRouter.post("/course", adminMiddleware, adminController.addCourse);

adminRouter.put("/course/:courseId", adminMiddleware, adminController.updateCourse);

adminRouter.delete("/course/:courseId", adminMiddleware, adminController.deleteCourse);

adminRouter.get("/list", adminMiddleware, adminController.list);

adminRouter.post("/user-details", upload.single("profilePic"), adminController.addUserDetails);

export { adminRouter };