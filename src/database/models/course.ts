import mongoose, { Schema, Document, Model} from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

export interface courseDocument extends Document{
    title: String;
    description: String;
    price: Number;
    imageUrl: String;
    subCategoryId: mongoose.Types.ObjectId;
    creatorId: mongoose.Types.ObjectId;
};

const courseSchema: Schema<courseDocument> = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    subCategoryId: ObjectId,
    creatorId: ObjectId
});

export const courseModel: Model<courseDocument> = mongoose.model<courseDocument>(
    "course",
    courseSchema
);