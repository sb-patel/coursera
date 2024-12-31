import { z } from "zod";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { CategoryDocument, categoryModel } from "../../database/models/category";
import { SubCategoryDocument, subCategoryModel } from "../../database/models/subCategory";

const categorySchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    imageUrl: z.string().min(1),
});


export async function index(req: Request, res: Response): Promise<void> {
    try {
        const category: CategoryDocument[] = await categoryModel.find();
        res.json({
            message: "Categories retrieved successfully !",
            data: category
        });
        return;
    }
    catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching Categories !"
        })
        return;
    }
}

export async function view(req: Request, res: Response): Promise<void> {
    try {
        const { categoryId } = req.params;

        if (!Types.ObjectId.isValid(categoryId)) {
            res.status(400).json({ message: 'Invalid Category ID' });
            return;
        }

        const category: CategoryDocument | null = await categoryModel.findById(categoryId);
        // const category = await categoryModel.findOne({ '_id':categoryId});

        if (!category) {
            res.status(404).json({
                message: "No category found",
            });
            return;
        };

        res.status(200).json({
            message: "Category retrieved successfully !",
            data: category
        });
    }
    catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching a category !"
        });
        return;
    }
}

export async function add(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }

        const creatorId: string = req.user.id;

        const categoryData = categorySchema.parse(req.body);

        const newCategory: CategoryDocument = await categoryModel.create({
            ...categoryData,
            creatorId: creatorId
        });

        res.status(201).json({
            message: "Category created successfully !",
            category: newCategory
        });
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
            return;
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during saving a category !"
        });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params;

    if (!Types.ObjectId.isValid(categoryId)) {
        res.status(400).json({ message: 'Invalid Category ID' });
        return;
    }

    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }
        const categoryData = categorySchema.parse(req.body);

        const category: CategoryDocument | null = await categoryModel.findById(categoryId);

        if (!category) {
            res.status(404).json({ message: 'category not found' });
            return;
        }

        const updatedCategory: CategoryDocument | null = await categoryModel.findByIdAndUpdate(
            categoryId,
            {
                $set: {
                    name: categoryData.name,
                    description: categoryData.description,
                    imageUrl: categoryData.imageUrl
                }
            },
            { new: true }  // Return the updated document
        )

        res.status(200).json({
            message: "category updated successfully !",
            category: updatedCategory
        });
    }
    catch (error: unknown) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: error.errors,
                message: "Validation Error"
            });
            return;
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during updating a Category !"
        })
    }
}

export async function destroy(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params;

    if (!Types.ObjectId.isValid(categoryId)) {
        res.status(400).json({ message: 'Invalid category ID' });
        return;
    }

    try {
        const category: CategoryDocument | null = await categoryModel.findById(categoryId);

        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        await categoryModel.findByIdAndDelete(categoryId);

        res.status(200).json({
            message: "Category removed successfully !"
        })
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during removing a category !"
        })
    }
}

export async function getCategorySubCategory(req: Request, res: Response): Promise<void> {
    try {
        const { categoryId } = req.params;

        if (!Types.ObjectId.isValid(categoryId)) {
            res.status(400).json({ message: 'Invalid Category ID' });
            return;
        }

        const subCategories: SubCategoryDocument[] | null = await subCategoryModel.find({'categoryId' : categoryId});

        if (!subCategories) {
            res.status(404).json({
                message: "No sub categories found",
            });
            return;
        };

        res.status(200).json({
            message: "Sub-Categories retrieved successfully !",
            data: subCategories
        });
    }
    catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching a sub-categories !"
        });
        return;
    }
}