import { Router } from "express";
const subCategoryRouter = Router();
import { authMiddleware } from "../app/middleware/authMiddleware";
import * as subCategoryController from "../app/controllers/subCategoryController"


subCategoryRouter.get("/", subCategoryController.index);
subCategoryRouter.get("/:subCategoryId", subCategoryController.view);
subCategoryRouter.get("/:subCategoryId/courses", subCategoryController.getSubCategoryCourses);
subCategoryRouter.post("/", authMiddleware, subCategoryController.add);
subCategoryRouter.put("/:subCategoryId", authMiddleware, subCategoryController.update);
subCategoryRouter.delete("/:subCategoryId", authMiddleware, subCategoryController.destroy);

export { subCategoryRouter };