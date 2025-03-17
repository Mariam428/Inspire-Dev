import { useEffect, useState } from "react";
import "./Grades.css";


const getGradeClass = (grade) => {
  if (grade >= 8) return "grade-green";
  if (grade >= 6) return "grade-yellow";
  return "grade-red";
};

const getSlogan = (grade) => {
  if (grade >= 8) return "Mastering the subject.";
  if (grade >= 6) return "Solid progress, keep improving.";
  return "Focus on the fundamentals.";
};

export default function Grades() {
  const [weekNumber, setWeekNumber] = useState(null);
  const [grades, setGrades] = useState(null);

  useEffect(() => {
    const storedWeekNumber = parseInt(localStorage.getItem("weekNumber")) || 1;
    setWeekNumber(storedWeekNumber);

    const quizGrades = JSON.parse(localStorage.getItem("quizGrades") || "{}");
    if (quizGrades && quizGrades.scores) {
      const gradesArray = Object.entries(quizGrades.scores).map(([name, grade]) => ({
        name,
        grade,
      }));
      setGrades(gradesArray);
    }
  }, []);

  return (
    <div className="grades-container">
      {/* ✅ Show header only if weekNumber > 1 */}
      {weekNumber > 1 && (
        <h1 className="grades-title">Week {weekNumber - 1} Academic Performance</h1>
      )}

      {/* ✅ If week 1 and no grades yet, show first week message */}
      {weekNumber === 1 ? (
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          Welcome to your first week! Quizz Grades will appear here soon...
        </h2>
        
      ) : grades?.length > 0 ? (
        <div className="grades-grid">
          {grades.map((course, index) => (
            <div key={index} className={`grade-card ${getGradeClass(course.grade)}`}>
              <h2 className="course-name">{course.name}</h2>
              <p className="course-grade">{course.grade}/10</p>
              <p className="course-slogan">{getSlogan(course.grade)}</p>
            </div>
          ))}
        </div>
      ) : (
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          No quizzes submitted yet for this week.
        </h2>
      )}
    </div>
  );
}
