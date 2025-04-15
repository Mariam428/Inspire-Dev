const mongoose = require("mongoose");

const educatorCourseSchema = new mongoose.Schema({
  educatorEmail: { type: String, required: true },
  courses: [String], // Array of course names
});

module.exports = mongoose.model("EducatorCourse", educatorCourseSchema);
