import mongoose, { Document, Model, Schema } from "mongoose";

export interface CategoryDocument extends Document {
    name: string;
    description?: string;
    imageUrl: string,
    creatorId: mongoose.Types.ObjectId;
}

const categorySchema: Schema<CategoryDocument> = new Schema({
    name: { type: String, required: true },
    description: String,
    imageUrl: String,
    creatorId: mongoose.Types.ObjectId,
});


export const categoryModel: Model<CategoryDocument> = mongoose.model<CategoryDocument>(
    "category",
    categorySchema
);