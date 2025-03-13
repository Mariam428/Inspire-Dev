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
  const [scheduleData, setScheduleData] = useState(null); // ✅ To store backend response

  const handleHoursChange = (day, hours) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: hours,
    }));
  };

  const handleSubmit = async () => {
    console.log("Selected Availability:", availability);
    
   
    const formattedSummary = Object.entries(availability)
      .filter(([_, hours]) => hours > 0)
      .map(([day, hours]) => `${day}: ${hours} hour${hours > 1 ? "s" : ""}`)
      .join("\n");

    setSummary(formattedSummary);

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availability, // ✅ actual availability from frontend
          grades: {
            os: 5.5,
            nlp: 10,
          },
        }),
      });
      const data = await response.json();
      console.log("✅ Backend Response Message:", data.message);
      console.log("📅 Schedule Data:", data.scheduleData);
      localStorage.setItem("scheduleData", JSON.stringify(data.scheduleData));

     // Retrieve into temp variable
      const temp = JSON.parse(localStorage.getItem("scheduleData"));

     // Log the temp variable
     console.log("📦 Temp Schedule from Local Storage:", temp);

      

     

    } catch (error) {
      console.error("❌ Error reaching backend:", error);
     
    }
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
              onChange={(e) =>
                handleHoursChange(day, parseInt(e.target.value) || 0)
              }
            />
            <span>Hours</span>
          </div>
        ))}

        {/* Summary Card */}
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
