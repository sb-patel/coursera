const { Router } = require("express");
const userRouter = Router();
const userController = require("../app/controllers/userController");


userRouter.post("/signup", userController.signUp);

userRouter.post("/signin", userController.signIn);

userRouter.get("/purchases", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
});

module.exports = {
    userRouter: userRouter
};