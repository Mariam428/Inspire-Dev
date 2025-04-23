import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./Teacher-Dashboard/TeacherDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [subject, setSubject] = useState("");
  const [lectureNumber, setLectureNumber] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/Login");
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!subject || !lectureNumber || !file) {
      setUploadMessage("Please fill all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("lectureNumber", lectureNumber);
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload-resource", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage(response.data.message);
      setShowPopup(false); // Close the popup after upload
      setSubject("");
      setLectureNumber("");
      setFile(null);
    } catch (error) {
      setUploadMessage("Error uploading file.");
      console.error(error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="welcome-card">
        <h2>Welcome, Admin</h2>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span><img src="/icons/upload_18045474 (1).png" alt="" /></span>
          <h2>Upload</h2>
        </div>
        <div className="content-container">
          <div className="content-card">
            <img className="photo" src="/icons/mentor_5766177.png" alt="" />
            <button className="upload">
              <p>Video</p>
              <img className="icon" src="/icons/plus_8001591.png" alt="" />
            </button>
          </div>
          <div className="content-card">
            <img className="photo" src="/icons/productivity_3315242.png" alt="" />
            <button className="upload" onClick={() => setShowPopup(true)}>
              <p>Resource</p>
              <img className="icon" src="/icons/plus_8001591.png" alt="" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Upload Resource Popup */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <h3>Upload Resource</h3>
            <form onSubmit={handleFileUpload}>
              <label>Subject:</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />

              <label>Lecture Number:</label>
              <input type="text" value={lectureNumber} onChange={(e) => setLectureNumber(e.target.value)} required />

              <label>Upload PDF:</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required />

              <div className="popup-buttons">
                <button type="submit" className="upload-btn">Upload</button>
                <button type="button" className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
            {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;