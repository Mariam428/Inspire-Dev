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

// 🔹 Resource Schema
const ResourceSchema = new mongoose.Schema({
    subject: String,
    lectureNumber: String,
    filePath: String,
    summaryPath: String, // Add this field for storing the summary file path
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

// 🔹 Route to Handle Quiz Generation
app.post("/generate-quiz", upload.single("file"), async (req, res) => {
    console.log("📌 Quiz generation request received!");

    try {
        let { subject, lectureNumber } = req.body;
        console.log("📌 Subject:", subject, "Lecture Number:", lectureNumber);

        if (!req.file) {
            console.error("❌ Error: No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = `uploads/${req.file.filename}`;
        console.log("📌 Uploaded file:", filePath);

        // ✅ Log file details
        const fileStats = fs.statSync(req.file.path);
        console.log("📌 File size:", fileStats.size, "bytes");

        if (fileStats.size === 0) {
            console.error("❌ Error: The uploaded file is empty.");
            return res.status(400).json({ error: "Uploaded file is empty" });
        }

        const quizPath = `uploads/quiz_${req.file.filename}.txt`;
        console.log("📌 Generating quiz...");

        exec(
            `python main.py ${req.file.path} ${quizPath} ${process.env.OPENROUTER_API_KEY} 5`,
            async (error, stdout, stderr) => {
                console.log("📌 Python script output:", stdout);
                console.log("📌 Python script error (if any):", stderr);

                if (error) {
                    console.error("❌ Error generating quiz:", error);
                    return res.status(500).json({ error: "Failed to generate quiz" });
                }

                console.log("✅ Quiz generated successfully!");
                res.json({ message: "Quiz generated successfully!", filePath, quizPath });
            }
        );
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));