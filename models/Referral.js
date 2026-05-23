const mongoose = require('mongoose')

module.exports = mongoose.model('Referral', new mongoose.Schema({
  referrerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Referrer' },
  referrerName:   { type: String, required: true, trim: true },
  referrerPhone:  { type: String, required: true, trim: true },
  refereeName:    { type: String, required: true, trim: true },
  refereePhone:   { type: String, required: true, trim: true },
  refereeEmail:   { type: String, trim: true, lowercase: true },
  refereeCity:    { type: String, required: true, trim: true },
  refereeBill:    { type: Number, default: 0 },
  refereeType:    { type: String, required: true, trim: true },
  refereeMessage: { type: String, trim: true },
  commission:     { type: Number, default: 0 },
  status:         { type: String, enum: ['New', 'Contacted', 'Converted', 'Paid'], default: 'New' },
}, { timestamps: true }))
