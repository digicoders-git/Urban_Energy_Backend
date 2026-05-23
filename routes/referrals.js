const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Referral = require('../models/Referral')
const CommissionConfig = require('../models/CommissionConfig')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

// ── GET COMMISSION CONFIG (PUBLIC OR ADMIN) ──
router.get('/commission-config', async (req, res) => {
  try {
    let config = await CommissionConfig.findOne()
    if (!config) {
      config = { residential: 1000, commercial: 5000, society: 3000, offGrid: 2000 }
    }
    res.json(config)
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching config.' })
  }
})

// ── UPDATE COMMISSION CONFIG (ADMIN ONLY) ──
router.put('/commission-config', auth, async (req, res) => {
  try {
    let config = await CommissionConfig.findOne()
    if (config) {
      config.residential = Number(req.body.residential) || 0
      config.commercial  = Number(req.body.commercial) || 0
      config.society     = Number(req.body.society) || 0
      config.offGrid     = Number(req.body.offGrid) || 0
      await config.save()
    } else {
      config = await CommissionConfig.create({
        residential: Number(req.body.residential) || 0,
        commercial:  Number(req.body.commercial) || 0,
        society:     Number(req.body.society) || 0,
        offGrid:     Number(req.body.offGrid) || 0,
      })
    }
    res.json(config)
  } catch (error) {
    res.status(500).json({ message: 'Server error updating config.' })
  }
})

// ── GET ALL REFERRALS (ADMIN ONLY) ──
router.get('/', auth, async (req, res) => {
  try {
    const referrals = await Referral.find().sort({ createdAt: -1 })
    res.json(referrals)
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching referrals.' })
  }
})

// ── SUBMIT NEW REFERRAL (PUBLIC) ──
router.post('/',
  async (req, res, next) => {
    try {
      const { referrerCode } = req.body
      if (referrerCode) {
        const Referrer = require('../models/Referrer')
        const referrerUser = await Referrer.findOne({ referralCode: referrerCode.toUpperCase() })
        if (referrerUser) {
          req.body.referrerId = referrerUser._id
          req.body.referrerName = referrerUser.name
          req.body.referrerPhone = referrerUser.phone
        }
      }
      next()
    } catch (err) {
      next(err)
    }
  },
  body('referrerName').notEmpty().trim(),
  body('referrerPhone').notEmpty().trim(),
  body('refereeName').notEmpty().trim(),
  body('refereePhone').notEmpty().trim(),
  body('refereeCity').notEmpty().trim(),
  body('refereeType').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Please fill all required fields.' })
    }

    try {
      const { refereeType } = req.body
      let config = await CommissionConfig.findOne()
      if (!config) {
        config = { residential: 1000, commercial: 5000, society: 3000, offGrid: 2000 }
      }

      // Map connection type to matching config key
      const typeMap = {
        'residential': 'residential',
        'commercial': 'commercial',
        'society': 'society',
        'off grid': 'offGrid',
      }
      const key = typeMap[refereeType.toLowerCase()] || 'residential'
      const commissionAmount = config[key] !== undefined ? config[key] : 1000

      const referral = await Referral.create({
        ...req.body,
        commission: commissionAmount,
      })

      // Trigger dashboard notification
      Notification.create({
        name: referral.refereeName,
        msg: `New Referral from ${referral.referrerName}: Interested in ${referral.refereeType}`,
        route: '/referrals',
        color: '#10B981',
      }).catch(() => {})

      res.status(201).json(referral)
    } catch (error) {
      res.status(500).json({ message: 'Server error submitting referral.' })
    }
  }
)

// ── UPDATE REFERRAL STATUS (ADMIN ONLY) ──
router.patch('/:id/status', auth,
  body('status').isIn(['New', 'Contacted', 'Converted', 'Paid']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const referral = await Referral.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      )
      if (!referral) return res.status(404).json({ message: 'Referral not found' })
      res.json(referral)
    } catch (error) {
      res.status(500).json({ message: 'Server error updating status.' })
    }
  }
)

// ── UPDATE REFERRAL COMMISSION (ADMIN ONLY) ──
router.patch('/:id/commission', auth,
  body('commission').isNumeric(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Valid commission amount is required.' })

    try {
      const referral = await Referral.findByIdAndUpdate(
        req.params.id,
        { commission: Number(req.body.commission) },
        { new: true }
      )
      if (!referral) return res.status(404).json({ message: 'Referral not found' })
      res.json(referral)
    } catch (error) {
      res.status(500).json({ message: 'Server error updating commission.' })
    }
  }
)

// ── DELETE REFERRAL (ADMIN ONLY) ──
router.delete('/:id', auth, async (req, res) => {
  try {
    const referral = await Referral.findByIdAndDelete(req.params.id)
    if (!referral) return res.status(404).json({ message: 'Referral not found' })
    res.json({ message: 'Referral deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting referral.' })
  }
})

module.exports = router
