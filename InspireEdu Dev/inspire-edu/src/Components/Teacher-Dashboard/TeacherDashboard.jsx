import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [subject, setSubject] = useState("");
  const [lectureNumber, setLectureNumber] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [educatorCourses, setEducatorCourses] = useState([]);
  const [resources, setResources] = useState([]);

  const userEmail = localStorage.getItem("email");
  const authToken = localStorage.getItem("authToken");
  
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Fetch educator's courses and their resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get educator's assigned courses
        const coursesResponse = await axios.get(
          `http://localhost:5000/educator-courses/${userEmail}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setEducatorCourses(coursesResponse.data.courses);

        // Get resources for these courses
        const resourcesResponse = await axios.get(
          "http://localhost:5000/resources",
          {
            params: { educatorEmail: userEmail },
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setResources(resourcesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userEmail, authToken]);

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
      const response = await axios.post(
        "http://localhost:5000/upload-resource",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      setUploadMessage(response.data.message);
      setShowPopup(false);
      setSubject("");
      setLectureNumber("");
      setFile(null);
      
      // Refresh resources after upload
      const res = await axios.get("http://localhost:5000/resources", {
        params: { educatorEmail: userEmail },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setResources(res.data);
    } catch (error) {
      setUploadMessage(error.response?.data?.error || "Error uploading file");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await axios.delete(`http://localhost:5000/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Refresh resources after deletion
      const res = await axios.get("http://localhost:5000/resources", {
        params: { educatorEmail: userEmail },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setResources(res.data);
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="welcome-card">
        <h2>Welcome, Educator</h2>
        <p>Your courses: {educatorCourses.join(", ")}</p>
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

      {/* Resource List */}
      <div className="resources-section">
        <h2>Your Lecture Resources</h2>
        <div className="resources-list">
          {resources.map(resource => (
            <div key={resource._id} className="resource-item">
              <span>{resource.subject} - {resource.lectureNumber}</span>
              <div>
                <a href={resource.filePath} target="_blank" rel="noreferrer">View</a>
                <button 
                  onClick={() => handleDeleteResource(resource._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Popup */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <h3>Upload Resource</h3>
            <form onSubmit={handleFileUpload}>
              <label>Course:</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required
              >
                <option value="">Select a course</option>
                {educatorCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <label>Lecture Number:</label>
              <input 
                type="text" 
                value={lectureNumber} 
                onChange={(e) => setLectureNumber(e.target.value)} 
                required 
              />

              <label>Upload PDF:</label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setFile(e.target.files[0])} 
                required 
              />

              <div className="popup-buttons">
                <button type="submit" className="upload-btn">Upload</button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
            {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;