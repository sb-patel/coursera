const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: {type : String, required: true },
    firstName: {type : String, required: true },
    lastName: String
});

const userModel = mongoose.model("user", userSchema);

module.exports = {
    userModel
}