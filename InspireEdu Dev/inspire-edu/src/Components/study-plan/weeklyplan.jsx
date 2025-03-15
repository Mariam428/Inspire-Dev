import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Weeklyplan.css";

export default function Setup() {
    const [weekNumber, setWeekNumber] = useState(2);
    const navigate = useNavigate();

    useEffect(() => {
        // Get registration date from localStorage
        const registrationDate = localStorage.getItem("registrationDate");
        
        if (registrationDate) {
            const regDate = new Date(registrationDate);
            const today = new Date();
            
            // Calculate week difference
            const timeDiff = today - regDate;
            const weeksSinceRegistration = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000)) + 1;

            setWeekNumber(weeksSinceRegistration);
        }
    }, []);

    return (
        <div className="page-container">
            <header className="study-plan-header">
                <h1>Ready for Week {weekNumber}?</h1>
                <em className="study-plan-slogan">Track your Progress & Plan Ahead!</em>
            </header>

            <div className="button-container">
                <button className="navigate-button bg-blue-100 text-blue-700 border-blue-300"
                        onClick={() => navigate("/study-plan/grades")}>
                    Track Progress
                </button>
                <button className="navigate-button bg-yellow-100 text-yellow-700 border-yellow-300"
                        onClick={() => navigate("/study-plan/availability")}>
                    Set Availability
                </button>
                <button className="navigate-button bg-green-100 text-green-700 border-green-300"
                        onClick={() => navigate(`/study-plan/schedule`)}>
                    Generate plan
                </button>
            </div>
        </div>
    );
}