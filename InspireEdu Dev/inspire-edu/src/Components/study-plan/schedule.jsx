import React, { useEffect, useState } from "react";
import "./schedule.css";

const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState({});
  const [delayedTasks, setDelayedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const weekNumber = localStorage.getItem("weekNumber");
  const userId = localStorage.getItem("userId");
  useEffect(() => {
  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/plan?userId=${userId}&weekNumber=${weekNumber}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load study plan");

      setScheduleData(data.studyPlan || {});
      setDelayedTasks(data.delayedTasks || []);
      calculateProgress(data.studyPlan || {});

      // ✅ Add this log
      console.log("🧪 Delayed tasks from backend:", data.delayedTasks);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchPlan();
}, [userId, weekNumber]);


  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/plan?userId=${userId}&weekNumber=${weekNumber}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load study plan");

        setScheduleData(data.studyPlan || {});
        setDelayedTasks(data.delayedTasks || []);
        calculateProgress(data.studyPlan || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [userId, weekNumber]);

  const calculateProgress = (plan) => {
    let completed = 0, total = 0;

    allDays.forEach(day => {
      if (Array.isArray(plan[day])) {
        plan[day].forEach(task => {
          total++;
          if (task.completed) completed++;
        });
      }
    });

    setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  };

  const updateTaskStatus = async ({ day, taskId, completed, isDelayed }) => {
    try {
      const res = await fetch("http://localhost:5000/update-task-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          weekNumber,
          day,
          taskId,
          completed,
          isDelayed
        }),
      });

      if (!res.ok) throw new Error("Failed to save task status");

      // Update UI locally
      if (isDelayed) {
        setDelayedTasks(prev =>
          prev.map(task =>
            task._id === taskId ? { ...task, completed } : task
          )
        );
      } else {
        setScheduleData(prev => {
          const newData = { ...prev };
          newData[day] = newData[day].map(task =>
            task._id === taskId ? { ...task, completed } : task
          );
          calculateProgress(newData);
          return newData;
        });
      }
    } catch (err) {
      console.error("❌ Error updating task:", err);
      alert("Failed to save your change. Please try again.");
    }
  };

  const handleTaskToggle = (task, day, isDelayed = false) => {
    updateTaskStatus({
      day,
      taskId: task._id,
      completed: !task.completed,
      isDelayed
    });
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="schedule-container">
      <h1>Week {weekNumber} Study Plan</h1>

      <div className="progress-tracker">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span>{progress}% Complete</span>
      </div>

      <div className="days-grid">
        {allDays.map(day => (
          <div key={day} className="day-column">
            <h2>{day}</h2>
            {Array.isArray(scheduleData[day]) && scheduleData[day].length > 0 ? (
              scheduleData[day].map(task => (
                <div key={task._id} className={`task-card ${task.completed ? "completed" : ""}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task, day)}
                    />
                    {task.subject} – {task.hours}h
                  </label>
                  {task.details?.length > 0 && (
                    <ul>
                      {task.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p>No tasks</p>
            )}
          </div>
        ))}

        {/* ✅ Delayed Tasks Column */}
        {delayedTasks.length > 0 && (
          <div className="day-column">
            <h2>⏳ Delayed Tasks</h2>
            {delayedTasks.map(task => (
              <div key={task._id} className={`task-card ${task.completed ? "completed" : ""}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskToggle(task, "Delayed", true)}
                  />
                  {task.subject} – {task.hours}h
                </label>
                {task.details?.length > 0 && (
                  <ul>
                    {task.details.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                )}
                <div className="task-origin">↻ From Week {task.originalWeek}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
