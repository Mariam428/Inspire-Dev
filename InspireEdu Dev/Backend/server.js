require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));


const UserSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["student", "educator"], required: true }
    });
    
const User = mongoose.model("User", UserSchema);
    

// 🔹 Register User API
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error, try again later" });
    }
});


// 🔹 Login API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role });
});



const ResourceSchema = new mongoose.Schema({
    subject: String,
    lectureNumber: String,
    filePath: String,
  });
  const Resource = mongoose.model("Resource", ResourceSchema);
  
  // 🔹 Configure Multer for File Uploads
  const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
  });
  const upload = multer({ storage });
  
 // 🔹 Route to Handle Resource Upload
app.post("/upload-resource", upload.single("file"), async (req, res) => {
  try {
    let { subject, lectureNumber } = req.body;

    // Normalize subject name to uppercase
    subject = subject.trim().toUpperCase();

    // Normalize lecture number
    if (!isNaN(lectureNumber)) {
      lectureNumber = `LECTURE ${lectureNumber}`; // Convert "1" to "LECTURE 1"
    } else {
      lectureNumber = lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");
    }

    const filePath = `/uploads/${req.file.filename}`;

    // Store normalized values
    const newResource = new Resource({ subject, lectureNumber, filePath });
    await newResource.save();

    res.json({ message: "File uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// 🔹 Route to Fetch Resources for a Lecture
app.get("/resources/:subject/:lectureNumber", async (req, res) => {
  try {
      let { subject, lectureNumber } = req.params;

      subject = subject.trim().toUpperCase();
      lectureNumber = isNaN(lectureNumber) 
          ? lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ")
          : `LECTURE ${lectureNumber}`;

      console.log(`Fetching resources for: ${subject}, ${lectureNumber}`);

      const resources = await Resource.find({ subject, lectureNumber });
      
      if (resources.length === 0) {
          console.log("No resources found!");
      } else {
          console.log("Found resources:", resources);
      }

      res.json(resources);
  } catch (error) {
      console.error("Failed to fetch resources", error);
      res.status(500).json({ error: "Failed to fetch resources" });
  }
});



// 🔹 Route to Fetch All Uploaded Lectures in a Subject
app.get("/lectures/:subject", async (req, res) => {
  try {
    let { subject } = req.params;
    
    // Normalize subject name to match stored format
    subject = subject.trim().toUpperCase();

    // Find unique lecture numbers for this subject
    const lectures = await Resource.find({ subject }).select("lectureNumber -_id");
    const uniqueLectures = [...new Set(lectures.map(l => l.lectureNumber))]; // Remove duplicates

    res.json(uniqueLectures); // Return list of unique lectures
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

  
const { exec } = require("child_process");
const fs = require("fs");

// 🔹 Route to Handle Resource Upload and Process Summary
app.post("/upload-resource", upload.single("file"), async (req, res) => {
  try {
    let { subject, lectureNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    subject = subject.trim().toUpperCase(); // ✅ Normalize Subject Name

    if (!isNaN(lectureNumber)) {
      lectureNumber = `Lecture ${lectureNumber}`; // ✅ Convert numbers to "Lecture 1" format
    } else {
      lectureNumber = lectureNumber.trim().replace(/lecture\s*/i, "Lecture ");
    }

    const filePath = `/uploads/${req.file.filename}`;

    console.log(`Saving file: ${filePath}, Subject: ${subject}, Lecture: ${lectureNumber}`); // 🔍 Debugging

    const newResource = new Resource({ subject, lectureNumber, filePath });
    await newResource.save();

    res.json({ message: "File uploaded successfully!", filePath });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});




  // 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const authMiddleware = require("./middleware/authMiddleware");

app.get("/student-dashboard", authMiddleware, (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ error: "Access denied" });
  res.json({ message: "Welcome to the Student Dashboard!" });
});

app.get("/educator-dashboard", authMiddleware, (req, res) => {
  if (req.user.role !== "educator") return res.status(403).json({ error: "Access denied" });
  res.json({ message: "Welcome to the Educator Dashboard!" });
});