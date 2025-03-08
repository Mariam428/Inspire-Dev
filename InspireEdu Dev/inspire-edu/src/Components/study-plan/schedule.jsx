import React, { useState } from "react";
import "./schedule.css"; // Ensure styles are in place

// Temporary mock data (replace this with backend data)
const scheduleData = {
  Monday: [
    {
      subject: "Neural Networks",
      hours: 2.0,
      details: ["Study lecture: 6 (PDF)", "Rewatch lecture: 5 & take notes"],
    },
    {
      subject: "Image Processing",
      hours: 3.0,
      details: ["Study lecture: 6 (PDF)", "Rewatch lecture: 5 & take notes"],
    },
  ],
  Tuesday: [
    {
      subject: "Image Processing",
      hours: 3.0,
      details: ["Study lecture: 6 (PDF)", "Rewatch lecture: 5 & take notes"],
    },
    {
      subject: "Logic Programming",
      hours: 2.0,
      details: ["Study lecture: 6 (PDF)", "Summarize key points from lecture: 5"],
    },
  ],
  Wednesday: [
    {
      subject: "Logic Programming",
      hours: 2.0,
      details: ["Study lecture: 6 (PDF)", "Summarize key points from lecture: 5"],
    },
    {
      subject: "DSP",
      hours: 3.0,
      details: ["Study lecture: 6 (PDF)"],
    },
  ],
};

// Days of the week (ensures all 7 days are included)
const allDays = ["Saturday", "Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Schedule = () => {
  const [notes, setNotes] = useState("");

  return (
    <div className="schedule-container">
      {allDays.map((day) => (
        <div key={day} className="day-card-sched">
          <h2>{day}</h2>
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

      {/* Additional Notes Card */}
      <div className="day-card notes-card">
        <h2>Additional Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
        />
      </div>
    </div>
  );
};

export default Schedule;
