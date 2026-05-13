require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const Admin = require('../models/Admin')

const USERNAME = 'admin'
const PASSWORD = '123456'
const NAME     = 'Admin User'
const ROLE     = 'Super Admin'

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  const existing = await Admin.findOne({ username: USERNAME })
  if (existing) {
    console.log(`Admin "${USERNAME}" already exists. Updating password...`)
    existing.password = PASSWORD
    await existing.save()
    console.log('Password updated successfully.')
  } else {
    await Admin.create({ username: USERNAME, password: PASSWORD, name: NAME, role: ROLE })
    console.log(`Admin created successfully!`)
    console.log(`  Username: ${USERNAME}`)
    console.log(`  Password: ${PASSWORD}`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

createAdmin().catch(err => { console.error(err); process.exit(1) })
