const { Router } = require("express");
const adminRouter = Router();
const {signIn, signUp, addCourse} = require("../app/controllers/adminController")

adminRouter.post("/signup", signUp)

adminRouter.post("/signin", signIn)

adminRouter.post("/course", addCourse)

adminRouter.put("/course", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

adminRouter.get("/course/bulk", function (req, res) {
    res.json({
        message: "signup endpoint"
    })
})

module.exports = {
    adminRouter: adminRouter
}