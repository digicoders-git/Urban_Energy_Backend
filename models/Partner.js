const mongoose = require('mongoose')

module.exports = mongoose.model('Partner', new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, trim: true, lowercase: true },
  phone:   { type: String, trim: true },
  city:    { type: String, trim: true },
  company: { type: String, trim: true },
  type:    { type: String, enum: ['Dealer', 'Installer', 'Distributor'], default: 'Dealer' },
  message: { type: String, trim: true },
  status:  { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true }))
