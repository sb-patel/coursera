const { Router } = require("express");
const adminRouter = Router();
const { adminMiddleware } = require("../app/middleware/adminMiddleware")
const adminController = require("../app/controllers/adminController")

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

adminRouter.post("/signup", adminController.signUp);

adminRouter.post("/signin", adminController.signIn);

adminRouter.post("/course", adminMiddleware, adminController.addCourse);

adminRouter.put("/course/:courseId", adminMiddleware, adminController.updateCourse);

adminRouter.delete("/course/:courseId", adminMiddleware, adminController.deleteCourse);

adminRouter.get("/list", adminMiddleware, adminController.list);

adminRouter.post("/test/new/user", async function(req, res) {
    const user = await prisma.newUser.create({
        data: {
            email: 'sandeep@example.com',
            password: 'securepassword',
            firstName: 'Sandeep',
            lastName: 'Patel',
        },
    });
    console.log(user);
    return res.json({message: "User added successfuly !"});
});

module.exports = {
    adminRouter: adminRouter
};