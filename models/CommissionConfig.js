const mongoose = require('mongoose')

module.exports = mongoose.model('CommissionConfig', new mongoose.Schema({
  residential: { type: Number, default: 1000 },
  commercial:  { type: Number, default: 5000 },
  society:     { type: Number, default: 3000 },
  offGrid:     { type: Number, default: 2000 },
}, { timestamps: true }))
