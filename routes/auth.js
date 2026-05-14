const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const Admin = require('../models/Admin')
const auth = require('../middleware/auth')

// POST /api/auth/create-admin (one-time, only if no admin exists)
router.post('/create-admin',
  body('username').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const exists = await Admin.findOne({})
    if (exists) return res.status(403).json({ message: 'Admin already exists. Use login instead.' })

    const { username, password, name, role } = req.body
    const admin = await Admin.create({ username, password, name, role: role || 'Super Admin' })
    res.status(201).json({ message: 'Admin created successfully', username: admin.username, name: admin.name })
  }
)

// POST /api/auth/login
router.post('/login',
  body('username').notEmpty().trim(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid username or password' })

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
    res.json({ token, admin: { username: admin.username, name: admin.name, role: admin.role, mobile: admin.mobile, address: admin.address, avatar: admin.avatar } })
  }
)

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password')
  if (!admin) return res.status(404).json({ message: 'Admin not found' })
  res.json(admin)
})

// PUT /api/auth/profile
router.put('/profile', auth,
  body('name').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const { name, mobile, address, role, avatar } = req.body
    const admin = await Admin.findByIdAndUpdate(req.admin.id, { name, mobile, address, role, avatar }, { new: true }).select('-password')
    res.json(admin)
  }
)

// PUT /api/auth/password
router.put('/password', auth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const admin = await Admin.findById(req.admin.id)
    if (!(await admin.comparePassword(req.body.currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' })

    admin.password = req.body.newPassword
    await admin.save()
    res.json({ message: 'Password updated successfully' })
  }
)

module.exports = router
