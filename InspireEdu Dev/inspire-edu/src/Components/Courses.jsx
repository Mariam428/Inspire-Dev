import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Courses.css";

const subjects = [
  { name: "OS", color: "bg-green-100", textColor: "text-green-700", border: "border-green-300" },
  { name: "Compiler", color: "bg-orange-100", textColor: "text-orange-700", border: "border-orange-300" },
  { name: "Computer Networks", color: "bg-red-100", textColor: "text-red-700", border: "border-red-300" },
  { name: "Algorithm Analysis", color: "bg-blue-100", textColor: "text-blue-700", border: "border-blue-300" },
  { name: "NLP", color: "bg-gray-100", textColor: "text-gray-700", border: "border-gray-300" },
  { name: "SAAD", color: "bg-yellow-100", textColor: "text-yellow-700", border: "border-yellow-300" },
];

export default function Courses() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!email) return; // don't fetch if email is missing
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
        alert("Enrolled successfully!");
        const updatedCourses = [...enrolledCourses, data];
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
        {subjects.map((subject, index) => {
          const isEnrolled = enrolledCourses.some((c) => c?.courseId?.name === subject.name);
          return (
            <div key={index} className={`courses-card ${subject.color} ${subject.border}`}>
              <h2 className={`courses-title ${subject.textColor}`}>{subject.name}</h2>
              <button
                onClick={() => handleEnroll(subject.name)}
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

      {/* Display Enrolled Courses Section */}
      <div className="enrolled-courses mt-10">
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
      </div>
    </div>
  );
}
