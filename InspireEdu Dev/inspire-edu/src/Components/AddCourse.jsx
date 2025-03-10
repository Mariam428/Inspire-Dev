import React from "react";
import { useNavigate } from "react-router-dom";
import "./AddCourse.css";

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

  return (
    <div className="courses-container">
      <h1 className="courses-title">Courses</h1>
      <div className="courses-grid">
        {subjects.map((subject, index) => (
          <div
            key={index}
            className={`courses-card ${subject.color} ${subject.border}`}
          >
            <h2 className={`courses-title ${subject.textColor}`}>{subject.name}</h2>
          </div>
        ))}
        <div className="add-course">
            <img src="/icons/plus.png" alt="" />
        </div>
      </div>
    </div>
  );
}
