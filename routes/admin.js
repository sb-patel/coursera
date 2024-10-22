const { Router } = require("express");
const adminRouter = Router();
const {signIn, signUp} = require("../app/controllers/adminController")

adminRouter.post("/signup", signUp)

adminRouter.post("/signin", signIn)

adminRouter.post("/course", function (req, res) {
    try{

    }
    catch(error){
        if(error instanceof z.ZodError){
            return res.status(400).json({
                error : error.errors,
                message : "Validation Error"
            });
        }

        res.status(500).json({
            error : error.message,
            message : "Error during saving a course !"
        })
    }

    res.json({
        message: "signup endpoint"
    })
})

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