import { z } from "zod";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { SubCategoryDocument, subCategoryModel } from "../../database/models/subCategory";

const subCategorySchema = z.object({
    name: z.string().min(1),
    description: z.string(),
    imageUrl: z.string().min(1),
    categoryId: z.string().min(1),
});

export async function index(req: Request, res: Response): Promise<void> {
    try {
        const subCategory: SubCategoryDocument[] = await subCategoryModel.find();
        res.json({
            message: "Sub Categories retrieved successfully !",
            data: subCategory
        });
        return;
    }
    catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching Sub-Categories !"
        })
        return;
    }
}

export async function view(req: Request, res: Response): Promise<void> {
    try {
        const { subCategoryId } = req.params;

        if (!Types.ObjectId.isValid(subCategoryId)) {
            res.status(400).json({ message: 'Invalid Subcategory ID' });
            return;
        }

        const subCategory: SubCategoryDocument | null = await subCategoryModel.findById(subCategoryId);

        if (!subCategory) {
            res.status(404).json({
                message: "No sub category found",
            });
            return;
        };

        res.status(200).json({
            message: "Sub-Category retrieved successfully !",
            data: subCategory
        });
    }
    catch (error: unknown) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            message: "Error while fetching a sub-category !"
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

        const subCategoryData = subCategorySchema.parse(req.body);

        const newSubCategory: SubCategoryDocument = await subCategoryModel.create({
            ...subCategoryData,
            creatorId: creatorId
        });

        res.status(201).json({
            message: "SubCategory created successfully !",
            category: newSubCategory
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
            message: "Error during saving a sub-category !"
        });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const { subCategoryId } = req.params;

    if (!Types.ObjectId.isValid(subCategoryId)) {
        res.status(400).json({ message: 'Invalid SubCategory ID' });
        return;
    }

    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized: User ID is missing" });
            return;
        }
        const subCategoryData = subCategorySchema.parse(req.body);

        const subCategory: SubCategoryDocument | null = await subCategoryModel.findById(subCategoryId);

        if (!subCategory) {
            res.status(404).json({ message: 'Subcategory not found' });
            return;
        }

        const updatedSubCategory: SubCategoryDocument | null = await subCategoryModel.findByIdAndUpdate(
            subCategoryId,
            {
                $set: {
                    name: subCategoryData.name,
                    description: subCategoryData.description,
                    imageUrl: subCategoryData.imageUrl,
                    categoryId: subCategoryData.categoryId
                }
            },
            { new: true }  // Return the updated document
        )

        res.status(200).json({
            message: "Subcategory updated successfully !",
            category: updatedSubCategory
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
            message: "Error during updating a subcategory !"
        })
    }
}

export async function destroy(req: Request, res: Response): Promise<void> {
    const { subCategoryId } = req.params;

    if (!Types.ObjectId.isValid(subCategoryId)) {
        res.status(400).json({ message: 'Invalid subcategory ID' });
        return;
    }

    try {
        const subCategory: SubCategoryDocument | null = await subCategoryModel.findById(subCategoryId);

        if (!subCategory) {
            res.status(404).json({ message: 'Subcategory not found' });
            return;
        }

        await subCategoryModel.findByIdAndDelete(subCategoryId);

        res.status(200).json({
            message: "Sub Category removed successfully !"
        })
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown Error",
            message: "Error during removing a sub category !"
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