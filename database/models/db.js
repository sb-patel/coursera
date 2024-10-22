const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
});

const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = {
    purchaseModel
}