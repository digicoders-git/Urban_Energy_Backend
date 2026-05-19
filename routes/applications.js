const router = require('express').Router()
const multer = require('multer')
const { body, validationResult } = require('express-validator')
const JobApplication = require('../models/JobApplication')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF or Word files allowed'))
  }
})

// Submit application
router.post('/',
  upload.single('cv'),
  body('name').notEmpty().trim(),
  body('email').isEmail().trim(),
  body('phone').notEmpty().trim(),
  body('role').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    const app = await JobApplication.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      message: req.body.message,
      cv: req.file ? { data: req.file.buffer, contentType: req.file.mimetype, filename: req.file.originalname } : undefined,
    })

    Notification.create({
      name: app.name,
      msg: `New job application for: ${app.role}`,
      route: '/applications',
      color: '#00C9A7'
    }).catch(() => {})

    res.status(201).json({ message: 'Application submitted successfully' })
  }
)

// Get all applications (admin)
router.get('/', auth, async (req, res) => {
  const apps = await JobApplication.find().select('-cv.data').sort({ createdAt: -1 })
  res.json(apps)
})

// Download CV
router.get('/:id/cv', auth, async (req, res) => {
  const app = await JobApplication.findById(req.params.id)
  if (!app?.cv?.data) return res.status(404).json({ message: 'CV not found' })
  res.set('Content-Type', app.cv.contentType)
  res.set('Content-Disposition', `attachment; filename="${app.cv.filename}"`)
  res.send(app.cv.data)
})

// Update status
router.patch('/:id/status', auth,
  body('status').isIn(['New', 'Reviewed', 'Shortlisted', 'Rejected']),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })
    const app = await JobApplication.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!app) return res.status(404).json({ message: 'Not found' })
    res.json(app)
  }
)

router.delete('/:id', auth, async (req, res) => {
  await JobApplication.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
