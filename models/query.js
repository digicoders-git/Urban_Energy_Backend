const mongoose = require('mongoose')

module.exports = mongoose.model('Query', new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, required: true, trim: true },
  city:        { type: String, trim: true },
  requirement: { type: String, trim: true },
  status:      { type: String, enum: ['Pending', 'Reviewed', 'Closed'], default: 'Pending' },
}, { timestamps: true }))
