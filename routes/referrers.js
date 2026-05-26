const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const multer = require('multer')
const Referrer = require('../models/Referrer')
const Referral = require('../models/Referral')
const referrerAuth = require('../middleware/referrerAuth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed for QR Code'))
    }
  }
})

// Helper to generate a unique referral code
const generateReferralCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const exists = await Referrer.findOne({ referralCode: code })
  if (exists) return generateReferralCode()
  return code
}

// POST /api/referrers/register
router.post('/register',
  upload.single('qrCode'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('city').notEmpty().trim().withMessage('City is required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { name, phone, email, password, city, upiId } = req.body

      // Check if phone already registered
      const phoneExists = await Referrer.findOne({ phone: phone.trim() })
      if (phoneExists) return res.status(400).json({ message: 'Phone number already registered. Please login.' })

      // Check if email already registered (if provided)
      if (email && email.trim()) {
        const emailExists = await Referrer.findOne({ email: email.trim().toLowerCase() })
        if (emailExists) return res.status(400).json({ message: 'Email address already registered.' })
      }

      const referralCode = await generateReferralCode()

      const referrer = await Referrer.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        password,
        city: city.trim(),
        referralCode,
        upiId: upiId ? upiId.trim() : undefined,
        qrCode: req.file ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          filename: req.file.originalname
        } : undefined
      })

      const token = jwt.sign(
        { id: referrer._id, name: referrer.name, referralCode: referrer.referralCode },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      res.status(201).json({
        token,
        referrer: {
          id: referrer._id,
          name: referrer.name,
          phone: referrer.phone,
          email: referrer.email,
          city: referrer.city,
          referralCode: referrer.referralCode,
          status: referrer.status,
          totalEarnings: 0,
          upiId: referrer.upiId,
          hasQrCode: !!(referrer.qrCode && referrer.qrCode.data)
        }
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error during registration.' })
    }
  }
)

