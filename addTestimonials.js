require('dotenv').config()
const mongoose = require('mongoose')
const Review = require('./models/Review')

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Homeowner, Delhi",
    initials: "RK",
    stars: 5,
    review: "Urban Energy installed solar panels on my rooftop. The service was exceptional and the savings on my electricity bill have been tremendous. Highly recommended!",
    status: "published"
  },
  {
    name: "Priya Sharma",
    role: "Business Owner, Bangalore",
    initials: "PS",
    stars: 5,
    review: "We switched our commercial facility to solar with Urban Energy. The ROI has been fantastic and our carbon footprint is significantly reduced. Excellent team!",
    status: "published"
  },
  {
    name: "Amit Patel",
    role: "Housing Society Manager, Mumbai",
    initials: "AP",
    stars: 5,
    review: "Urban Energy handled our entire housing society solar installation seamlessly. Professional, punctual, and amazing after-sales support. Truly impressed!",
    status: "published"
  },
  {
    name: "Neha Singh",
    role: "Homeowner, Pune",
    initials: "NS",
    stars: 4,
    review: "Great installation process and very helpful team. Solar panels are working perfectly and my bills have dropped significantly. Would definitely recommend!",
    status: "published"
  },
  {
    name: "Vikram Reddy",
    role: "Farm Owner, Hyderabad",
    initials: "VR",
    stars: 5,
    review: "Off-grid solar solution from Urban Energy has transformed our farm operations. Complete energy independence and zero maintenance issues. Best investment ever!",
    status: "published"
  }
]

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✓ MongoDB connected')
    const result = await Review.insertMany(testimonials)
    console.log(`✓ ${result.length} testimonials added successfully`)
    result.forEach(r => console.log(`  - ${r.name} (${r.initials})`))
    mongoose.connection.close()
  })
  .catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
