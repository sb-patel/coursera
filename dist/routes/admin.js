"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const adminMiddleware_1 = require("../app/middleware/adminMiddleware");
const adminController = __importStar(require("../app/controllers/adminController"));
const adminRouter = (0, express_1.Router)();
exports.adminRouter = adminRouter;
// Admin Routes
adminRouter.post("/signup", adminController.signUp);
adminRouter.post("/signin", adminController.signIn);
adminRouter.post("/course", adminMiddleware_1.adminMiddleware, adminController.addCourse);
adminRouter.put("/course/:courseId", adminMiddleware_1.adminMiddleware, adminController.updateCourse);
adminRouter.delete("/course/:courseId", adminMiddleware_1.adminMiddleware, adminController.deleteCourse);
adminRouter.get("/list", adminMiddleware_1.adminMiddleware, adminController.list);
