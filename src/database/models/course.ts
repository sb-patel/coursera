import mongoose, { Schema, Document, Model} from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

export interface courseDocument extends Document{
    title: String;
    description: String;
    price: Number;
    imageUrl: String;
    creatorId: mongoose.Types.ObjectId;
};

const courseSchema: Schema<courseDocument> = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
});

export const courseModel: Model<courseDocument> = mongoose.model<courseDocument>(
    "course",
    courseSchema
);