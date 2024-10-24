const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: {type : String, required: true },
    firstName: {type : String, required: true },
    lastName: String
});

const adminModel = mongoose.model("admin", adminSchema);

module.exports = {
    adminModel
}