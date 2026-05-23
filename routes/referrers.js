const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const Referrer = require('../models/Referrer')
const Referral = require('../models/Referral')
const referrerAuth = require('../middleware/referrerAuth')

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
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('city').notEmpty().trim().withMessage('City is required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { name, phone, email, password, city } = req.body

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
        referralCode
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
          totalEarnings: 0
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
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { phone, password } = req.body
      const referrer = await Referrer.findOne({ phone: phone.trim() })
      if (!referrer || !(await referrer.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid phone number or password' })
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
          totalEarnings
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
      totalEarnings
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error fetching user details.' })
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

module.exports = router
