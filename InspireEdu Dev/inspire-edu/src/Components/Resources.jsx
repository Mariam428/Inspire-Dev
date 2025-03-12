import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Resources.css";

export default function Resources() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role"); // Get user role
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let coursesData = [];

        if (userRole === "educator") {
          // Fetch all courses if the user is an educator
          const response = await fetch("http://localhost:5000/courses"); // Adjust API URL
          const data = await response.json();

          if (response.ok) {
            coursesData = data.map(course => course.name); // Assuming courses have a 'name' field
          }
        } else {
          // Fetch only enrolled courses from localStorage
          const rawCourses = localStorage.getItem("enrolledCourses");
          console.log("🔍 Raw localStorage value:", rawCourses);

          try {
            coursesData = JSON.parse(rawCourses) || [];
          } catch (error) {
            console.error("❌ Failed to parse enrolledCourses:", error);
          }
        }

        console.log("✅ Retrieved courses:", coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [userRole]);

  return (
    <div className="resources-container">
      <h1 className="resources-title">Resources</h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600 mt-6 text-lg">
          Nothing to show,{" "}
          <span className="font-semibold">
            {userRole === "educator" ? "Add" : "Enroll"}
          </span>{" "}
          to view Lecture PDFs.
        </p>
      ) : (
        <div className="resources-grid">
          {courses.map((course, index) => {
            const courseName = typeof course === "string" ? course : course?.courseId || "Unnamed Course";

            return (
              <button
                key={index}
                className="resource-card bg-blue-100 border border-blue-300 hover:bg-blue-200 transition-all"
                onClick={() => navigate(`/lectures/${courseName.replace(/\s+/g, "_")}`)}
              >
                <h2 className="resource-title text-blue-700">{courseName}</h2>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
