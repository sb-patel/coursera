import mongoose, { Schema, Document } from "mongoose";

export interface UserDetailsDocument extends Document {
    userId: mongoose.Types.ObjectId;
    profilePic: string; // URL or path to the user's profile picture
    address: string;
    gender: "male" | "female" | "other";
    phoneNumber: string;
    dateOfBirth?: Date; // Optional field for user's date of birth
    createdAt: Date;
    updatedAt: Date;
}

const userDetailsSchema = new Schema<UserDetailsDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true, unique: true },
        profilePic: { type: String, required: false },
        address: { type: String, required: true },
        gender: { type: String, enum: ["male", "female", "other"], required: true },
        phoneNumber: { type: String, required: true },
        dateOfBirth: { type: Date, required: false },
    },
    { timestamps: true }
);

export const userDetailModel = mongoose.model<UserDetailsDocument>("userDetail", userDetailsSchema);