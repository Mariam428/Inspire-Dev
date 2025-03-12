import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Classes.css";

export default function Classes() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let coursesData = [];

        if (userRole === "educator") {
          // Fetch all courses
          const response = await fetch("http://localhost:5000/courses");
          const data = await response.json();
          if (response.ok) {
            coursesData = data.map(course => course.name); // Assuming course names are stored under 'name'
          }
        } else {
          // Fetch only enrolled courses from localStorage
          coursesData = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
        }

        console.log("✅ Retrieved courses:", coursesData); // Debug log
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [userRole]);

  return (
    <div className="classes-container">
      <h1 className="classes-title">Lecture Recordings</h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600 mt-6 text-lg">
          Nothing to show,{" "}
          <span className="font-semibold">
            {userRole === "educator" ? "Add" : "Enroll"}
          </span>{" "}
          to view Course Videos.
        </p>
      ) : (
        <div className="classes-grid">
          {courses.map((course, index) => (
            <button
              key={index}
              className="class-card bg-blue-100 border border-blue-300 hover:bg-blue-200 transition-all"
              onClick={() => navigate(`/videos/${course.replace(/\s+/g, "_")}`)}
            >
              <h2 className="class-title text-blue-700">{course}</h2>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
