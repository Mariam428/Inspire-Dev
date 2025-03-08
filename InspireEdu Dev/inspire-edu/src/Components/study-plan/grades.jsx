import { useState } from "react";
import "./Grades.css";

const getGradeClass = (grade) => {
  if (grade >= 8) return "grade-green"; // Light Green
  if (grade >= 6) return "grade-yellow"; // Light Yellow
  return "grade-red"; // Light Red
};

const getSlogan = (grade) => {
  if (grade >= 8) return "Mastering the subject.";
  if (grade >= 6) return "Solid progress, keep improving.";
  return "Focus on the fundamentals.";
};


const courses = [
  { name: "OS", grade: 8 },
  { name: "Compiler Theory", grade: 7 },
  { name: "Computer Networks", grade: 9 },
  { name: "NLP", grade: 6 },
  { name: "Algorithms", grade: 10 },
  { name: "Saad", grade: 5 }
];

export default function Grades() {
  const [weekNumber, setWeekNumber] = useState(6); // Will be updated from backend later

  return (
    <div className="grades-container">
      <h1 className="grades-title">Week {weekNumber} Academic Performance</h1>
      <div className="grades-grid">
        {courses.map((course, index) => (
          <div key={index} className={`grade-card ${getGradeClass(course.grade)}`}>
            <h2 className="course-name">{course.name}</h2>
            <p className="course-grade">{course.grade}/10</p>
            <p className="course-slogan">{getSlogan(course.grade)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
