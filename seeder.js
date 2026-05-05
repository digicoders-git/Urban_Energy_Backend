require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/database");

// Import models
const User = require("./models/user");
const Blog = require("./models/blog");
const Contact = require("./models/contact");
const Query = require("./models/query");

// Seed data for users
const users = [
  {
    email: "admin@urbanenergy.com",
    password: "$2b$10$wZSH5wPivOPdXnvB8rygx./rrSYYLDJCLinlliFhDGvUDzXFD.LXG"
   // Replace with actual hashed password
  },
  {
    email: "user@urbanenergy.com",
    password: "$2b$10$YourHashedPassword2"
  },
  {
    email: "support@urbanenergy.com",
    password: "$2b$10$YourHashedPassword3"
  },
  {
    email: "editor@urbanenergy.com",
    password: "$2b$10$YourHashedPassword4"
  },
  {
    email: "manager@urbanenergy.com",
    password: "$2b$10$YourHashedPassword5"
  }
];

// Seed data for blogs
  const blogs = [
    {    
      title: "PM Surya Ghar Subsidy Guide 2025 — Complete Walkthrough",
      excerpt: "Everything you need to know about claiming up to ₹78,000 government subsidy under PM Surya Ghar Muft Bijli Yojana. Step-by-step process, documents needed, and timeline.",
      category: "Government Schemes", author: "Admin", 
      views: 4821, readTime: "8 min",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      tags: ["subsidy", "MNRE", "PM Surya Ghar", "government"],
      content: `<h2>What is PM Surya Ghar Muft Bijli Yojana?</h2>
        <p>Launched in February 2024, PM Surya Ghar Muft Bijli Yojana is India's largest rooftop solar scheme. It aims to provide free electricity to 1 crore households and offers a central government subsidy of up to ₹78,000 for installing a 3 kW system.</p>
        <div class="highlight-box"><p>Under this scheme, a family with a 3 kW solar system can get 300 units of free electricity every month — meaning a near-zero electricity bill for 25 years!</p></div>
        <h2>How Much Subsidy Can You Get?</h2>
        <p>The subsidy amount depends on your system size:</p>
        <ul><li><strong>1 kW:</strong> ₹30,000 subsidy</li><li><strong>2 kW:</strong> ₹60,000 subsidy</li><li><strong>3 kW and above:</strong> ₹78,000 (maximum)</li></ul>
        <p>This is the central government subsidy. Many states like Uttar Pradesh, Rajasthan, and Gujarat offer additional state-level subsidies on top of this amount.</p>
        <h2>Documents Required</h2>
        <ul><li>Aadhaar Card (mandatory)</li><li>Recent electricity bill (last 3 months)</li><li>Bank account details (for direct benefit transfer)</li><li>Roof ownership or landlord's NOC</li><li>Passport-size photograph</li></ul>
        <div class="highlight-box"><p>Urban Energy has successfully processed ₹12 crore+ in government subsidies for 5000+ customers. We handle 100% of the paperwork — you just enjoy free electricity!</p></div>`,
    },
    {
      title: "Top 5 Solar Panel Brands in India 2025 — Honest Review",
      excerpt: "We tested and compared the best solar panels available in India. From efficiency ratings to warranty terms — here is what actually matters.",
      category: "Product Reviews", author: "Admin", 
      views: 3104, readTime: "6 min",
      image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1200&q=80",
      tags: ["reviews", "panels", "brands", "efficiency"],
      content: `<h2>How We Evaluated These Panels</h2>
        <p>We assessed each brand across five parameters: efficiency, warranty, price-to-performance, availability of service centres in India, and customer satisfaction scores from our 5000+ installations.</p>
        <h2>The Top 5 Brands</h2>
        <ul><li><strong>Waaree Energies</strong> — India's #1 exporter. Best value for money with 22%+ efficiency mono-PERC panels.</li><li><strong>Adani Solar</strong> — Premium quality with strong after-sales support across India.</li><li><strong>Vikram Solar</strong> — Excellent for commercial projects with high-power TOPCon modules.</li><li><strong>Loom Solar</strong> — Best for small residential (1–3 kW) with affordable bifacial panels.</li><li><strong>Tata Power Solar</strong> — Most trusted brand name with pan-India service network.</li></ul>
        <div class="highlight-box"><p>Our recommendation: For residential 3–5 kW systems in UP, Waaree or Loom Solar offer the best value. For commercial 10 kW+, Adani or Vikram Solar is the clear choice.</p></div>`,
    },
    {
      title: "How Net Metering Works in Uttar Pradesh — Full Guide",
      excerpt: "Net metering lets you sell excess solar power back to UPPCL and earn credits. Here is exactly how it works and how to get connected.",
      category: "Solar Education", author: "Admin", 
      views: 2567, readTime: "7 min",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
      tags: ["net metering", "UPPCL", "UP", "grid"],
      content: `<h2>What is Net Metering?</h2>
        <p>Net metering is a billing mechanism that allows solar panel owners to feed excess electricity back into the grid. You receive credits for every unit exported, which are adjusted against your regular electricity bill.</p>
        <div class="highlight-box"><p>Example: If your solar panels generate 400 units and you use only 300 units, the remaining 100 units go to the UPPCL grid. Your bill shows a credit of 100 units × ₹7.5 = ₹750.</p></div>
        <h2>Net Metering Process in UP</h2>
        <ul><li>Step 1: Submit net metering application to UPPCL through the Urban Energy portal</li><li>Step 2: UPPCL site inspection (typically within 7 days)</li><li>Step 3: Bidirectional meter installation by UPPCL</li><li>Step 4: System energisation and commissioning</li></ul>
        <h2>How Long Does It Take?</h2>
        <p>In urban areas of UP (Lucknow, Kanpur, Agra), the DISCOM typically completes net metering within 15–30 days of application. Rural areas may take 30–45 days.</p>`,
    },
    {
      title: "Solar ROI Calculator — How to Compute Your Exact Savings",
      excerpt: "Learn the exact formula to calculate your solar return on investment, payback period, and 25-year savings. Includes a worked example for a Lucknow household.",
      category: "How-To Guides", author: "Admin", 
      views: 1908, readTime: "5 min",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
      tags: ["calculator", "ROI", "savings", "kW"],
      content: `<h2>The Solar ROI Formula</h2>
        <p>Calculating solar ROI is simpler than you think. You need just three numbers: system cost, annual savings, and subsidy amount.</p>
        <div class="highlight-box"><p>Payback Period = (System Cost – Subsidy) ÷ Annual Savings</p></div>
        <h2>Worked Example — 5 kW System in Lucknow</h2>
        <ul><li>System cost: ₹2,75,000</li><li>Subsidy (40% for 3 kW): ₹78,000</li><li>Net cost: ₹1,97,000</li><li>Monthly savings: ₹4,500 (₹54,000/year)</li><li>Payback period: 1,97,000 ÷ 54,000 = <strong>3.6 years</strong></li><li>25-year savings: ₹54,000 × 25 = <strong>₹13.5 lakhs!</strong></li></ul>`,
    },
    {
      title: "Rajesh's Story — From ₹7,000 Bills to ₹400 With Solar",
      excerpt: "Rajesh Kumar from Lucknow shares his honest experience of going solar with Urban Energy — the process, the savings, and what he wishes he had known earlier.",
      category: "Success Stories", author: "Admin", 
      views: 1650, readTime: "4 min",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      tags: ["success story", "Lucknow", "residential", "savings"],
      content: `<h2>The Problem — ₹7,000 Monthly Bill</h2>
        <p>"Before solar, I was paying ₹6,500 to ₹7,200 every month to UPPCL," says Rajesh Kumar, a teacher from Gomti Nagar, Lucknow. "With 3 ACs running in summer, the bills were destroying my budget."</p>
        <div class="highlight-box"><p>After subsidy, Rajesh paid just ₹1,82,000 for his 6 kW system. His current monthly electricity bill is ₹380–420. Payback in 3.1 years.</p></div>
        <h2>6 Months Later</h2>
        <p>"I've saved ₹38,000 in 6 months. The Urban Energy app shows me real-time production. I genuinely regret not doing this 3 years ago."</p>`,
    },
    {
      title: "5 Signs Your Solar Inverter Needs Servicing Right Now",
      excerpt: "Is your solar system underperforming? These warning signs mean your inverter needs immediate attention. Catch them early to avoid costly breakdowns.",
      category: "How-To Guides", author: "Admin", 
      views: 1320, readTime: "4 min",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
      tags: ["inverter", "maintenance", "AMC", "tips"],
      content: `<h2>Why Inverter Health Matters</h2>
        <p>Your inverter is the brain of your solar system. A faulty inverter can silently reduce your energy generation by 20–40% without triggering any obvious alarm.</p>
        <h2>Warning Signs to Watch For</h2>
        <ul><li><strong>Error codes on display:</strong> Any red light or error code needs immediate attention from a technician.</li><li><strong>Production drop:</strong> If your app shows generation 15%+ lower than usual on a sunny day, the inverter may be throttling.</li><li><strong>Unusual noise:</strong> Clicking or buzzing beyond normal fan noise indicates a hardware issue.</li><li><strong>Overheating:</strong> Inverters should be warm but never too hot to touch.</li><li><strong>Frequent restarts:</strong> If the inverter reboots more than once per week, schedule a service visit immediately.</li></ul>
        <div class="highlight-box"><p>Urban Energy's AMC plan includes quarterly system health checks, remote monitoring alerts, and free inverter servicing.</p></div>`,
    },
    {
      title: "Hybrid vs On-Grid Solar — Which One Should You Choose in 2025?",
      excerpt: "Both systems save money, but one is dramatically better for most Indian households. We break down the difference, costs, and best use case for each.",
      category: "Solar Education", author: "Admin", 
      views: 1180, readTime: "5 min",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
      tags: ["hybrid", "on-grid", "comparison", "battery"],
      content: `<h2>On-Grid Solar</h2>
        <p>On-grid systems connect directly to the DISCOM grid. They are cheaper, simpler, and eligible for full net metering credits. However, they shut down during power cuts for safety reasons.</p>
        <h2>Hybrid Solar</h2>
        <p>Hybrid systems add battery storage. You get power during outages, maximise self-consumption, and reduce grid dependence to near-zero. But they cost 35–50% more than on-grid systems.</p>
        <div class="highlight-box"><p>Our recommendation: If your area has reliable power supply (&lt;2 hours daily cuts), go on-grid. For frequent outages, hybrid is worth every rupee.</p></div>`,
    },
    {
      title: "Solar Panels in Monsoon — What Really Happens?",
      excerpt: "Does solar work during rain? What about cloudy days? We share actual production data from 100 installations across UP during the 2024 monsoon season.",
      category: "Solar Education", author: "Admin", 
      views: 980, readTime: "5 min",
      image: "https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1200&q=80",
      tags: ["monsoon", "weather", "production", "UP"],
      content: `<h2>The Short Answer</h2>
        <p>Yes, solar panels work during monsoon — just at lower output. Based on data from 100 systems we monitor in UP, panels produce 20–35% of their peak output during heavy overcast days.</p>
        <h2>Real Production Data — Lucknow 2024 Monsoon</h2>
        <ul><li>Clear summer days: 5.2–5.8 kWh per kW installed</li><li>Cloudy monsoon days: 1.0–1.8 kWh per kW installed</li><li>Rainy days: 0.6–1.2 kWh per kW installed</li></ul>
        <div class="highlight-box"><p>A 5 kW system in Lucknow generates an average of 6,200 units per year — monsoon months included. Our ROI projections already account for seasonal variation.</p></div>`,
    },
  ];


