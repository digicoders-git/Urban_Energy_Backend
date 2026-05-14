const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Query = require('../models/query')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  res.json(await Query.find().sort({ createdAt: -1 }))
})

router.post('/',
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const q = await Query.create(req.body)
    Notification.create({ name: q.name, msg: `New query: ${q.requirement || q.city || 'Solar inquiry'}`, route: '/queries', color: '#00A3E0' }).catch(() => {})
    res.status(201).json(q)
  }
)

router.patch('/:id/status', auth,
  body('status').isIn(['Pending', 'Reviewed', 'Closed']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const q = await Query.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!q) return res.status(404).json({ message: 'Query not found' })
    res.json(q)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await Query.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
