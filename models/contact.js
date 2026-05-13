const mongoose = require('mongoose')

module.exports = mongoose.model('Contact', new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, required: true, trim: true },
  email:   { type: String, trim: true, lowercase: true },
  city:    { type: String, trim: true },
  bill:    { type: Number, default: 0 },
  message: { type: String, trim: true },
  status:  { type: String, enum: ['New', 'Contacted', 'Converted'], default: 'New' },
}, { timestamps: true }))
