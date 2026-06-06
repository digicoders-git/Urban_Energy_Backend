const mongoose = require('mongoose')

module.exports = mongoose.model('CommissionConfig', new mongoose.Schema({
  residential: { type: Number, default: 1999 },
  commercial:  { type: Number, default: 4999 },
  society:     { type: Number, default: 4999 },
  offGrid:     { type: Number, default: 4999 },
}, { timestamps: true }))
