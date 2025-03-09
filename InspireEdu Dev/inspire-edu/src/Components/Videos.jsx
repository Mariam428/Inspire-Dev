// Videos.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Videos.css";

// Mock video data for each subject
const videosData = {
  OS: ["Lecture 1", "Lecture 2", "Lecture 3"],
  Compiler: ["Lecture 1", "Lecture 2"],
  "Computer Networks": ["Lecture 1", "Lecture 2", "Lecture 3"],
  "Algorithm Analysis": ["Lecture 1", "Lecture 2", "Lecture 3", "Lecture 4"],
  NLP: ["Lecture 1", "Lecture 2"],
  SAAD: ["Lecture 1", "Lecture 2", "Lecture 3"],
};

export default function Videos() {
  const { subjectName } = useParams();
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch videos data based on subject name
    if (videosData[subjectName]) {
      setVideos(videosData[subjectName]);
    }
  }, [subjectName]);

  const handleVideoClick = (videoName) => {
    // Navigate to the video content page
    navigate(`/video-content/${subjectName}/${videoName.replace(/\s+/g, "_")}`);
  };

  return (
    <div className="videos-container">
      <h1 className="videos-title">{subjectName} Videos</h1>
      <div className="videos-list">
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div
              key={index}
              className="video-card"
              onClick={() => handleVideoClick(video)}
            >
              <h3>{video}</h3>
            </div>
          ))
        ) : (
          <p>No videos available for this subject.</p>
        )}
      </div>
    </div>
  );
}
