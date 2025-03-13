import React, { useState } from "react";
import "./schedule.css"; // Ensure styles are in place

// Load data from localStorage or fallback to empty object
const sched = JSON.parse(localStorage.getItem("scheduleData")) || {};

// Log the temp variable
console.log("📦 sched Schedule from Local Storage:", sched);

const scheduleData = sched;

// Days of the week (ensures all 7 days are included)
const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday" ];

const Schedule = () => {
  const [notes, setNotes] = useState("");

  return (
    <div className="schedule-container">
      <h1 className="page-header">Weekly<br />Planner</h1>
      {allDays.map((day) => (
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
      ))}
    </div>
  );
};

export default Schedule;
