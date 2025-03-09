import React from "react";
import Icons from "./Icons";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn">Logout</button>
      </div>

      <div className="welcome-card">
        <h2>Welcome, Educator</h2>
      </div>
        <div className="section-card">
          <div className="section-header">
            <span><img src="/icons/upload_18045474 (1).png" alt="" /></span>
            <h2>Upload</h2>
          </div>
        <div className="content-container">
            <div className="content-card">
             <img className ="photo" src="/icons/mentor_5766177.png" alt="" />
             <button className="upload">
                <p>Video</p>
                <img  className ="icon" src="/icons/plus_8001591.png" alt="" />
             </button>
            </div>
            <div className="content-card">
              <img className ="photo" src="/icons/productivity_3315242.png" alt="" />
              <button className="upload">
              <p>Resource</p>
              <img className ="icon" src="/icons/plus_8001591.png" alt="" />
              </button>
            </div>
        </div>
        </div>
    </div>
  );
};

export default TeacherDashboard;
