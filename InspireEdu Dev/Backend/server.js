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

// Update the UserSchema to include educatorCourses
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "educator", "administrator"], required: true },
  registrationDate: { type: Date, default: Date.now },
  educatorCourses: [String]
});




const EducatorCourse = require("./EducatorCourse"); // import this at the top

// Update the register endpoint
app.post("/register", async (req, res) => {
  const { name, email, password, role, educatorCourses } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (role === "educator" && (!educatorCourses || !Array.isArray(educatorCourses))) {
    return res.status(400).json({ error: "Educator must select at least one course" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert course IDs to names
    let courseNames = [];
    if (role === "educator") {
      const courses = await Course.find({ _id: { $in: educatorCourses } });
      courseNames = courses.map(course => course.name);
    }

    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      educatorCourses: role === "educator" ? courseNames : []
    });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error, try again later" });
  }
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
// 🔹 Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const videoSchema = new mongoose.Schema({
  course: { type: String, required: true }, 
  lectureNumber: { type: String, required: true },
  videopath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

// Force the collection to be called "classes"
const ClassVideo = mongoose.model("ClassVideo", videoSchema, "classes");

const upload = multer({ storage });
app.post("/upload-video", upload.single("file"), async (req, res) => {
  const { subject, lectureNumber} = req.body;
  const filePath =  `/uploads/${req.file.filename}`;

  if (!subject || !filePath) {
    return res.status(400).json({ error: "Course and file are required." });
  }

  try {
    const newVideo = new ClassVideo({
      course: subject,
      videopath: filePath,
      lectureNumber
    });

    await newVideo.save();
    res.json({ message: "Video uploaded and saved to DB!" });
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json({ error: "Failed to upload video." });
  }
});

app.get("/classes/:course", async (req, res) => {
  try {
    const videos = await ClassVideo.find({ course: req.params.course });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch videos." });
  }
});


const courseSchema = new mongoose.Schema({
  name: String,
  code: String,
  educators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 🔥 New field
});

module.exports = mongoose.model("Course", courseSchema);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
app.use(cors());
app.use(express.json());
//PLAAAAN//

// ✅ Define StudySession schema first
const studySessionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  hours: { type: Number, required: true },
  details: { type: [String], default: [] },
});

