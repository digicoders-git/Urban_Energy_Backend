const mongoose = require('mongoose')

module.exports = mongoose.model('Blog', new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  category: { type: String, default: 'Education' },
  status:   { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  content:  { type: String, default: '' },
  thumb:    { type: String, default: null },
  views:    { type: Number, default: 0 },
}, { timestamps: true }))
