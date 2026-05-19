const mongoose = require('mongoose')

const jobApplicationSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, trim: true },
  phone:    { type: String, required: true, trim: true },
  role:     { type: String, required: true, trim: true },
  message:  { type: String, trim: true },
  cv: {
    data:        Buffer,
    contentType: String,
    filename:    String,
  },
  status: { type: String, enum: ['New', 'Reviewed', 'Shortlisted', 'Rejected'], default: 'New' },
}, { timestamps: true })

module.exports = mongoose.model('JobApplication', jobApplicationSchema)
