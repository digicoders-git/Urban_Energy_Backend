const router = require('express').Router()
const auth = require('../middleware/auth')
const Contact = require('../models/Contact')
const Query = require('../models/Query')
const Quote = require('../models/Quote')

router.get('/stats', auth, async (req, res) => {
  const [totalContacts, totalQueries, totalQuotes, converted, chartData] = await Promise.all([
    Contact.countDocuments(),
    Query.countDocuments(),
    Quote.countDocuments(),
    Contact.countDocuments({ status: 'Converted' }),
    getChartData(),
  ])

  res.json({
    totalContacts,
    totalQueries,
    totalQuotes,
    conversions: converted,
    chartData,
  })
})

async function getChartData() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const result = []

  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    const [contacts, queries] = await Promise.all([
      Contact.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Query.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ])

    result.push({ month: months[d.getMonth()], contacts, queries })
  }
  return result
}

router.get('/recent-contacts', auth, async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).limit(5).select('name city bill status')
  res.json(contacts)
})

module.exports = router
