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
const pdfParse = require("pdf-parse");

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
    quizPath: String, // Add this field for storing the quiz file path

});
const Resource = mongoose.model("Resource", ResourceSchema);

//for plan_v0 python script
// 🔹 Route to Run Python Study Plan Script
//
//
//
//
//
// const express = require("express");

// const cors = require("cors");
// const fs = require("fs");
// const { exec } = require("child_process");
// const path = require("path");
// 🔹 Course Schema
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  textColor: { type: String, required: true },
  borderColor: { type: String, required: true }
});

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;
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

// 🔹 API to Add a New Course
const colors = [
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" }
];

app.post("/courses", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Course name is required" });
  }

  try {
    const courseExists = await Course.findOne({ name });
    if (courseExists) {
      return res.status(400).json({ error: "Course already exists" });
    }

    // Get the index for the new course based on the number of existing courses
    const totalCourses = await Course.countDocuments();
    const index = totalCourses % colors.length; // Loop through colors

    const newCourse = new Course({
      name,
      color: colors[index].bg,
      textColor: colors[index].text,
      borderColor: colors[index].border
    });

    await newCourse.save();
    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: "Failed to add course" });
  }
});


// 🔹 API to Delete a Course by Name
app.delete("/courses/:name", async (req, res) => {
  const { name } = req.params;

  try {
      const deletedCourse = await Course.findOneAndDelete({ name });
      if (!deletedCourse) {
          return res.status(404).json({ error: "Course not found" });
      }
      res.json({ message: "Course deleted successfully" });
  } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
  }
});

// 🔹 API to Get All Courses
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
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

              // Generate quiz using the Python script
            const quizPath = `uploads/quiz_${req.file.filename}.pdf`;
            exec(
                `python generate_quiz.py ${req.file.path} ${quizPath}`,
                async (quizError, quizStdout, quizStderr) => {
                    if (quizError) {
                        console.error("Error generating quiz:", quizError);
                        return res.status(500).json({ error: "Failed to generate quiz" });
                    }

                    // Update the resource with the quiz path
                    newResource.quizPath = `/${quizPath}`; // Save the quiz path
                    await newResource.save(); // Save the updated resource to the database

                    res.json({
                        message: "File uploaded, summary, and quiz generated successfully!",
                        filePath,
                        summaryPath,
                        quizPath,
                    });
                }
            );
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


const { ConnectionPoolClosedEvent } = require("mongodb");
// 🔹 Route to Fetch Quiz Questions from PDF
const { PdfReader } = require("pdfreader");

app.get("/quiz-questions", async (req, res) => {
  try {
      const { subject, lectureNumber } = req.query;

      if (!subject || !lectureNumber) {
          return res.status(400).json({ error: "Subject and lecture number are required" });
      }

      // Normalize subject and lecture number
      const formattedSubject = subject.trim().toUpperCase();
      const formattedLecture = !isNaN(lectureNumber)
          ? `LECTURE ${lectureNumber}`
          : lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");

      // Fetch the resource to get the quiz path
      const resource = await Resource.findOne({ subject: formattedSubject, lectureNumber: formattedLecture });
      if (!resource || !resource.quizPath) {
          return res.status(404).json({ error: "Quiz not found for this lecture" });
      }

      // Read and parse the PDF
      const quizPath = path.join(__dirname, resource.quizPath);
      console.log("Quiz Path:", quizPath); // Log the quiz path

      if (!fs.existsSync(quizPath)) {
          console.error("Quiz file does not exist:", quizPath);
          return res.status(404).json({ error: "Quiz file not found" });
      }

      const dataBuffer = fs.readFileSync(quizPath);
      const pdfData = await pdfParse(dataBuffer);
      const pdfText = pdfData.text;

      // Extract questions and options
      const questionBlocks = pdfText.split("---"); // Split by the separator
      const questions = [];

      questionBlocks.forEach((block) => {
          const lines = block.split("\n").map((line) => line.trim()).filter((line) => line !== "");
          if (lines.length === 0) return;

          // Extract question number and text
          const questionLine = lines[0];
          const questionNumberMatch = questionLine.match(/(\d+)\./);
          if (!questionNumberMatch) return;

          const questionText = questionLine.replace(questionNumberMatch[0], "").trim();

          // Extract options
          const options = [];
          let correctAnswer = null;

          for (let i = 1; i < lines.length; i++) {
              if (lines[i].match(/^[A-D]\)/)) { // Match options like "A)", "B)", etc.
                  options.push(lines[i]);
              } else if (lines[i].startsWith("**Answer:**")) {
                  // Extract the correct answer
                  correctAnswer = lines[i].replace("**Answer:**", "").trim();
              }
          }

          // Add the question to the list
          questions.push({
              question: questionText,
              options: options,
              correctAnswer: correctAnswer, // Include the correct answer
          });
      });

      res.json(questions);
  } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ error: "Failed to fetch quiz questions" });
  }
});

