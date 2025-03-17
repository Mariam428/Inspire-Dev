// src/Components/useCalculateRemainingQuizzes.js

import { useEffect } from "react";

const useCalculateRemainingQuizzes = () => {
  const calculateRemaining = () => {
    const enrolledCourses = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    const quizGrades = JSON.parse(localStorage.getItem("currentquizGrades") || "{}");

    const submittedSubjects = quizGrades?.scores ? Object.keys(quizGrades.scores) : [];

    const remaining = enrolledCourses.filter(
      (course) => !submittedSubjects.includes(course)
    );

    localStorage.setItem("remainingQuizzes", JSON.stringify(remaining));
  };

  useEffect(() => {
    calculateRemaining(); // Run on mount

    const handleChange = (e) => {
      if (
        e.key === "enrolledCourses" ||
        e.key === "currentquizGrades" ||
        e.type === "localStorageChange"
      ) {
        calculateRemaining();
      }
    };

    window.addEventListener("storage", handleChange);
    window.addEventListener("localStorageChange", handleChange); // custom event

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("localStorageChange", handleChange);
    };
  }, []);
};

export default useCalculateRemainingQuizzes;

