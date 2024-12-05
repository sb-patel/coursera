import mongoose, { Document, Schema, Model } from "mongoose";

export interface UserDocument extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

const userSchema: Schema<UserDocument> = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: String
});

export const userModel: Model<UserDocument> = mongoose.model<UserDocument>(
    "user",
    userSchema
)