// ✅ Define WeeklyPlan schema next
const weeklyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weekNumber: { type: Number, required: true },
  studyPlan: {
    type: Map,
    of: [studySessionSchema],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Create the model
const WeeklyStudyPlan = mongoose.model("WeeklyStudyPlan", weeklyPlanSchema);

// ✅ Generate study plan route
app.post("/generate", async (req, res) => {
  const { availability, grades, weekNumber, userId } = req.body;

  console.log("✅ POST /generate was hit!");
  console.log("📥 Received weekNumber:", weekNumber);

  // Save availability and grades as temp JSON files
  fs.writeFileSync("temp_availability.json", JSON.stringify(availability));
  fs.writeFileSync("temp_grades.json", JSON.stringify({ scores: grades.scores }));

  fs.writeFileSync("temp_weeknumber.json", JSON.stringify({ weekNumber }));

  //const pythonScriptPath = path.join(__dirname, "plan_v0.py");

  exec('python "plan_v0.py"', async (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python script error:", error);
      return res.status(500).json({ error: "Failed to generate plan" });
    }

    console.log("🐍 Python script executed successfully");
    console.log("📤 Python output:", stdout);

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(stdout.trim());
    } catch (e) {
      console.error("❌ Failed to parse Python output as JSON:", e);
      return res.status(500).json({ error: "Invalid output from Python script" });
    }

    try {
      // ✅ Check if plan exists → Update if exists, else create new (Upsert logic)
      const existingPlan = await WeeklyStudyPlan.findOne({
        userId: userId,
        weekNumber: weekNumber,
      });

      if (existingPlan) {
        existingPlan.studyPlan = parsedOutput;
        existingPlan.updatedAt = new Date();
        await existingPlan.save();
        console.log("🔄 Existing plan updated in DB");
      } else {
        const newPlan = new WeeklyStudyPlan({
          userId: userId,
          weekNumber: weekNumber,
          studyPlan: parsedOutput,
        });
        await newPlan.save();
        console.log("✅ New plan saved to DB");
      }

      // ✅ Send structured response
      res.json({
        message: "Study plan generated and saved successfully!",
        scheduleData: parsedOutput,
      });
    } catch (dbErr) {
      console.error("❌ DB Save/Update Error:", dbErr);
      return res.status(500).json({ error: "Failed to save/update study plan in DB" });
    }
  });
});
//GENERIC PLAN
// ✅ Generate study plan route
app.post("/generic", async (req, res) => {
  const { availability, enrollments, userId, weekNumber } = req.body;

  console.log("✅ POST /generic was hit!");
  

  // Save availability and grades as temp JSON files
  fs.writeFileSync("temp_availability.json", JSON.stringify(availability));
  fs.writeFileSync("temp_enrolled.json", JSON.stringify({ enrolledCourses: enrollments }));


  

  //const pythonScriptPath = path.join(__dirname, "plan_v0.py");

  exec('python "plan_generic.py"', async (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Python script error:", error);
      return res.status(500).json({ error: "Failed to generate plan" });
    }

    console.log("🐍 Python script executed successfully");
    console.log("📤 Python output:", stdout);

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(stdout.trim());
    } catch (e) {
      console.error("❌ Failed to parse Python output as JSON:", e);
      return res.status(500).json({ error: "Invalid output from Python script" });
    }

    try {
      // ✅ Check if plan exists → Update if exists, else create new (Upsert logic)
      const existingPlan = await WeeklyStudyPlan.findOne({
        userId: userId,
        weekNumber: weekNumber,
      });

      if (existingPlan) {
        existingPlan.studyPlan = parsedOutput;
        existingPlan.updatedAt = new Date();
        await existingPlan.save();
        console.log("🔄 Existing plan updated in DB");
      } else {
        const newPlan = new WeeklyStudyPlan({
          userId: userId,
          weekNumber: weekNumber,
          studyPlan: parsedOutput,
        });
        await newPlan.save();
        console.log("✅ New plan saved to DB");
      }

      // ✅ Send structured response
      res.json({
        message: "Study plan generated and saved successfully!",
        scheduleData: parsedOutput,
      });
    } catch (dbErr) {
      console.error("❌ DB Save/Update Error:", dbErr);
      return res.status(500).json({ error: "Failed to save/update study plan in DB" });
    }
  });
});

// Export app or start server if needed
//module.exports = app;
app.get("/plan", async (req, res) => {
  const { userId, weekNumber } = req.query;

  try {
    const plan = await WeeklyStudyPlan.findOne({ userId, weekNumber });

    if (!plan) {
      return res.status(200).json({ 
        message: "No plan found for this week", 
        studyPlan: {} 
      });
    }

    res.status(200).json({
      message: "Study plan fetched successfully",
      studyPlan: plan.studyPlan,
    });
  } catch (err) {
    console.error("❌ Error fetching plan:", err);
    res.status(500).json({ message: "Server error while fetching plan" });
  }
});





// 🔹 Configure Multer for File Uploads
/*const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});*/
//const upload = multer({ storage });

// 🔹 Get Courses Assigned to Educator by Email
// Get educator's courses by email
app.get("/educator-courses/:email", async (req, res) => {
  try {
    const educator = await User.findOne({ 
      email: req.params.email,
      role: "educator" 
    });
    
    if (!educator) {
      return res.status(404).json({ error: "Educator not found" });
    }

    res.json({ courses: educator.educatorCourses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch educator courses" });
  }
});


app.post("/register", async (req, res) => {
  const { name, email, password, role, courses } = req.body;

  if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
  }

  try {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
          name,
          email,
          password: hashedPassword,
          role,
          educatorCourses: role === "educator" ? courses : [], // Add this line
      });

      await newUser.save();

      res.json({ message: "User registered successfully" });
  } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error, try again later" });
  }
});


