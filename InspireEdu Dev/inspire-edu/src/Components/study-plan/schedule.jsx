import React from "react";
import "./schedule.css";

const allDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Schedule = () => {
  // Safely parse localStorage data
  const storedData = localStorage.getItem("scheduleData");
  const scheduleData = storedData ? JSON.parse(storedData) : null;
  console.log(storedData)

  if (!scheduleData) {
    return (
      <div className="schedule-container">
        <h1 className="page-header">Weekly<br />Planner</h1>
        <p>No schedule found. Please generate your plan first.</p>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <h1 className="page-header">Weekly<br />Planner</h1>
      {allDays.map((day) => (
        <div key={day} className="day-card-sched">
          <h2 className="day">{day}</h2>
          {scheduleData[day] ? (
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
