import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import useCalculateRemainingQuizzes from "../useCalculateRemainingQuizzes"; // ✅ import the hook

const Dashboard = () => {
  const navigate = useNavigate();

  // ✅ Call the custom hook to update remainingQuizzes in localStorage
  useCalculateRemainingQuizzes();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/Login");
  };

  // Get localStorage values
  const email = localStorage.getItem("email");
  const student_name = localStorage.getItem("name") || "Student";
  const weekNumber = localStorage.getItem("weekNumber");
  const userId = localStorage.getItem("userId");

  // States
  const [studyTasks, setStudyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animatedName, setAnimatedName] = useState([]);
  const [remainingQuizzes, setRemainingQuizzes] = useState([]);

  // Fetch study tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId || !weekNumber) {
        setError("User ID or Week Number missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/plan?userId=${userId}&weekNumber=${weekNumber}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("No available plan for this week. Please set your availability first.");
          } else {
            setError("Something went wrong while fetching the plan.");
          }
          return;
        }

        const data = await response.json();
        const today = new Date().toLocaleString("en-US", { weekday: "long" });

        setStudyTasks(data.studyPlan[today] || []);
      } catch (err) {
        console.error("❌ Error fetching schedule:", err);
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId, weekNumber]);

  // Animate student name
  useEffect(() => {
    if (student_name) {
      const nameLetters = student_name.split("").map((char, index) => (
        <span key={index} className="letter" style={{ "--i": index }}>
          {char}
        </span>
      ));
      setAnimatedName(nameLetters);
    }
  }, [student_name]);

  // ✅ Load remaining quizzes from localStorage
  useEffect(() => {
    const remaining = JSON.parse(localStorage.getItem("remainingQuizzes") || "[]");
    setRemainingQuizzes(remaining);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Welcome */}
      <div className="welcome-card">
        <h2 className="animated-header">
          <span className="welcome">Welcome Back , </span>
          {animatedName}
        </h2>
        <p>Your tasks for today</p>
      </div>

      {/* Grid */}
      <div className="dashboard-grid">
        
        {/* Study Section */}
        <div className="section-card study">
          <div className="section-header">
            <span>
              <img src="/icons/studying_950232.png" alt="Study Icon" />
            </span>
            <h2>Study</h2>
          </div>
          <div>
            {loading ? (
              <p>Loading tasks...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : studyTasks.length > 0 ? (
              studyTasks.map((task, index) => (
                <div key={index} className="course-card">
                  <h3>{task.subject}</h3>
                  <p>• {task.hours} hours</p>
                  <ul>
                    {task.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>No tasks for today.</p>
            )}
          </div>
        </div>

        {/* ✅ Quizzes Section */}
        <div className="section-card quizzes">
          <div className="section-header">
            <span>
              <img src="/icons/quiz_17897983.png" alt="Quiz Icon" />
            </span>
            <h2>Quizzes</h2>
          </div>
          <div>
            {remainingQuizzes.length > 0 ? (
              remainingQuizzes.map((subject, index) => (
                <div key={index} className="course-card">
                  <h3>{subject}</h3>
                  <p>Quiz not submitted yet.</p>
                </div>
              ))
            ) : (
              <p>No quizzes for today.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
