const mongoose = require('mongoose')

module.exports = mongoose.model('Notification', new mongoose.Schema({
  name:  { type: String, required: true },
  msg:   { type: String, required: true },
  route: { type: String, required: true },
  color: { type: String, default: '#FF7A00' },
  read:  { type: Boolean, default: false },
}, { timestamps: true }))