// POST /api/referrers/login
router.post('/login',
  body('phone').notEmpty().trim().withMessage('Mobile number or Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { phone, password } = req.body
      const identifier = phone.trim()
      
      const referrer = await Referrer.findOne({
        $or: [
          { phone: identifier },
          { email: identifier.toLowerCase() }
        ]
      })
      
      if (!referrer || !(await referrer.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid mobile number/email or password' })
      }

      if (referrer.status === 'inactive') {
        return res.status(403).json({ message: 'Your account is inactive. Please contact support.' })
      }

      // Calculate total earnings dynamically based on paid referrals
      const referrals = await Referral.find({ referrerId: referrer._id, status: 'Paid' })
      const totalEarnings = referrals.reduce((sum, r) => sum + (r.commission || 0), 0)

      const token = jwt.sign(
        { id: referrer._id, name: referrer.name, referralCode: referrer.referralCode },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )

      res.json({
        token,
        referrer: {
          id: referrer._id,
          name: referrer.name,
          phone: referrer.phone,
          email: referrer.email,
          city: referrer.city,
          referralCode: referrer.referralCode,
          status: referrer.status,
          totalEarnings,
          upiId: referrer.upiId,
          hasQrCode: !!(referrer.qrCode && referrer.qrCode.data)
        }
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error during login.' })
    }
  }
)

// GET /api/referrers/me
router.get('/me', referrerAuth, async (req, res) => {
  try {
    const referrer = await Referrer.findById(req.referrer.id).select('-password')
    if (!referrer) return res.status(404).json({ message: 'User not found' })

    // Calculate total earnings dynamically based on paid referrals
    const referrals = await Referral.find({ referrerId: referrer._id, status: 'Paid' })
    const totalEarnings = referrals.reduce((sum, r) => sum + (r.commission || 0), 0)

    res.json({
      id: referrer._id,
      name: referrer.name,
      phone: referrer.phone,
      email: referrer.email,
      city: referrer.city,
      referralCode: referrer.referralCode,
      status: referrer.status,
      totalEarnings,
      upiId: referrer.upiId,
      hasQrCode: !!(referrer.qrCode && referrer.qrCode.data)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error fetching user details.' })
  }
})

// GET /api/referrers/qrcode/:id
router.get('/qrcode/:id', async (req, res) => {
  try {
    const referrer = await Referrer.findById(req.params.id)
    if (!referrer || !referrer.qrCode || !referrer.qrCode.data) {
      return res.status(404).json({ message: 'QR Code not found' })
    }
    res.set('Content-Type', referrer.qrCode.contentType)
    res.send(referrer.qrCode.data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error fetching QR Code.' })
  }
})

// GET /api/referrers/my-referrals
router.get('/my-referrals', referrerAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.referrer.id }).sort({ createdAt: -1 })
    res.json(referrals)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error fetching your referrals.' })
  }
})

// Reusable transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// POST /api/referrers/forgot-password
router.post('/forgot-password',
  body('email').isEmail().withMessage('Please provide a valid registered email address.'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const email = req.body.email.trim().toLowerCase()
      const referrer = await Referrer.findOne({ email })
      if (!referrer) {
        return res.status(404).json({ message: 'No registered account found with this email address.' })
      }

      // Generate a secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      referrer.resetPasswordOTP = otp
      referrer.resetPasswordExpires = Date.now() + 15 * 60 * 1000 // 15 minutes expiration
      await referrer.save()

      const mailOptions = {
        from: `"VAULIX™ Solar Energy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'VAULIX™ SOLAR - Password Reset Verification OTP',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #FF7A00, #ff9500);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
      color: #334155;
      line-height: 1.6;
    }
    .content p {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .otp-box {
      background-color: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #FF7A00;
      margin: 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .warning {
      font-size: 13px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 30px;
    }
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VAULIX™ SOLAR ENERGY</h1>
    </div>
    <div class="content">
      <p>Hello ${referrer.name},</p>
      <p>We received a request to reset the password for your <strong>VAULIX™ Solar Partner Account</strong>. Please use the following 6-digit One-Time Password (OTP) to proceed with resetting your password:</p>
      <div class="otp-box">
        <h2 class="otp-code">${otp}</h2>
      </div>
      <p>This OTP is highly secure and is valid for the next <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
      <div class="warning">
        <p><strong>Note:</strong> Never share this OTP with anyone. Our support team will never ask for your password or OTP.</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 VAULIX™ Solar Energy. All rights reserved.</p>
      <p>Empowering Homes and Businesses with Clean Energy.</p>
    </div>
  </div>
</body>
</html>
        `
      }

      await transporter.sendMail(mailOptions)
      res.json({ message: 'A secure One-Time Password (OTP) has been sent to your registered email.' })
    } catch (error) {
      console.error('SMTP Mail error:', error)
      res.status(500).json({ message: 'Failed to send OTP email. Please try again or contact support.' })
    }
  }
)

// POST /api/referrers/verify-otp
router.post('/verify-otp',
  body('email').isEmail().withMessage('Please provide a valid email.'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number.'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const email = req.body.email.trim().toLowerCase()
      const otp = req.body.otp.trim()

      const referrer = await Referrer.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
      })

      if (!referrer) {
        return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' })
      }

      res.json({ message: 'OTP verified successfully.' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error during OTP verification.' })
    }
  }
)

// POST /api/referrers/reset-password
router.post('/reset-password',
  body('email').isEmail().withMessage('Please provide a valid email.'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6-digits.'),
  body('newPassword').isLength({ min: 6 }).withMessage('New Password must be at least 6 characters.'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const email = req.body.email.trim().toLowerCase()
      const otp = req.body.otp.trim()
      const { newPassword } = req.body

      const referrer = await Referrer.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
      })

      if (!referrer) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' })
      }

      referrer.password = newPassword
      referrer.resetPasswordOTP = undefined
      referrer.resetPasswordExpires = undefined
      await referrer.save()

      res.json({ message: 'Password updated successfully! You can now sign in.' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error resetting password.' })
    }
  }
)

module.exports = router

