require('dotenv').config();

import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/user";
import { adminRouter } from "./routes/admin";
import { courseRouter } from "./routes/course";

const app = express()
app.use(cors()); // Enable CORS for all routes in development
app.use(express.json());

const port = 3000

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main(){
  try{
    if(!process.env.MONGO_URL){
      return;
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log(process.env.MONGO_URL);

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  }
  catch(error){
    console.log(error instanceof Error ? error.message : "Unknown Error");
  }
};

main();