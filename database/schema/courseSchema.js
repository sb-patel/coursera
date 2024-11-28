const z = require("zod");

courseSchema = z.object({
    title : z.string().min(1),
    description : z.string().min(1),
    price : z.number().min(1),
    imageUrl : z.string().min(1)
});

module.exports = {
    courseSchema : courseSchema
}