const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Contact = require('../models/Contact')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 })
  res.json(contacts)
})

router.post('/', 
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const contact = await Contact.create(req.body)
    Notification.create({ name: contact.name, msg: `New contact: ${contact.message || contact.city || 'Inquiry received'}`, route: '/contacts', color: '#FF7A00' }).catch(() => {})
    res.status(201).json(contact)
  }
)

router.patch('/:id/status', auth,
  body('status').isIn(['New', 'Contacted', 'Converted']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    res.json(contact)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
