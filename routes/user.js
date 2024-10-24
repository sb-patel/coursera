const { Router } = require("express");
const userRouter = Router();
const { userMiddleware } = require("../app/middleware/userMiddleware");
const userController = require("../app/controllers/userController");


userRouter.post("/signup", userController.signUp);

userRouter.post("/signin", userController.signIn);

userRouter.get("/purchases", userMiddleware, userController.purchases);

module.exports = {
    userRouter: userRouter
};