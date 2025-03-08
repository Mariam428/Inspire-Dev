require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

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
