import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./LectureContent.css";

export default function LectureResources() {
  const { subjectName, lectureName } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        let formattedSubject = subjectName.trim().toUpperCase();
        let formattedLecture = !isNaN(lectureName) 
          ? `LECTURE ${lectureName}` 
          : lectureName.trim().replace(/lecture\s*/i, "LECTURE ");
  
        const response = await axios.get(`http://localhost:5000/resources/${formattedSubject}/${formattedLecture}`);
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching resources", error);
        setError("Failed to fetch resources.");
      } finally {
        setLoading(false); // ✅ Fix: Ensure loading state updates
      }
    };
  
    fetchResources();
  }, [subjectName, lectureName]);
  

  return (
    <div className="lecture-content-container">
      <h1 className="lecture-title">{lectureName}</h1>
  
      {loading ? (
        <p>Loading resources...</p>
      ) : error ? (
        <p>{error}</p>
      ) : resources.length > 0 ? (
        <div className="lecture-resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-group">
              <a href={`http://localhost:5000${resource.filePath}`} target="_blank" rel="noopener noreferrer" className="resource-card">
                📄 Lecture PDF
              </a>
              {resource.summaryPath && (
                <a href={`http://localhost:5000${resource.summaryPath}`} target="_blank" rel="noopener noreferrer" className="resource-card">
                  📑 Lecture Summary
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No resources uploaded for this lecture.</p>
      )}
    </div>
  );
  
}
