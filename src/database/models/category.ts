import mongoose, { Document, Model, Schema } from "mongoose";

export interface CategoryDocument extends Document {
    name: string;
    description?: string;
    imageUrl: string,
    userId: mongoose.Types.ObjectId;
}

const categorySchema: Schema<CategoryDocument> = new Schema({
    name: { type: String, required: true },
    description: String,
    imageUrl: String,
    userId: mongoose.Types.ObjectId,
});


export const categoryModel: Model<CategoryDocument> = mongoose.model<CategoryDocument>(
    "category",
    categorySchema
);