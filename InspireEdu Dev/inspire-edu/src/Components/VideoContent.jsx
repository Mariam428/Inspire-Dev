// VideoContent.jsx
import React from "react";
import { useParams } from "react-router-dom";
import "./VideoContent.css";

export default function VideoContent() {
  const { subjectName, videoName } = useParams();

  return (
    <div className="video-content-container">
      <h1 className="video-title">{videoName.replace(/_/g, " ")}</h1>
      <div className="video-player">
        {/* For now, you can display a placeholder video or embed actual videos */}
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/VIDEO_ID`} // Replace VIDEO_ID with actual video ID or dynamic link
          title={videoName}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
