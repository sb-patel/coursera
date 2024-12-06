const { Router } = require("express");
const userRouter = Router();
const { authMiddleware } = require("../app/middleware/authMiddleware");
const userController = require("../app/controllers/userController");


userRouter.post("/signup", userController.signUp);

userRouter.post("/signin", userController.signIn);

userRouter.get("/purchases", authMiddleware, userController.purchases);

module.exports = {
    userRouter: userRouter
};