import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/Login"); 
  };
  const email = localStorage.getItem("email");
  const student_name = localStorage.getItem("name") || "Student"; 
  console.log(student_name)

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="welcome-card">
        <h2>Welcome, {student_name} </h2>
        <p>Your tasks for today</p>
      </div>

      <div className="dashboard-grid">
        <div className="section-card study">
          <div className="section-header">
            <span><img src="/icons/studying_950232.png" alt="" /></span>
            <h2>Study</h2>
          </div>
          <div>
            <div className="course-card">
              <h3>OS</h3>
              <p>• Lecture 1</p>
            </div>
            <div className="course-card">
              <h3>Electronics</h3>
              <p>• Lecture 2</p>
            </div>
            <div className="course-card">
              <h3>English</h3>
              <p>• Lecture 1</p>
            </div>
          </div>
        </div>
        <div className="section-card quizzes">
          <div className="section-header">
            <span><img src="/icons/quiz_17897983.png" alt="" /></span>
            <h2>Quizzes</h2>
          </div>
          <div>
            <div className="course-card">
              <h3>DSP</h3>
              <p>• Quiz on lecture 1</p>
            </div>
            <div className="course-card">
              <h3>Neural Networks</h3>
              <p>• Quiz on lecture 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;