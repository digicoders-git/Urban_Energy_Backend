const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Referrer = require('../models/Referrer')

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

      // Send OTP (for now return in response, in production send via email/SMS)
      res.json({ 
        message: 'OTP generated successfully',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
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
