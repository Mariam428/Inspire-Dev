import { useState } from "react";
import "./availability.css";

export default function Availability() {
  const [availability, setAvailability] = useState({
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  });

  const [summary, setSummary] = useState("");

  const handleHoursChange = (day, hours) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: hours,
    }));
  };

  const handleSubmit = () => {
    console.log("Selected Availability:", availability);
    
    const formattedSummary = Object.entries(availability)
      .filter(([_, hours]) => hours > 0)
      .map(([day, hours]) => `${day}: ${hours} hour${hours > 1 ? "s" : ""}`)
      .join("\n");

    setSummary(formattedSummary);
  };

  return (
    <div className="availability-container">
      <h1 className="availability-title">Set Your Study Availability</h1>
      <div className="calendar">
        {Object.keys(availability).map((day) => (
          <div key={day} className="day-card">
            <h2>{day}</h2>
            <input
              type="number"
              min="0"
              max="12"
              value={availability[day]}
              onChange={(e) => handleHoursChange(day, parseInt(e.target.value) || 0)}
            />
            <span>Hours</span>
          </div>
        ))}
        {/* 8th card for summary */}
        <div className="day-card summary-card">
          <p>{summary || "No availability set"}</p>
        </div>
      </div>
      <button className="submit-button" onClick={handleSubmit}>
        Save Availability
      </button>
    </div>
  );
}
