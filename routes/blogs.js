const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const Blog = require('../models/blog')
const auth = require('../middleware/auth')

// Public: website ke liye published blogs
router.get('/published', async (req, res) => {
  res.json(await Blog.find({ status: 'Published' }).sort({ createdAt: -1 }))
})

// Public: single blog + increment view count
router.get('/:id/view', async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
  if (!blog) return res.status(404).json({ message: 'Blog not found' })
  res.json(blog)
})

// Admin: all blogs
router.get('/', auth, async (req, res) => {
  res.json(await Blog.find().sort({ createdAt: -1 }))
})

router.post('/', auth,
  body('title').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    res.status(201).json(await Blog.create(req.body))
  }
)

router.put('/:id', auth,
  body('title').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!blog) return res.status(404).json({ message: 'Blog not found' })
    res.json(blog)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
