const router = require('express').Router()
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

// GET latest 20 notifications
router.get('/', auth, async (req, res) => {
  const notifs = await Notification.find().sort({ createdAt: -1 }).limit(20)
  res.json(notifs)
})

// PATCH mark one as read
router.patch('/:id/read', auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true })
  res.json({ ok: true })
})

// PATCH mark all as read
router.patch('/mark-all-read', auth, async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true })
  res.json({ ok: true })
})

module.exports = router
