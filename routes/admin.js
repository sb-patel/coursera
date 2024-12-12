const { Router } = require("express");
const adminRouter = Router();
const { adminMiddleware } = require("../app/middleware/adminMiddleware")
const adminController = require("../app/controllers/adminController")
const { ObjectId } = require('mongodb'); // Import ObjectId from mongodb package

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

adminRouter.post("/signup", adminController.signUp);

adminRouter.post("/signin", adminController.signIn);

adminRouter.post("/course", adminMiddleware, adminController.addCourse);

adminRouter.put("/course/:courseId", adminMiddleware, adminController.updateCourse);

adminRouter.delete("/course/:courseId", adminMiddleware, adminController.deleteCourse);

adminRouter.get("/list", adminMiddleware, adminController.list);

adminRouter.post("/test/new/user", async function (req, res) {
    const user = await prisma.newUser.create({
        data: {
            email: 'sandeep@example.com',
            password: 'securepassword',
            firstName: 'Sandeep',
            lastName: 'Patel',
        },
    });
    console.log(user);
    return res.json({ message: "User added successfuly !" });
});

adminRouter.get("/test/new/user/:userId", async function (req, res) {
    try {
        const { userId } = req.params;
        console.log(userId);
        const user = prisma.newUser.findUnique({
            where: { id: new ObjectId(userId) },
        })
        return res.json({
            users: user
        })
    }
    catch (error) {
        console.error(error.message);
    }
});

adminRouter.get("/test/new/user/", async function (req, res) {
    try {
        const users = await prisma.newUser.findMany();
        return res.json({
            users: users
        })
    }
    catch (error) {
        console.error(error.message);
    }
});
adminRouter.post("/test/new/user/update/:userId", async function (req, res) {
    try {
        const { userId } = req.params;
        console.log(userId);
        const user = prisma.newUser.findUnique({
            where: { _id: userId },
        })
        if (!user) {
            return res.status(404).json({
                message: "no user found to update !"
            })
        }

        const { email, password, firstName, lastName } = req.body;

        const udatedUser = prisma.newUser.update({
            where: { _id: userId },
            email,
            password,
            firstName,
            lastName,
        });

        return res.json({
            udatedUser
        })
    }
    catch (error) {
        console.error(error.message);
    }
});
adminRouter.post("/test/new/user/delete/:userId", async function (req, res) {
    try {
        const { userId } = req.params;
        const user = prisma.newUser.findUnique({
            where: { _id: userId },
        })
        if (!user) {
            return res.status(404).json({
                message: "no user found !"
            })
        }
        prisma.newUser.delete({
            where: { _id: userId },
        })
        return res.json({
            users: []
        })
    }
    catch (error) {
        console.error(error.message);
    }
});

module.exports = {
    adminRouter: adminRouter
};