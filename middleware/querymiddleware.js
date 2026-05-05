const validateQuery = (req, res, next) => {
  const { name, phone, city, requirement } = req.body;

  if (!name || !phone || !city || !requirement) {
    return res.status(400).json({
      success: false,
      message: "Name, phone, city and requirement are required",
    });
  }

  // Basic phone validation (optional but useful)
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number",
    });
  }

  next();
};

module.exports = {
  validateQuery,
};