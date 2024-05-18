import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import postRoutes from "./routes/post.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;
const { MONGODB_URI } = process.env;

app.use(bodyParser.json());

app.use(postRoutes);

app.use("/", (req, res) => {
  console.log("Working ");
  res.send("WORKING");
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
