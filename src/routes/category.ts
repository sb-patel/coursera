import { Router } from "express";
const categoryRouter = Router();
import { authMiddleware } from "../app/middleware/authMiddleware";
import * as categoryController from "../app/controllers/categoryController"


categoryRouter.get("/", categoryController.index);
categoryRouter.get("/:categoryId", categoryController.view);
categoryRouter.get("/:categoryId/subcategories", categoryController.getCategorySubCategory);
categoryRouter.post("/", authMiddleware, categoryController.add);
categoryRouter.put("/:categoryId", authMiddleware, categoryController.update);
categoryRouter.delete("/:categoryId", authMiddleware, categoryController.destroy);

export { categoryRouter };