// const mongoose = require("mongoose");
import mongoose, { Document, Model, Schema } from "mongoose";

// Define the interface for the Admin document
export interface AdminDocument extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName?: string; // Optional property
}

const adminSchema: Schema<AdminDocument> = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: String
});

export const adminModel: Model<AdminDocument> = mongoose.model<AdminDocument>("admin", adminSchema);