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
    const { email, password, firstName, lastName } = req.body;
    try {
        const user = await prisma.newUser.create({
            data: {
                email,
                password,
                firstName,
                lastName,
            },
        });
        return res.json({ user, message: "User added successfuly !" });
    }
    catch (error) {
        res.status(500).json({
            message: "Error during creating a user",
            error: error.message
        })
    }
});

adminRouter.get("/test/new/user/:userId", async function (req, res) {
    try {
        const { userId } = req.params;
        const user = await prisma.newUser.findFirst({
            where: {
                id: userId
            },
            select: {
                email: true,
                firstName: true,
                lastName: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                message: "No such user exists !"
            });
        }
        res.json({
            user
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error during fetching a user",
            error: error.message
        })
    }
});

adminRouter.get("/test/new/users", async function (req, res) {
    try {
        const users = await prisma.newUser.findMany();
        res.json({
            users: users
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Error during fetching user list",
            error: error.message
        })
    }
});

adminRouter.patch("/test/new/user/:userId", async function (req, res) {
    const { userId } = req.params;
    try {
        const user = prisma.newUser.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return res.status(404).json({
                message: "no user found to update !"
            })
        }

        const { email, password, firstName, lastName } = req.body;

        const data = {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
        };

        const udatedUser = await prisma.newUser.update({
            where: { id: userId },
            data
        });

        return res.json({
            udatedUser
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Error during updating a user",
            error: error.message
        })
    }
});

adminRouter.post("/test/new/user/delete/:userId", async function (req, res) {
    const { userId } = req.params;
    try {
        const user = await prisma.newUser.findUnique({
            where: { id: userId },
        })
        if (!user) {
            return res.status(404).json({
                message: "no user found !"
            })
        }

        await prisma.newUser.delete({
            where: { id: userId },
        })
        
        return res.json({
            message: `User - ${userId} deleted successfully !`
        })
    }
    catch (error) {
        res.status(500).json({
            message: "Error during deleting a user",
            error: error.message
        })
    }
});

module.exports = {
    adminRouter: adminRouter
};