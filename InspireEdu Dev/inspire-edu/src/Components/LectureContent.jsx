import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./LectureContent.css";

export default function LectureContent() {
  const { subjectName } = useParams();
  const [lectures, setLectures] = useState([]); // Store uploaded lectures
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        let formattedSubject = subjectName.trim().toUpperCase();
        const response = await axios.get(`http://localhost:5000/lectures/${formattedSubject}`);
        setLectures(response.data); // ✅ Store lectures from DB
      } catch (error) {
        console.error("Error fetching lectures", error);
        setError("Failed to fetch lectures.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [subjectName]);

  return (
    <div className="lectures-container">
      <h1 className="subject-title">{subjectName}</h1>

      {loading ? (
        <p>Loading lectures...</p>
      ) : error ? (
        <p>{error}</p>
      ) : lectures.length > 0 ? (
        <div className="lecture-list">
          {lectures.map((lecture, index) => (
            <Link 
              key={index} 
              to={`/lecture-content/${subjectName}/${lecture}`} 
              className="lecture-card"
            >
              <span className="lecture-icon">📖</span>
              <span className="lecture-title">{lecture}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p>No lectures uploaded yet for this subject.</p>
      )}
    </div>
  );
}
