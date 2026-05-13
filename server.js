require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    // Allow all localhost ports + no origin (Postman, curl)
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))
app.use('/api/queries',  require('./routes/queries'))
app.use('/api/blogs',    require('./routes/blogs'))
app.use('/api/partners', require('./routes/partners'))
app.use('/api/quotes',   require('./routes/quotes'))
app.use('/api/reviews',  require('./routes/reviews'))
app.use('/api/dashboard',     require('./routes/dashboard'))
app.use('/api/notifications', require('./routes/notifications'))

app.get('/', (req, res) => res.json({ message: 'Urban Energy API running' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1) })
