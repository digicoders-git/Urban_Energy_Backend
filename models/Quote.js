const mongoose = require('mongoose')

module.exports = mongoose.model('Quote', new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, trim: true, lowercase: true },
  phone:      { type: String, trim: true },
  city:       { type: String, trim: true },
  systemSize: { type: String, trim: true },
  type:       { type: String, trim: true },
  bill:       { type: String, trim: true },
  message:    { type: String, trim: true },
  status:     { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
}, { timestamps: true }))
