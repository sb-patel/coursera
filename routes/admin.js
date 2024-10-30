const { Router } = require("express");
const adminRouter = Router();
const {adminMiddleware} = require("../app/middleware/adminMiddleware")
const adminController = require("../app/controllers/adminController")

adminRouter.post("/signup", adminController.signUp);

adminRouter.post("/signin", adminController.signIn);

adminRouter.post("/course", adminMiddleware, adminController.addCourse);

adminRouter.put("/course/:courseId", adminMiddleware, adminController.updateCourse);

adminRouter.get("/list", adminMiddleware, adminController.list);

module.exports = {
    adminRouter: adminRouter
};