const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const Referrer = require('../models/Referrer')

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  pool: {
    maxConnections: 1,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 1
  }
})

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter error:', error)
  } else {
    console.log('Email service ready')
  }
})

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email (non-blocking)
async function sendOTPEmail(email, otp) {
  try {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Urban Energy - Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is:</p>
        <h3 style="color: #007bff;">${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    }, (error, info) => {
      if (error) {
        console.error('Email failed:', error)
      } else {
        console.log('Email sent:', info.response)
      }
    })
    return true
  } catch (error) {
    console.error('Email error:', error)
    return false
  }

// POST /api/forgot-password - Generate OTP
router.post('/',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

      const { email } = req.body
      const referrer = await Referrer.findOne({ email })
      if (!referrer) return res.status(404).json({ message: 'Email not registered' })

      // Generate OTP
      const otp = generateOTP()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save OTP to database
      referrer.resetPasswordOTP = otp
      referrer.resetPasswordExpires = expiresAt
      await referrer.save()

      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp)
      
      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send OTP email. Please try again or contact support.' })
      }

      res.json({ 
        message: 'OTP sent to your email',
        email: email,
        expiresIn: '10 minutes'
      })
    } catch (error) {
      console.error('Forgot password error:', error)
      res.status(500).json({ message: 'Failed to generate OTP. Please try again.' })
    }
  }
)

// POST /api/forgot-password/verify - Verify OTP and reset password
router.post('/verify',
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

      const { email, otp, newPassword } = req.body
      const referrer = await Referrer.findOne({ email })
      if (!referrer) return res.status(404).json({ message: 'Email not found' })

      // Check OTP validity
      if (!referrer.resetPasswordOTP || referrer.resetPasswordOTP !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' })
      }

      if (new Date() > referrer.resetPasswordExpires) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
      }

      // Update password
      referrer.password = newPassword
      referrer.resetPasswordOTP = undefined
      referrer.resetPasswordExpires = undefined
      await referrer.save()

      res.json({ message: 'Password reset successfully. Please login with your new password.' })
    } catch (error) {
      console.error('Password reset error:', error)
      res.status(500).json({ message: 'Password reset failed. Please try again.' })
    }
  }
)

module.exports = router
