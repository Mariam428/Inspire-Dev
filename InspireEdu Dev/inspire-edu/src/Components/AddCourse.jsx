import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddCourse.css";

const colors = ["bg-green-100", "bg-orange-100", "bg-red-100", "bg-gray-100", "bg-yellow-100"];
const textColors = ["text-green-700", "text-orange-700", "text-red-700", "text-gray-700", "text-yellow-700"];
const borderColors = ["border-green-300", "border-orange-300", "border-red-300", "border-gray-300", "border-yellow-300"];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/courses", { name: newCourseName });
      const newCourse = response.data.course;
      
      // Assign color dynamically (Loop through colors)
      const index = courses.length % colors.length;
      newCourse.color = colors[index];
      newCourse.textColor = textColors[index];
      newCourse.border = borderColors[index];

      setCourses([...courses, newCourse]);
      setNewCourseName("");
      setShowPopup(false);
    } catch (error) {
      console.error("Error adding course:", error);
      setUploadMessage("Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseName) => {
    try {
      await axios.delete(`http://localhost:5000/courses/${courseName}`);
      setCourses(courses.filter(course => course.name !== courseName));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="courses-container">
      <h1 className="courses-title">Courses</h1>

      <div className="courses-grid">
      {courses.length > 0 && courses.map((course, index) => (
        <div key={index} className={`courses-card ${course.color} ${course.borderColor}`}>
          <h2 className={`courses-title ${course.textColor}`}>{course.name}</h2>
          <button className="delete-btn" onClick={() => handleDeleteCourse(course.name)}>❌</button>
        </div>
      ))}


        {/* Add Course Button */}
        <div className="add-course" onClick={() => setShowPopup(true)}>
          <img src="/icons/plus.png" alt="Add Course" />
        </div>
      </div>

      {/* Add Course Popup */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <h3>Add Course</h3>
            <form onSubmit={handleAddCourse}>
              <label>Name:</label>
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                required
              />

              <div className="popup-buttons">
                <button type="submit" className="upload-btn">Add</button>
                <button type="button" className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
            {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
