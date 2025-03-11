import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Classes.css";

export default function Classes() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
    console.log("✅ Enrolled courses from localStorage:", courses); // 👈 Debug log
    setEnrolledCourses(courses);
  }, []);
  
  return (
    <div className="classes-container">
      <h1 className="classes-title">Lecture Recordings</h1>

      {enrolledCourses.length === 0 ? (
        <p className="text-center text-gray-600 mt-6 text-lg">
          Nothing to show, <span className="font-semibold">Enroll</span> to view Course Videos.
        </p>
      ) : (
        <div className="classes-grid">
          {enrolledCourses.map((course, index) => {
            const courseName = course || "Unknown Course";
            return (
              <button
                key={index}
                className="class-card bg-blue-100 border border-blue-300 hover:bg-blue-200 transition-all"
                onClick={() => navigate(`/videos/${courseName.replace(/\s+/g, "_")}`)}
              >
                <h2 className="class-title text-blue-700">{courseName}</h2>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
