const express = require("express");
const router = express.Router();

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  incrementViews,
} = require("../controllers/blogController");

const { validateBlog, validateObjectId } = require("../middleware/blogMiddleware");
const protect = require("../middleware/authmiddleware");

// CREATE BLOG (protected)
router.post("/add", protect, validateBlog, createBlog);

// GET ALL BLOGS
router.get("/", getAllBlogs);

// GET SINGLE BLOG
router.get("/:id", validateObjectId, getBlogById);

// UPDATE BLOG (protected)
router.put("/:id", protect, validateObjectId, updateBlog);

// DELETE BLOG (protected)
router.delete("/:id", protect, validateObjectId, deleteBlog);

// INCREASE VIEWS (public)
router.patch("/view/:id", validateObjectId, incrementViews);

module.exports = router;