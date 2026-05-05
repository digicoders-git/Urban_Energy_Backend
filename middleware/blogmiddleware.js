const mongoose = require("mongoose");

// Validate blog input
const validateBlog = (req, res, next) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({
      success: false,
      message: "Title, content and author are required",
    });
  }

  next();
};

// Validate MongoDB ID
const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  next();
};

module.exports = {
  validateBlog,
  validateObjectId,
};