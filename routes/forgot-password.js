const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const Referrer = require('../models/Referrer')

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/forgot-password - Send OTP to email
router.post('/forgot-password',
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

      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP - Vaulix Solar',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF7A00, #FFB800); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">Vaulix Solar</h2>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0;">Password Reset</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 16px;">Hi ${referrer.name},</p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                We received a request to reset your password. Your one-time password (OTP) is:
              </p>
              <div style="background: white; border: 2px solid #FF7A00; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #FF7A00; letter-spacing: 5px;">
                  ${otp}
                </p>
              </div>
              <p style="color: #666; font-size: 13px;">
                This OTP is valid for 10 minutes only. If you didn't request this, please ignore this email.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                © 2024 Vaulix Solar. All rights reserved.
              </p>
            </div>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      res.json({ message: 'OTP sent to your email. Valid for 10 minutes.' })
    } catch (error) {
      console.error('Forgot password error:', error)
      res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
    }
  }
)

// POST /api/forgot-password/verify-otp - Verify OTP
router.post('/forgot-password/verify-otp',
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

      const { email, otp } = req.body
      const referrer = await Referrer.findOne({ email })
      if (!referrer) return res.status(404).json({ message: 'Email not found' })

      // Check OTP validity
      if (!referrer.resetPasswordOTP || referrer.resetPasswordOTP !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' })
      }

      if (new Date() > referrer.resetPasswordExpires) {
        return res.status(400).json({ message: 'OTP has expired' })
      }

      // OTP verified, generate a reset token
      const resetToken = require('crypto').randomBytes(32).toString('hex')
      referrer.resetPasswordOTP = resetToken
      referrer.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      await referrer.save()

      res.json({ message: 'OTP verified', resetToken })
    } catch (error) {
      console.error('OTP verification error:', error)
      res.status(500).json({ message: 'Verification failed. Please try again.' })
    }
  }
)

// POST /api/forgot-password/reset - Reset password with token
router.post('/forgot-password/reset',
  body('email').isEmail().normalizeEmail(),
  body('resetToken').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

      const { email, resetToken, newPassword } = req.body
      const referrer = await Referrer.findOne({ email })
      if (!referrer) return res.status(404).json({ message: 'Email not found' })

      // Verify reset token
      if (!referrer.resetPasswordOTP || referrer.resetPasswordOTP !== resetToken) {
        return res.status(400).json({ message: 'Invalid or expired reset token' })
      }

      if (new Date() > referrer.resetPasswordExpires) {
        return res.status(400).json({ message: 'Reset token has expired' })
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
