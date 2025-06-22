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
    const fetchCombinedPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/plan?userId=${userId}&weekNumber=${weekNumber}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "No study plan available for this week"
              : "Failed to load your schedule"
          );
        }

        const data = await response.json();
        setScheduleData(data.studyPlan || {});
        setDelayedTasks(data.delayedTasks || []);
        calculateProgress(data.studyPlan || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCombinedPlan();
  }, [userId, weekNumber]);

  const calculateProgress = (data) => {
    let completed = 0;
    let total = 0;

    allDays.forEach(day => {
      if (Array.isArray(data[day])) {
        data[day].forEach(task => {
          total++;
          if (task.completed) completed++;
        });
      }
    });

    setProgress(total ? Math.round((completed / total) * 100) : 0);
  };

  const updateTaskStatus = async (day, taskIndex, completed) => {
    try {
      const response = await fetch('http://localhost:5000/update-task-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          weekNumber,
          day,
          taskIndex,
          completed
        }),
      });

      if (!response.ok) throw new Error("Failed to save task status");

      setScheduleData(prev => {
        const newData = { ...prev };
        if (Array.isArray(newData[day])) {
          newData[day] = [...newData[day]];
          newData[day][taskIndex] = {
            ...newData[day][taskIndex],
            completed
          };
        }
        calculateProgress(newData);
        return newData;
      });
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to save your change. Please try again.");
    }
  };

  const handleTaskToggle = (day, taskIndex) => {
    const currentStatus = scheduleData[day]?.[taskIndex]?.completed || false;
    updateTaskStatus(day, taskIndex, !currentStatus);
  };

  const handleClearCompleted = async () => {
    try {
      const updatePromises = [];
      allDays.forEach(day => {
        if (Array.isArray(scheduleData[day])) {
          scheduleData[day].forEach((task, index) => {
            if (task.completed) {
              updatePromises.push(updateTaskStatus(day, index, false));
            }
          });
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      alert("Failed to reset progress. Please try again.");
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your study plan...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h3>Error Loading Schedule</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">Try Again</button>
    </div>
  );

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="schedule-title">Week {weekNumber} Study Plan</h1>
        <div className="progress-tracker">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
              aria-label={`${progress}% complete`}
            ></div>
          </div>
          <div className="progress-info">
            <span className="progress-text">{progress}% Complete</span>
          </div>
        </div>
      </div>

      <div className="days-grid">
        {allDays.map(day => (
          <div key={day} className="day-column">
            <h2 className="day-header">{day}</h2>
            <div className="tasks-container">
              {Array.isArray(scheduleData[day]) && scheduleData[day].length > 0 ? (
                scheduleData[day].map((task, index) => (
                  <div
                    key={`${day}-${index}`}
                    className={`task-card ${task.completed ? "completed" : ""}`}
                  >
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => handleTaskToggle(day, index)}
                      />
                      <span className="checkmark"></span>
                    </label>

                    <div className="task-content">
                      <div className="task-header">
                        <h3 className="task-title">{task.subject}</h3>
                        <span className="task-hours">
                          {task.hours} hr{task.hours !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {task.details?.length > 0 && (
                        <ul className="task-details">
                          {task.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tasks"><p>No tasks scheduled</p></div>
              )}
            </div>
          </div>
        ))}

        {/* Delayed Tasks Card */}
        {delayedTasks.length > 0 && (
          <div className="day-column delayed-column">
            <h2 className="day-header">Delayed Tasks</h2>
            <div className="tasks-container">
              {delayedTasks.map((task, index) => (
                <div
                  key={`delayed-${index}`}
                  className="task-card carried-over"
                >
                  <div className="task-content">
                    <div className="task-header">
                      <h3 className="task-title">{task.subject}</h3>
                      <span className="task-hours">
                        {task.hours} hr{task.hours !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {task.details?.length > 0 && (
                      <ul className="task-details">
                        {task.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}

                    <div className="task-origin">
                      <span className="origin-icon">↻</span>
                      Unfinished from Week {task.originalWeek}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
