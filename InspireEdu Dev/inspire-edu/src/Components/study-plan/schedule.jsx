import React, { useEffect, useState } from "react";
import "./schedule.css";

const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const weekNumber = localStorage.getItem("weekNumber");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`http://localhost:5000/plan?userId=${userId}&weekNumber=${weekNumber}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("No available plan for this week. Please set your availability first.");
          } else {
            setError("Something went wrong while fetching the plan.");
          }
          return;
        }

        const data = await response.json();
        setScheduleData(data.studyPlan);
      } catch (err) {
        console.error("❌ Error fetching schedule:", err);
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [userId, weekNumber]);

  return (
    <div className="schedule-container">
      <h1 className="page-header">Week {weekNumber}<br />Planner</h1>

      {loading ? (
        <p className="loading">Loading schedule...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        allDays.map((day) => (
          <div key={day} className="day-card-sched">
            <h2 className="day">{day}</h2>
            {Array.isArray(scheduleData[day]) && scheduleData[day].length > 0 ? (
              scheduleData[day].map((task, index) => (
                <div key={index} className="task">
                  <strong>{task.subject} - {task.hours} hours</strong>
                  <ul>
                    {task.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p>Day unavailable</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Schedule;
