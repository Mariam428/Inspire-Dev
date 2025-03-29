import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./LectureContent.css";

export default function LectureResources() {
    const { subjectName, lectureName } = useParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [previousScore, setPreviousScore] = useState(null);
    const [showQuizPopup, setShowQuizPopup] = useState(false);
    const [quizAlreadySubmitted, setQuizAlreadySubmitted] = useState(false);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                let formattedSubject = subjectName.trim().toUpperCase();
                let formattedLecture = !isNaN(lectureName)
                    ? `LECTURE ${lectureName}`
                    : lectureName.trim().replace(/lecture\s*/i, "LECTURE ");

                const response = await axios.get(
                    `http://localhost:5000/resources/${formattedSubject}/${formattedLecture}`
                );
                setResources(response.data);
            } catch (error) {
                console.error("Error fetching resources", error);
                setError("Failed to fetch resources.");
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [subjectName, lectureName]);

    const handleQuizButtonClick = async () => {
        try {
            const response = await axios.get("http://localhost:5000/quiz-questions", {
                params: {
                    subject: subjectName,
                    lectureNumber: lectureName,
                    userId: localStorage.getItem("userId"),
                    weekNumber: localStorage.getItem("weekNumber"),
                },
            });

            if (response.data.alreadySubmitted) {
                setPreviousScore({
                    score: response.data.score,
                    total: response.data.total,
                });
                setQuizAlreadySubmitted(true);
                setShowQuizPopup(true);
                return;
            }

            setQuizQuestions(response.data);
            setPreviousScore(null);
            setQuizAlreadySubmitted(false);
            setShowQuizPopup(true);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                const score = error.response.data?.score;
                const total = error.response.data?.total;
                setQuizAlreadySubmitted(true);
                setPreviousScore({ score, total });
                setShowQuizPopup(true);
            } else {
                console.error("Error fetching quiz questions", error);
            }
        }
    };

    const handleAnswerChange = (index, option) => {
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [index]: option,
        }));
    };

    const handleSubmitQuiz = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");
        const weekNumber = localStorage.getItem("weekNumber");

        try {
            const response = await axios.post("http://localhost:5000/submit-quiz", {
                userAnswers: Object.values(userAnswers),
                subject: subjectName,
                lectureNumber: lectureName,
                userId: userId,
                weekNumber: parseInt(weekNumber),
            });

            setScore(response.data.score);
            setQuizSubmitted(true);

            const gradesRes = await axios.get(
                `http://localhost:5000/get-quiz-grades?userId=${userId}&weekNumber=${weekNumber}`
            );

            if (gradesRes.status === 200) {
                const updatedGrades = gradesRes.data;
                localStorage.setItem("currentquizGrades", JSON.stringify(updatedGrades));
                console.log("✅ Updated quiz grades saved to localStorage:", updatedGrades);
            } else {
                console.warn("⚠️ Failed to fetch updated quiz grades.");
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    const closeQuizPopup = () => {
        setShowQuizPopup(false);
        setQuizSubmitted(false);
        setUserAnswers({});
        setScore(0);
        setPreviousScore(null);
        setQuizAlreadySubmitted(false);
    };

    return (
        <div className="lecture-content-container">
            <h1 className="lecture-title">{lectureName}</h1>

            {loading ? (
                <p className="lecture-message">Loading resources...</p>
            ) : error ? (
                <p className="lecture-message error-text">{error}</p>
            ) : resources.length > 0 ? (
                <div className="lecture-resources-grid">
                    {resources.map((resource, index) => (
                        <div key={index} className="resource-group">
                            <a
                                href={`http://localhost:5000${resource.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-card"
                            >
                                📄 Lecture PDF
                            </a>
                            {resource.summaryPath && (
                                <a
                                    href={`http://localhost:5000${resource.summaryPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="resource-card"
                                >
                                    📑 Lecture Summary
                                </a>
                            )}
                        </div>
                    ))}
                    <button onClick={handleQuizButtonClick} className="quiz-button">
                        Start Quiz
                    </button>
                </div>
            ) : (
                <p className="lecture-message">No resources uploaded for this lecture.</p>
            )}

            {showQuizPopup && (
                <div className="quiz-popup-overlay">
                    <div className="quiz-popup">
                        {quizAlreadySubmitted ? (
                            <>
                                <h2 style={{ color: "black", fontWeight: "bold" }}> Already Submitted</h2>
                                {previousScore && (
                                    <p style={{ fontSize: "18px", marginTop: "10px" }}>
                                        Your previous score: <strong>{previousScore.score}</strong> / <strong>{previousScore.total}</strong>
                                    </p>
                                )}
                                <button onClick={closeQuizPopup} className="close-quiz-button" style={{ marginTop: "20px" }}>
                                    Close
                                </button>
                            </>
                        ) : (
                            <>
                                <h2>Quiz</h2>
                                {quizQuestions.length > 0 && (
                                    <form onSubmit={handleSubmitQuiz}>
                                        <div className="quiz-questions-container">
                                            {quizQuestions.map((question, index) => (
                                                <div key={index} className="quiz-question">
                                                    <p>{question.question}</p>
                                                    {question.options.map((option, i) => (
                                                        <label key={i}>
                                                            <input
                                                                type="radio"
                                                                name={`question-${index}`}
                                                                value={option}
                                                                onChange={() => handleAnswerChange(index, option)}
                                                                disabled={quizSubmitted}
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="submit"
                                            className="submit-quiz-button"
                                            disabled={quizSubmitted}
                                        >
                                            Submit
                                        </button>
                                    </form>
                                )}
                                {quizSubmitted && (
                                    <div className="quiz-result">
                                        <p>Your score: {score} / {quizQuestions.length}</p>
                                        <button onClick={closeQuizPopup} className="close-quiz-button">
                                            Close
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
