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

const {
  validateBlog,
  validateObjectId,
} = require("../middleware/blogMiddleware");

// ======================
// CREATE BLOG
// ======================
router.post("/add", validateBlog, createBlog);

// ======================
// GET ALL BLOGS
// ======================
router.get("/", getAllBlogs);

// ======================
// GET SINGLE BLOG
// ======================
router.get("/:id", validateObjectId, getBlogById);

// ======================
// UPDATE BLOG
// ======================
router.put("/:id", validateObjectId, updateBlog);

// ======================
// DELETE BLOG
// ======================
router.delete("/:id", validateObjectId, deleteBlog);

// ======================
// INCREASE VIEWS
// ======================
router.patch("/view/:id", validateObjectId, incrementViews);

module.exports = router;