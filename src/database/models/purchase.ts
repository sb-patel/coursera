import mongoose, { Document, Model, Schema } from "mongoose";

export interface purchaseDocument extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
}

const purchaseSchema: Schema<purchaseDocument> = new Schema({
    userId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
});

export const purchaseModel: Model<purchaseDocument> = mongoose.model<purchaseDocument>(
    "purchase",
    purchaseSchema
);