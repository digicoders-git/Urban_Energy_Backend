const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {   // excerpt ko description me map karenge
    type: String
  },
  image: {
    type: String
  },
  category: {
    type: String
  },
  tags: [
    {
      type: String
    }
  ],
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  
},
 { timestamps: true } 
);

module.exports = mongoose.model("Blog", blogSchema);