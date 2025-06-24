import React, { useState, useEffect } from "react";
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
  const [allCourses, setAllCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [uploadType, setUploadType] = useState(""); // "pdf" or "video"

  const userEmail = localStorage.getItem("email");
  const authToken = localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/Login");
  };

  useEffect(() => {
    fetchCourses();
    // Only fetch resources if we have user data
    if (userEmail && authToken) {
      fetchResources();
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/courses");
      setAllCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setAllCourses([]); // Set empty array on error
    }
  };

  const fetchResources = async () => {
    try {
      const resourcesResponse = await axios.get(
        "http://localhost:5000/resources",
        {
          params: { educatorEmail: userEmail },
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      setResources(resourcesResponse.data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setResources([]); // Set empty array on error
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!subject || !file) {
      setUploadMessage("Please fill all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("file", file);
    formData.append("lectureNumber", lectureNumber);

    try {
      const url = uploadType === "video"
        ? "http://localhost:5000/upload-video"
        : "http://localhost:5000/upload-resource";

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`
        }
      });

      setUploadMessage(response.data.message);
      setShowPopup(false);
      setSubject("");
      setLectureNumber("");
      setFile(null);

      if (uploadType === "pdf") {
        if (userEmail && authToken) {
          fetchResources();
        }
      }

    } catch (error) {
      setUploadMessage(error.response?.data?.error || "Error uploading file");
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await axios.delete(`http://localhost:5000/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (userEmail && authToken) {
        fetchResources();
      }
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
        <h2>Welcome, Admin</h2>
        <p>You have access to all courses ({allCourses.length} total)</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span><img src="/icons/upload_18045474 (1).png" alt="" /></span>
          <h2>Upload</h2>
        </div>
        <div className="content-container">
          <div className="content-card">
            <img className="photo" src="/icons/mentor_5766177.png" alt="" />
            <button
              className="upload"
              onClick={() => {
                setUploadType("video");
                setShowPopup(true);
              }}
            >
              <p>Video</p>
              <img className="icon" src="/icons/plus_8001591.png" alt="" />
            </button>
          </div>
          <div className="content-card">
            <img className="photo" src="/icons/productivity_3315242.png" alt="" />
            <button
              className="upload"
              onClick={() => {
                setUploadType("pdf");
                setShowPopup(true);
              }}
            >
              <p>Resource</p>
              <img className="icon" src="/icons/plus_8001591.png" alt="" />
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <h3>Upload {uploadType === "video" ? "Video" : "Resource"}</h3>
            <form onSubmit={handleFileUpload}>
              <label>Course:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="">Select a course</option>
                {allCourses.map(course => (
                  <option key={course.id || course._id} value={course.name}>{course.name}</option>
                ))}
              </select>

              <label>Lecture Number:</label>
              <input
                type="text"
                value={lectureNumber}
                onChange={(e) => setLectureNumber(e.target.value)}
                required
              />

              {uploadType === "video" ? (
                <>
                  <label>Upload Video:</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </>
              ) : (
                <>
                  <label>Upload PDF:</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </>
              )}

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

export default AdminDashboard;