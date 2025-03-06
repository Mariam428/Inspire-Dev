import React from "react";
import { useParams } from "react-router-dom";
import "./LectureContent.css"; // Ensure CSS file is linked

const lectureResources = [
  { title: "Lecture PDF", icon: "📄", type: "pdf" },
  { title: "Quiz", icon: "📝", type: "quiz" },
  { title: "Summary", icon: "📖", type: "summary" },
];

export default function LectureContent() {
  const { subjectName, lectureName } = useParams();

  return (
    <div className="lecture-content-container">
      <h1 className="lecture-title">{lectureName}</h1>
      <div className="lecture-resources-grid">
        {lectureResources.map((resource, index) => (
          <button key={index} className="resource-card">
            <span className="resource-icon">{resource.icon}</span>
            <span className="resource-title">{resource.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
