"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("./routes/user");
const admin_1 = require("./routes/admin");
const course_1 = require("./routes/course");
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Enable CORS for all routes in development
app.use(express_1.default.json());
const port = 3000;
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/admin", admin_1.adminRouter);
app.use("/api/v1/course", course_1.courseRouter);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env.MONGO_URL) {
                return;
            }
            yield mongoose_1.default.connect(process.env.MONGO_URL);
            console.log(process.env.MONGO_URL);
            app.listen(port, () => {
                console.log(`Example app listening on port ${port}`);
            });
        }
        catch (error) {
            console.log(error instanceof Error ? error.message : "Unknown Error");
        }
    });
}
;
main();
