import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    postName: {
      type: String,
    },
    aboutPost: {
      type: String,
    },
    author: {
      type: String,
    },
    image: {
      name: {
        type: String,
      },
      path: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
