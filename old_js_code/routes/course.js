const { Router } = require("express");
const courseRouter = Router();
const { purchase, preview, list } = require("../app/controllers/courseController");
const { authMiddleware } = require("../app/middleware/authMiddleware");

courseRouter.post("/purchase/:courseId", authMiddleware, purchase);

courseRouter.get("/preview/:courseId", authMiddleware, preview);

courseRouter.get("/list", authMiddleware, list);

module.exports = {
    courseRouter: courseRouter
}