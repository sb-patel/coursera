const { Router } = require("express");
const userRouter = Router();
const {signUp, signIn} = require("../app/controllers/userController")


userRouter.post("/signup", signUp)

userRouter.post("/signin", signIn)

userRouter.get("/purchases", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

module.exports = {
    userRouter: userRouter
}