import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Courses.css";

export default function Courses() {
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState([]); // Fetch from DB
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const email = localStorage.getItem("email");

  // 🔹 Fetch Available Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/courses");
        const data = await response.json();
        if (response.ok) {
          setAvailableCourses(data);
        } else {
          console.error("Failed to fetch courses:", data.error);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // 🔹 Fetch Enrolled Courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!email) return; // Don't fetch if email is missing
      try {
        const response = await fetch(`http://localhost:5000/enrollments/${email}`);
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setEnrolledCourses(data);
          localStorage.setItem("enrolledCourses", JSON.stringify(data.map((course) => course?.courseId)));
        } else {
          console.error("Failed to fetch enrolled courses:", data.error);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [email]);

  // 🔹 Handle Enrollment
  const handleEnroll = async (selectedCourse) => {
    const confirmEnroll = window.confirm(`Are you sure you want to enroll in ${selectedCourse}?`);
    if (!confirmEnroll) return;

    try {
      const response = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: email,
          courseId: selectedCourse,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedCourses = [...enrolledCourses, { courseId: selectedCourse }];
        setEnrolledCourses(updatedCourses);
        const courseNames = updatedCourses.map((course) => course?.courseId);
        localStorage.setItem("enrolledCourses", JSON.stringify(courseNames));
      } else {
        alert("Enrollment failed: " + data.error);
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="courses-container">
      <h1 className="courses-title">Available Courses</h1>

      <div className="courses-grid">
        {availableCourses.map((course, index) => {
          const isEnrolled = enrolledCourses.some((c) => c?.courseId === course.name);
          return (
            <div key={index} className={`courses-card ${course.color} ${course.borderColor}`}>
              <h2 className={`courses-title ${course.textColor}`}>{course.name}</h2>
              <button
                onClick={() => handleEnroll(course.name)}
                disabled={isEnrolled}
                className={`enroll-btn ${
                  isEnrolled ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
                } px-4 py-2 rounded mt-2`}
              >
                {isEnrolled ? "Enrolled" : "Enroll"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 🔹 Display Enrolled Courses Section */}
      {/* <div className="enrolled-courses mt-10">
        <h2 className="text-xl font-semibold mb-2">Your Enrolled Courses:</h2>
        {enrolledCourses.length > 0 ? (
          <ul className="list-disc list-inside">
            {enrolledCourses.map((course, idx) => (
              <li key={idx} className="text-gray-800">
                {course?.courseId || "Unnamed Course"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
        )}
      </div> */}
    </div>
  );
}
