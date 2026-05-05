const validateContact = (req, res, next) => {
  const { fullName, phoneNumber, email, city, monthlyBill } = req.body;

  if (!fullName || !phoneNumber || !email || !city || !monthlyBill) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled",
    });
  }

  next();
};

module.exports = { validateContact };