// 🔹 Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send user info including email (needed by frontend to detect admin)
    res.json({
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      registrationDate: user.registrationDate
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
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
      const summaryPath = `uploads/summary_${req.file.filename}`;
      exec(
          `python summarize.py ${req.file.path} ${summaryPath}`,
          async (error, stdout, stderr) => {
              if (error) {
                  console.error("Error generating summary:", error);
                  return res.status(500).json({ error: "Failed to generate summary" });
              }

              // Update the resource with the summary path
              newResource.summaryPath = `/${summaryPath}`;

              // Modify the summaryPath to have a .html extension before saving it to the database
              const modifiedSummaryPath = newResource.summaryPath.replace(".pdf", ".html");
              newResource.summaryPath = modifiedSummaryPath;

              // Save the updated resource with the modified summary path
              await newResource.save();

              // Generate quiz using the Python script
              const quizPath = `uploads/quiz_${req.file.filename}`;
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
                          summaryPath: modifiedSummaryPath, // Return the modified summary path
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
// 🔸 Mongoose Schemas
const SubmittedQuizSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  lectureNumber: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  submissionDate: { type: Date, default: Date.now },
  userAnswers: { type: Object, required: true },// 💡 Store as key-value pairs
  
});
SubmittedQuizSchema.index({ userId: 1, subject: 1, lectureNumber: 1 }, { unique: true });
const SubmittedQuiz = mongoose.model("SubmittedQuiz", SubmittedQuizSchema);
//for plan generation
const QuizScoreSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  weekNumber: { type: String, required: true },
  scores: { type: mongoose.Schema.Types.Mixed, required: true }

});
QuizScoreSchema.index({ userId: 1, weekNumber: 1 }, { unique: true });
const QuizScore = mongoose.model("QuizScore", QuizScoreSchema);



