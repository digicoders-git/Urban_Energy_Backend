const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Review = require('../models/Review')
const auth = require('../middleware/auth')

// Public: get published reviews for website
router.get('/published', async (req, res) => {
  res.json(await Review.find({ status: 'published' }).sort({ createdAt: -1 }))
})

router.get('/', auth, async (req, res) => {
  res.json(await Review.find().sort({ createdAt: -1 }))
})

router.post('/',
  body('name').notEmpty().trim(),
  body('review').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    res.status(201).json(await Review.create(req.body))
  }
)

router.patch('/:id/status', auth,
  body('status').isIn(['pending', 'published', 'rejected']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const r = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!r) return res.status(404).json({ message: 'Review not found' })
    res.json(r)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
