require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      /^http:\/\/localhost:\d+$/,
      'https://urban-energy-admin-panel.vercel.app',
      'https://urban-energy-website.vercel.app',
    ]
    if (!origin || allowed.some(r => typeof r === 'string' ? r === origin : r.test(origin))) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))
app.use('/api/referrals', require('./routes/referrals'))
app.use('/api/referrers', require('./routes/referrers'))
app.use('/api/queries', require('./routes/queries'))
app.use('/api/blogs', require('./routes/blogs'))
app.use('/api/partners', require('./routes/partners'))
app.use('/api/quotes', require('./routes/quotes'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/applications', require('./routes/applications'))

app.get('/', (req, res) => res.json({ message: 'Urban Energy API running' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1) })
