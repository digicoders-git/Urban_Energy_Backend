const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Partner = require('../models/Partner')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  res.json(await Partner.find().sort({ createdAt: -1 }))
})

router.post('/',
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const p = await Partner.create(req.body)
    Notification.create({ name: p.name, msg: `New partner request: ${p.company || p.type}`, route: '/partners', color: '#a78bfa' }).catch(() => {})
    res.status(201).json(p)
  }
)

router.patch('/:id/status', auth,
  body('status').isIn(['pending', 'approved', 'rejected']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const p = await Partner.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!p) return res.status(404).json({ message: 'Partner not found' })
    res.json(p)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await Partner.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
