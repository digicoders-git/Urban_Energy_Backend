const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
} = require("../controllers/contactController");

const { validateContact } = require("../middleware/contactmiddleware");

// ======================
// USER ROUTE
// ======================
router.post("/add", validateContact, createContact);

// ======================
// ADMIN ROUTES
// ======================
router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.delete("/:id", deleteContact);

module.exports = router;