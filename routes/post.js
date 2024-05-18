import express from "express";
import multer from "multer";
import {
  createNewPost,
  retrieveAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/create/new/post", upload.single("image"), createNewPost);
router.get("/get/all/posts", retrieveAllPosts);
router.get("/get/single/post/:id", getPostById);
router.put("/update/post/:postId", upload.single("image"), updatePost);
router.delete("/delete/post/:id", deletePost);

export default router;
