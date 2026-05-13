const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Quote = require('../models/Quote')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  res.json(await Quote.find().sort({ createdAt: -1 }))
})

router.post('/',
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const q = await Quote.create(req.body)
    Notification.create({ name: q.name, msg: `New quote request: ${q.systemSize || ''} ${q.type || ''}`.trim(), route: '/get-quotes', color: '#FFB800' }).catch(() => {})
    res.status(201).json(q)
  }
)

router.patch('/:id/status', auth,
  body('status').isIn(['new', 'contacted', 'closed']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const q = await Quote.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!q) return res.status(404).json({ message: 'Quote not found' })
    res.json(q)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await Quote.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
