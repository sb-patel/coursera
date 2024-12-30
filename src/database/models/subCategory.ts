import mongoose, { Document, Model, Schema } from "mongoose";

export interface SubCategoryDocument extends Document {
    name: string;
    description?: string;
    imageUrl: string,
    categoryId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
}

const subCategorySchema: Schema<SubCategoryDocument> = new Schema({
    name: { type: String, required: true },
    description: String,
    imageUrl: String,
    categoryId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
});


export const subCategoryModel: Model<SubCategoryDocument> = mongoose.model<SubCategoryDocument>(
    "subCategory",
    subCategorySchema
);