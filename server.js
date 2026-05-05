const express = require("express");
require("dotenv").config();
const cors = require("cors");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes"); 
const blogRoutes = require("./routes/blogroute");
const contactRoutes = require("./routes/contactroute");
const queryRoutes = require("./routes/queryroute");
const app = express();

app.use(express.json());
app.use(cors());

// DB connect
connectDB();

//  All Routes
app.use("/api", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/query", queryRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});