const { Router } = require("express");
const courseRouter = Router();
const { purchase, preview } = require("../app/controllers/courseController");
const { authMiddleware } = require("../app/middleware/authMiddleware");

courseRouter.post("/purchase/:courseId", authMiddleware, purchase);

courseRouter.get("/preview", authMiddleware, preview);

module.exports = {
    courseRouter: courseRouter
}