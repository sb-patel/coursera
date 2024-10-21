require('dotenv').config();
const express = require('express')
const mongoose = require("mongoose");

const { userRouter } = require('./routes/user');
const { adminRouter } = require('./routes/admin');
const { courseRouter } = require('./routes/course');

const app = express()
app.use(express.json());

const port = 3000

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main(){
  try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log(process.env.MONGO_URL);

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    });
  }
  catch(error){
    console.log(error);
  }
};

main();