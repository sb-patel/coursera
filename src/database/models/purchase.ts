import mongoose, { Document, Model, Schema } from "mongoose";

export interface PurchaseDocument extends Document {
    userId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
}

const purchaseSchema: Schema<PurchaseDocument> = new Schema({
    userId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
});

export const purchaseModel: Model<PurchaseDocument> = mongoose.model<PurchaseDocument>(
    "purchase",
    purchaseSchema
);