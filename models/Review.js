const mongoose = require('mongoose')

module.exports = mongoose.model('Review', new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  role:     { type: String, trim: true },
  initials: { type: String, trim: true },
  stars:    { type: Number, min: 1, max: 5, default: 5 },
  review:   { type: String, required: true, trim: true },
  status:   { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
}, { timestamps: true }))