app.post("/submit-quiz", async (req, res) => {
  try {
      const { userAnswers, subject, lectureNumber } = req.body;

      // Normalize subject and lecture number
      const formattedSubject = subject.trim().toUpperCase();
      const formattedLecture = !isNaN(lectureNumber)
          ? `LECTURE ${lectureNumber}`
          : lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");

      // Fetch the resource to get the quiz path
      const resource = await Resource.findOne({ subject: formattedSubject, lectureNumber: formattedLecture });
      if (!resource || !resource.quizPath) {
          return res.status(404).json({ error: "Quiz not found for this lecture" });
      }

      const quizPath = path.join(__dirname, resource.quizPath);

      // Read and parse the PDF
      const dataBuffer = fs.readFileSync(quizPath);
      const pdfData = await pdfParse(dataBuffer);
      const pdfText = pdfData.text;

      // Extract questions and correct answers
      const questionBlocks = pdfText.split("---"); // Split by the separator
      let correctAnswers = {};

      questionBlocks.forEach((block) => {
          const lines = block.split("\n").map((line) => line.trim()).filter((line) => line !== "");
          if (lines.length === 0) return;

          // Extract question number and text
          const questionLine = lines[0];
          const questionNumberMatch = questionLine.match(/(\d+)\./);
          if (!questionNumberMatch) return;

          const questionNumber = questionNumberMatch[1];
          /*console.log("questionNumber:");
          console.log(questionNumber);*/
          const questionText = questionLine.replace(questionNumberMatch[0], "").trim();

          // Extract options and correct answer
          const options = [];
          let correctAnswer = null;

          for (let i = 1; i < lines.length; i++) {
              if (lines[i].match(/^[A-D]\)/)) { // Match options like "A)", "B)", etc.
                  options.push(lines[i]);
              } else if (lines[i].startsWith("**Answer:**")) {
                  // Extract the correct answer
                  correctAnswer = lines[i].replace("**Answer:**", "").trim();
              }
          }
  

          // Store the correct answer
          correctAnswers[questionNumber-1] = {
              question: questionText,
              options: options,
              correctAnswer: correctAnswer,
          };

      });

      // Compare user answers with correct answers
      let score = 0;
      Object.keys(userAnswers).forEach((questionIndex) => {
          const userAnswer = userAnswers[questionIndex];
          const correctAnswerData = correctAnswers[questionIndex]; // Question numbers start from 1
          /*console.log("question index:");
          console.log(questionIndex);
          console.log("user answer:");
          console.log(userAnswer);
          console.log("correct answer data:");
          console.log(correctAnswerData);*/


          if (correctAnswerData && userAnswer === correctAnswerData.correctAnswer) {
              score++;
          }
      });

      res.json({ score, total: Object.keys(correctAnswers).length });
  } catch (error) {
      console.error("Error processing quiz:", error);
      res.status(500).json({ error: "Failed to process the quiz" });
  }
});
// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));