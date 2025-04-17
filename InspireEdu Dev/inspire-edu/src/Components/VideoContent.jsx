import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // Make sure axios is installed and imported

export default function VideoContent() {
  const { subjectName, videoId } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    // Fetch the specific video using its ID
    axios
      .get(`http://localhost:5000/classes/${subjectName}/${videoId}`)
      .then((response) => {
        setVideo(response.data); // Set the video data for the selected video
      })
      .catch((error) => {
        console.error("Error fetching video:", error);
      });
  }, [subjectName, videoId]);

  return (
    <div className="video-content-container">
      {video ? (
        <div>
          <h2>{`Lecture ${video.lectureNumber}`}</h2>
          <video controls width="100%">
            <source 
              src={`http://localhost:5000${video.videopath}`} 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
}
