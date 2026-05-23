const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const referrerSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  phone:        { type: String, required: true, unique: true, trim: true },
  email:        { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password:     { type: String, required: true },
  referralCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  city:         { type: String, required: true, trim: true },
  status:       { type: String, enum: ['active', 'inactive'], default: 'active' },
  totalEarnings:{ type: Number, default: 0 }
}, { timestamps: true })

referrerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

referrerSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('Referrer', referrerSchema)
