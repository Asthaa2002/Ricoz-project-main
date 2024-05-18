import postSchema from "../models/post.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import app from "../firebaseConfig.js";

const storage = getStorage(app);

export async function uploadImageToFirebaseStorage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send({ error: "Image file is required." });
    }

    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `files/${req.file.originalname + "  " + dateTime}`
    );
    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("File successfully uploaded");

    return downloadURL;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while uploading the file.");
  }
}

async function deleteImageFromFirebaseStorage(imageUrl) {
  try {
    const storageRef = ref(storage, imageUrl);

    await deleteObject(storageRef);

    console.log("Image deleted from Firebase Storage");
  } catch (error) {
    console.error("Error deleting the image from Firebase Storage:", error);
    throw new Error("An error occurred while deleting the image.");
  }
}

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};

export const createNewPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const imageUrl = await uploadImageToFirebaseStorage(req, res);

    const { postName, aboutPost, author } = req.body;

    const existingPost = await postSchema.findOne({ postName });
    if (existingPost) {
      return res.status(400).json({ message: "Post already exists!" });
    }

    const newPost = new postSchema({
      postName,
      aboutPost,
      author,
      image: {
        name: req.file.originalname,
        url: imageUrl,
      },
    });

    const result = await newPost.save();

    return res
      .status(201)
      .json({ success: true, message: "Post saved!", result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

export const retrieveAllPosts = async (req, res) => {
  try {
    const findPosts = await postSchema.find();
    if (findPosts.length === 0) {
      return res.status(404).json({ message: "No Post found !!" });
    }

    return res
      .status(200)
      .json({ message: "All Posts retrieved !!", findPosts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postSchema.findById(id);
    console.log(post);
    if (!post) {
      return res.status(404).json({ message: "No post found !" });
    }

    return res
      .status(200)
      .json({ message: "Post fetched successfully !", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error !" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const updatedData = req.body;
    const image = req.file;

    const existingPost = await postSchema.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (image && existingPost.image && existingPost.image.url) {
      await deleteImageFromFirebaseStorage(existingPost.image.url);
    }

    if (image) {
      const imageUrl = await uploadImageToFirebaseStorage(req, res);

      existingPost.image = {
        name: image.originalname,
        url: imageUrl,
      };
    }

    existingPost.postName = updatedData.postName;
    existingPost.aboutPost = updatedData.aboutPost;
    existingPost.author = updatedData.author;

    const updatedPost = await existingPost.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      updatedPost,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const findPost = await postSchema.findById(id);
    console.log(findPost);
    if (!findPost) {
      return res.status(404).json({ message: "No post found !!" });
    }

    if (findPost.image && findPost.image.url) {
      await deleteImageFromFirebaseStorage(findPost.image.url);
    }

    await postSchema.findByIdAndDelete(id);

    res.status(200).json({ message: "Post Deleted !" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error !!" });
  }
};
