const Query = require("../models/query");

// ======================
// CREATE QUERY (USER)
// ======================
const createQuery = async (req, res) => {
  try {
    const query = await Query.create(req.body);

    res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      data: query,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// GET ALL QUERIES (ADMIN)
// ======================
const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// GET SINGLE QUERY
// ======================
const getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================
// DELETE QUERY (ADMIN)
// ======================
const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createQuery,
  getAllQueries,
  getQueryById,
  deleteQuery,
};