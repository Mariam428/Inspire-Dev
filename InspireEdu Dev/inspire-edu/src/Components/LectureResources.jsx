import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./LectureContent.css";

export default function LectureResources() {
    const { subjectName, lectureName } = useParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                let formattedSubject = subjectName.trim().toUpperCase();
                let formattedLecture = !isNaN(lectureName)
                    ? `LECTURE ${lectureName}`
                    : lectureName.trim().replace(/lecture\s*/i, "LECTURE ");

                const response = await axios.get(`http://localhost:5000/resources/${formattedSubject}/${formattedLecture}`);
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

    const handleQuizClick = async (e, quizPath, resource) => {
        e.preventDefault();
        console.log("Quiz button clicked!");
    
        if (!quizPath) {
            try {
                const formData = new FormData();
                
                // ✅ Fetch the actual file as a blob
                const response = await axios.get(`http://localhost:5000${resource.filePath}`, { responseType: 'blob' });
    
                // ✅ Convert the blob into a real file
                const file = new File([response.data], "lecture.pdf", { type: "application/pdf" });
    
                formData.append("file", file);
                formData.append("subject", subjectName);
                formData.append("lectureNumber", lectureName);
    
                console.log("Sending request to generate quiz...");
                const quizResponse = await axios.post('http://localhost:5000/generate-quiz', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                console.log("Quiz generation response:", quizResponse.data);
                if (quizResponse.data.quizPath) {
                    const updatedResources = resources.map(res => 
                        res.filePath === resource.filePath ? { ...res, quizPath: quizResponse.data.quizPath } : res
                    );
                    setResources(updatedResources);
                }
            } catch (error) {
                console.error("❌ Error generating quiz:", error);
            }
        } else {
            window.open(`http://localhost:5000${quizPath}`, '_blank');
        }
    };
        
    return (
        <div className="lecture-content-container">
            <h1 className="lecture-title">{lectureName}</h1>

            {loading ? (
                <p>Loading resources...</p>
            ) : error ? (
                <p>{error}</p>
            ) : resources.length > 0 ? (
                <div className="lecture-resources-grid">
                    {resources.map((resource, index) => (
                        <>
                            <a 
                                key={`${index}-pdf`} 
                                href={`http://localhost:5000${resource.filePath}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="resource-card"
                            >
                                <span className="resource-icon">📄</span>
                                <span className="resource-title">Lecture PDF</span>
                            </a>
                            
                            {resource.summaryPath && (
                                <a 
                                    key={`${index}-summary`} 
                                    href={`http://localhost:5000${resource.summaryPath}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="resource-card"
                                >
                                    <span className="resource-icon">📚</span>
                                    <span className="resource-title">Summary</span>
                                </a>
                            )}
                            
                            {/* Always show Quiz button */}
                            <a 
                            key={`${index}-quiz`} 
                            href={resource.quizPath ? `http://localhost:5000${resource.quizPath}` : '#'}
                            onClick={(e) => handleQuizClick(e, resource.quizPath, resource)} // Ensure this is correct
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`resource-card ${resource.quizPath ? '' : 'disabled'}`}
                        >
                            <span className="resource-icon">📝</span>
                            <span className="resource-title">Quiz</span>
                        </a>
                        </>
                    ))}
                </div>
            ) : (
                <p>No resources uploaded for this lecture.</p>
            )}
        </div>
    );
}