// 🔹 /quiz-questions route
app.get("/quiz-questions", async (req, res) => {
  try {
    const { subject, lectureNumber, userId } = req.query;
    if (!subject || !lectureNumber || !userId) {
      return res.status(400).json({ error: "Missing subject, lectureNumber, or userId" });
    }

    const formattedSubject = subject.trim().toUpperCase();
    const formattedLecture = !isNaN(lectureNumber)
      ? `LECTURE ${lectureNumber}`
      : lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");

 // ✅ Check if already submitted
const existingSubmission = await SubmittedQuiz.findOne({
  userId,
  subject: formattedSubject,
  lectureNumber: formattedLecture,
});

if (existingSubmission) {
  return res.status(409).json({
    message: "Quiz already submitted for this lecture by this user.",
    alreadySubmitted: true,
    score: existingSubmission.score,
    total: existingSubmission.total,
  });
}


    // // ✅ Pre-save submission record
    // const newSubmission = new SubmittedQuiz({
    //   userId,
    //   subject: formattedSubject,
    //   lectureNumber: formattedLecture,
    // });
    // await newSubmission.save();

    // ✅ Fetch quiz PDF
    const resource = await Resource.findOne({
      subject: formattedSubject,
      lectureNumber: formattedLecture,
    });

    if (!resource || !resource.quizPath) {
      return res.status(404).json({ error: "Quiz not found for this lecture." });
    }

    const quizPath = path.join(__dirname, resource.quizPath);
    const dataBuffer = fs.readFileSync(quizPath);
    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData || !pdfData.text) {
      return res.status(500).json({ error: "Failed to extract text from quiz PDF." });
    }

    // ✅ Extract questions
    const questionBlocks = pdfData.text.split("---");
    const quizQuestions = [];

    questionBlocks.forEach((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const questionLine = lines[0];
      const questionNumberMatch = questionLine.match(/(\d+)\./);
      if (!questionNumberMatch) return;

      const questionText = questionLine.replace(questionNumberMatch[0], "").trim();
      const options = lines.slice(1).filter((line) => /^[A-D]\)/.test(line));

      quizQuestions.push({
        question: questionText,
        options,
      });
    });

    return res.json(quizQuestions);
  } catch (error) {
    console.error("❌ Error fetching quiz questions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 /submit-quiz route
app.post("/submit-quiz", async (req, res) => {
  try {
    const { userAnswers, subject, lectureNumber, userId, weekNumber } = req.body;
    console.log("✅ Received quiz submission:", req.body);

    if (!userId || !weekNumber || !subject || !userAnswers) {
      return res.status(400).json({ error: "Missing required fields in submission." });
    }

    const formattedSubject = subject.trim().toUpperCase();
    const formattedLecture = !isNaN(lectureNumber)
      ? `LECTURE ${lectureNumber}`
      : lectureNumber.trim().replace(/lecture\s*/i, "LECTURE ");

    const resource = await Resource.findOne({
      subject: formattedSubject,
      lectureNumber: formattedLecture,
    });

    if (!resource || !resource.quizPath) {
      return res.status(404).json({ error: "Quiz not found for this lecture." });
    }

    const quizPath = path.join(__dirname, resource.quizPath);
    const dataBuffer = fs.readFileSync(quizPath);
    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData || !pdfData.text) {
      return res.status(500).json({ error: "Failed to extract text from quiz PDF." });
    }

    // ✅ Extract correct answers
    const questionBlocks = pdfData.text.split("---");
    let correctAnswers = {};

    questionBlocks.forEach((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const questionLine = lines[0];
      const questionNumberMatch = questionLine.match(/(\d+)\./);
      if (!questionNumberMatch) return;

      const questionNumber = questionNumberMatch[1];
      const questionText = questionLine.replace(questionNumberMatch[0], "").trim();

      const options = [];
      let correctAnswer = null;

      for (let i = 1; i < lines.length; i++) {
        if (/^[A-D]\)/.test(lines[i])) {
          options.push(lines[i]);
        } else if (lines[i].startsWith("**Answer:**")) {
          correctAnswer = lines[i].replace("**Answer:**", "").trim();
        }
      }

      correctAnswers[questionNumber - 1] = {
        question: questionText,
        options,
        correctAnswer,
      };
    });

    // ✅ Score calculation
    let score = 0;
    Object.keys(userAnswers).forEach((qIndex) => {
      const userAnswer = userAnswers[qIndex];
      const correct = correctAnswers[qIndex];
      if (correct && userAnswer === correct.correctAnswer) score++;
    });

// ✅ Save/update in QuizScore collection (fixed)
let existingScore = await QuizScore.findOne({ userId, weekNumber });

if (existingScore) {
  existingScore.set(`scores.${formattedSubject}`, score);
  await existingScore.save();
} else {
  await new QuizScore({
    userId,
    weekNumber,
    scores: { [formattedSubject]: score },
  }).save();
}

    // ✅ save submission record
    
   
    await new SubmittedQuiz({
      userId,
      subject: formattedSubject,
      lectureNumber: formattedLecture,
      score,
      total: Object.keys(correctAnswers).length,
      submissionDate: new Date(),
      userAnswers
    }).save();

    // ✅ (Optional) Save in temp_grades.json if needed — comment left out for brevity

    return res.json({
      score,
      total: Object.keys(correctAnswers).length,
    });
  } catch (error) {
    console.error("❌ Error processing quiz submission:", error);
    return res.status(500).json({ error: "Failed to process quiz." });
  }
});

app.get("/get-quiz-grades", async (req, res) => {
  try {
    const { userId, weekNumber } = req.query;
    if (!userId || !weekNumber) {
      return res.status(400).json({ error: "userId and weekNumber are required" });
    }

    const quizRecord = await QuizScore.findOne({ userId, weekNumber });

    if (!quizRecord) {
      // ✅ Return empty scores instead of 404
      return res.status(200).json({ scores: {} });
    }

    return res.json({ scores: quizRecord.scores }); // ✅ Directly return scores
  } catch (err) {
    console.error("Error fetching quiz grades:", err);
    return res.status(500).json({ error: "Failed to fetch quiz grades" });
  }
});



// GET all quiz scores for a user across all weeks
app.get("/get-all-scores", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const userScores = await QuizScore.find({ userId });

    // ✔ Return an empty array if no scores found — no error thrown
    const result = (userScores || []).map((entry) => ({
      weekNumber: entry.weekNumber,
      scores: entry.scores,
    }));

    res.status(200).json(result); // always success response
  } catch (error) {
    console.error("Error fetching all scores:", error);
    res.status(500).json({ message: "Server error while fetching scores" });
  }
});




// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));