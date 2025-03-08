import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./LectureContent.css";

const lectureResources = [
  { title: "Lecture PDF", icon: "📄", type: "pdf" },
  { title: "Quiz", icon: "📝", type: "quiz" },
  { title: "Summary", icon: "📖", type: "summary" },
  { title: "Ask a Question", icon: "🗪", type: "question" },
];

export default function LectureContent() {
  const { lectureName } = useParams();
  const [showChatbot, setShowChatbot] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Stores chat messages

  const handleAskQuestion = () => {
    setShowChatbot(true);
  };

  const handleSendQuestion = () => {
    if (!question.trim()) return; // Prevent empty messages

    // Add user message to chat history
    const newChat = [...chatHistory, { sender: "user", text: question }];
    
    // Simulate bot response (replace this with API call later)
    setTimeout(() => {
      const botReply = { sender: "bot", text: "I received your question: " + question };
      setChatHistory([...newChat, botReply]); // Update chat with bot response
    }, 1000);

    setChatHistory(newChat);
    setQuestion(""); // Clear input after sending
  };

  return (
    <div className="lecture-content-container">
      <h1 className="lecture-title">{lectureName}</h1>
      <div className="lecture-resources-grid">
        {lectureResources.map((resource, index) => (
          <button
            key={index}
            className={`resource-card ${resource.type === "question" ? "question-card" : ""}`}
            onClick={resource.type === "question" ? handleAskQuestion : null}
          >
            <span className="resource-icon">{resource.icon}</span>
            <span className="resource-title">{resource.title}</span>
          </button>
        ))}
      </div>

      {/* Chatbot Popup */}
      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>Ask a Question</h4>
            <button className="close-btn" onClick={() => setShowChatbot(false)}>✖</button>
          </div>

          {/* Chat Messages Display */}
          <div className="chatbot-messages">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Field for Sending Messages */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()} // Send on Enter key press
            />
            <button className="send-btn" onClick={handleSendQuestion}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
