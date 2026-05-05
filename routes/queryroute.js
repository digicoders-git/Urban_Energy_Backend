const express = require("express");
const router = express.Router();

const {
  createQuery,
  getAllQueries,
  getQueryById,
  deleteQuery,
} = require("../controllers/queryController");

const { validateQuery } = require("../middleware/querymiddleware");

// USER (with validation)
router.post("/add", validateQuery, createQuery);

// ADMIN
router.get("/", getAllQueries);
router.get("/:id", getQueryById);
router.delete("/:id", deleteQuery);

module.exports = router;