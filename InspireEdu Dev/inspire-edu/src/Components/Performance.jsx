import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Performance.css"; // You'll create this for styling

export default function Performance() {
  const [allScores, setAllScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(`http://localhost:5000/get-all-scores?userId=${userId}`);
        setAllScores(response.data);
        console.log("🔹 Backend Response:", response.data); // ✅ Log the response
      } catch (err) {
        console.error("Error fetching performance scores:", err);
        setError("Failed to load performance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="performance-container">
      <h1 className="performance-title">Your Performance</h1>

      {loading ? (
        <p className="performance-loading">Loading performance data...</p>
      ) : error ? (
        <p className="performance-error">{error}</p>
      ) : allScores.length === 0 ? (
        <p className="performance-message">No scores available yet.</p>
      ) : (
        <div className="performance-weeks">
          {allScores.map((weekData, index) => (
            <div key={index} className="performance-week-card">
              <h2 className="performance-week-title">Week {weekData.weekNumber}</h2>
              <ul className="performance-score-list">
                {Object.entries(weekData.scores).map(([subject, score], idx) => (
                  <li key={idx} className="performance-score-item">
                    <span className="subject-name">{subject}:</span>
                    <span className="subject-score">{score}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
