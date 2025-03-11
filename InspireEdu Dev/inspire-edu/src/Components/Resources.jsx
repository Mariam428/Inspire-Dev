import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Resources.css";

export default function Resources() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const rawCourses = localStorage.getItem("enrolledCourses");
    console.log("🔍 Raw localStorage value:", rawCourses);

    let parsedCourses = [];

    try {
      parsedCourses = JSON.parse(rawCourses) || [];
      console.log("✅ Parsed enrolledCourses:", parsedCourses);
    } catch (error) {
      console.error("❌ Failed to parse enrolledCourses:", error);
    }

    setEnrolledCourses(parsedCourses);
  }, []);

  return (
    <div className="resources-container">
      <h1 className="resources-title">Resources</h1>

      {enrolledCourses.length === 0 ? (
        <p className="text-center text-gray-600 mt-6 text-lg">
          Nothing to show, <span className="font-semibold">Enroll</span> to view Lecture PDFs.
        </p>
      ) : (
        <div className="resources-grid">
          {enrolledCourses.map((course, index) => {
            // Handle both string or object format
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
