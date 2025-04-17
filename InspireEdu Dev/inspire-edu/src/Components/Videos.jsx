import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // For API calls
import "./Videos.css";

export default function Videos() {
  const { subjectName } = useParams();
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch videos for the given subject from the API
    axios
      .get(`http://localhost:5000/classes/${subjectName}`)
      .then((response) => {
        setVideos(response.data); // Update the state with video data
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, [subjectName]);

  const handleVideoClick = (video) => {
    const videoPath = `http://localhost:5000${video.videopath}`;
    window.open(videoPath, "_blank");
  };



  return (
    <div className="videos-container">
      <h1 className="videos-title">{subjectName} Videos</h1>
      <div className="videos-list">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div
              key={video._id}
              className="video-card"
              onClick={() => handleVideoClick(video)}
            >
              <h3>Lecture {video.lectureNumber}</h3>
            </div>
          ))
        ) : (
          <p>No Lecture Records available for this subject.</p>
        )}
      </div>
    </div>
  );
}
