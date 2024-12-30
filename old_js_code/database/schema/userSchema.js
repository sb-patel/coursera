const z = require("zod");

const signUpSchema = z.object({
    email: z.string().email(),              // Must be a valid email
    password: z.string().min(6),            // Minimum password length of 6 characters
    firstName: z.string().min(1),           // First name must not be empty
    lastName: z.string().min(1)             // Last name must not be empty
});

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

module.exports = {
    signUpSchema :signUpSchema,
    signInSchema : signInSchema
}