// Seed data for contacts
const contacts = [
  {
    fullName: "Rajesh Kumar",
    phoneNumber: "9876543210",
    email: "rajesh@email.com",
    city: "Lucknow",
    monthlyBill: 2500,
    message: "Interested in solar installation",
  },
  {
    fullName: "Priya Sharma",
    phoneNumber: "9876543211",
    email: "priya@email.com",
    city: "Delhi",
    monthlyBill: 3200,
    message: "Need consultation for home solar",
  },
  {
    fullName: "Amit Patel",
    phoneNumber: "9876543212",
    email: "amit@email.com",
    city: "Ahmedabad",
    monthlyBill: 4500,
    message: "",
  },
  {
    fullName: "Neha Singh",
    phoneNumber: "9876543213",
    email: "neha@email.com",
    city: "Jaipur",
    monthlyBill: 1800,
    message: "Want subsidy details",
  },
  {
    fullName: "Vikram Desai",
    phoneNumber: "9876543214",
    email: "vikram@email.com",
    city: "Pune",
    monthlyBill: 3900,
    message: "Need maintenance service",
  },
];


// Seed data for queries
const queries = [
  {
    name: "Deepak Gupta",
    phone: "9876543220",
    city: "Lucknow",
    requirement: "5kW solar system cost details",
  },
  {
    name: "Anjali Verma",
    phone: "9876543221",
    city: "Delhi",
    requirement: "Solar panel warranty information",
  },
  {
    name: "Suresh Iyer",
    phone: "9876543222",
    city: "Chennai",
    requirement: "Government subsidy schemes",
  },
  {
    name: "Meera Reddy",
    phone: "9876543223",
    city: "Hyderabad",
    requirement: "Roof space requirement for 10kW system",
  },
  {
    name: "Arjun Nair",
    phone: "9876543224",
    city: "Kochi",
    requirement: "Net metering process details",
  },
];

// Function to seed database
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Contact.deleteMany({});
    await Query.deleteMany({});
    console.log("Cleared existing data");

    // Insert seed data
    await User.insertMany(users);
    console.log("Users seeded:", users.length);

    await Blog.insertMany(blogs);
    console.log("Blogs seeded:", blogs.length);

    await Contact.insertMany(contacts);
    console.log("Contacts seeded:", contacts.length);

    await Query.insertMany(queries);
    console.log("Queries seeded:", queries.length);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
