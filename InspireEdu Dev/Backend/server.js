require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// 🔹 User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "educator"], required: true }
});
const User = mongoose.model("User", UserSchema);
//enrollement schema
const CourseEnrollmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});
const CourseEnrollment = mongoose.model("CourseEnrollment", CourseEnrollmentSchema);
module.exports = CourseEnrollment;

  
  
  
//Enrollement API
app.post("/enroll", async (req, res) => {
    const { userId, courseId } = req.body;
  
    try {
      const newEnrollment = new CourseEnrollment({ userId, courseId });
      await newEnrollment.save();
      res.status(201).json({ message: "Enrolled successfully" }); // Add a success response
    } catch (error) {
      res.status(500).json({ error: "Failed to enroll" }); // Handle error gracefully
    }
  });
  
  //GET enrolled courses API
  
app.get("/enrollments/:userId", async (req, res) => {
    const userId = req.params.userId; // ⬅️ gets the userId from the URL
  
    try {
      const enrollments = await CourseEnrollment.find({ userId }); // ⬅️ query MongoDB
      res.json(enrollments); // ⬅️ return the list of enrolled courses
    } catch (error) {
      res.status(500).json({ error: "Failed to get enrollments" });
    }
  });
  


// 🔹 Resource Schema
const ResourceSchema = new mongoose.Schema({
    subject: String,
    lectureNumber: String,
    filePath: String,
    summaryPath: String, // Add this field for storing the summary file path
});
const Resource = mongoose.model("Resource", ResourceSchema);

//for plan_v0 python script
// 🔹 Route to Run Python Study Plan Script
//
//
//
//
//
const express = require("express");

const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

app.use(cors());
app.use(express.json());

app.post("/generate", (req, res) => {
  const { availability, grades } = req.body;

  console.log("✅ POST /generate was hit!");
  console.log("📥 Received availability:", availability);
  console.log("📥 Received grades:", grades);

  // Save availability and grades as temp JSON files
  fs.writeFileSync("temp_availability.json", JSON.stringify(availability));
  fs.writeFileSync("temp_grades.json", JSON.stringify(grades));

  const pythonScriptPath = path.join(__dirname, "plan_v0.py");

  // Execute the Python script
  exec(`python "${pythonScriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python script error:", error);
      return res.status(500).json({ error: "Failed to generate plan" });
    }

    console.log("🐍 Python script executed successfully");
    console.log("📤 Python output:", stdout);

    try {
      const scheduleData = JSON.parse(stdout); // Parse Python script output
      res.json({ message: "Plan generated successfully ✅", scheduleData });
    } catch (parseErr) {
      console.error("❌ Failed to parse Python output:", parseErr);
      res.status(500).json({ error: "Invalid output from Python script" });
    }
  });
});


  

// 🔹 Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});
const upload = multer({ storage });

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

// 🔹 Route to Handle Resource Upload and Summarization
app.post("/upload-resource", upload.single("file"), async (req, res) => {
    try {
        let { subject, lectureNumber } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Normalize subject and lecture number
        subject = subject.trim().toUpperCase();
        lectureNumber = !isNaN(lectureNumber)
            ? `LECTURE ${lectureNumber}`
            : lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");

        const filePath = `/uploads/${req.file.filename}`;

        // Save the resource to the database
        const newResource = new Resource({ subject, lectureNumber, filePath });
        await newResource.save();

        // Generate summary using the Python script
        const summaryPath = `uploads/summary_${req.file.filename}.pdf`;
        exec(
            `python summarize.py ${req.file.path} ${summaryPath}`,
            async (error, stdout, stderr) => {
                if (error) {
                    console.error("Error generating summary:", error);
                    return res.status(500).json({ error: "Failed to generate summary" });
                }

                // Update the resource with the summary path
                newResource.summaryPath = `/${summaryPath}`;
                await newResource.save();

                res.json({ message: "File uploaded and summary generated successfully!", filePath, summaryPath });
            }
        );
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

// 🔹 Route to Fetch Resources for a Lecture
app.get("/resources/:subject/:lectureNumber", async (req, res) => {
    try {
        let { subject, lectureNumber } = req.params;

        subject = subject.trim().toUpperCase();
        lectureNumber = !isNaN(lectureNumber)
            ? `LECTURE ${lectureNumber}`
            : lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");

        const resources = await Resource.find({ subject, lectureNumber });
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
        subject = subject.trim().toUpperCase();

        const lectures = await Resource.find({ subject }).select("lectureNumber -_id");
        const uniqueLectures = [...new Set(lectures.map(l => l.lectureNumber))]; // Remove duplicates

        res.json(uniqueLectures);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch lectures" });
    }
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));