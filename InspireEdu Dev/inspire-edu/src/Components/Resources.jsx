import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Resources.css";

const subjects = [
  { name: "OS", color: "bg-green-100", textColor: "text-green-700", border: "border-green-300", lectures: ["Lecture 1", "Lecture 2", "Lecture 3"] },
  { name: "Compiler", color: "bg-orange-100", textColor: "text-orange-700", border: "border-orange-300", lectures: ["Lecture 1", "Lecture 2"] },
  { name: "Computer Networks", color: "bg-red-100", textColor: "text-red-700", border: "border-red-300", lectures: ["Lecture 1", "Lecture 2", "Lecture 3"] },
  { name: "Algorithm Analysis", color: "bg-blue-100", textColor: "text-blue-700", border: "border-blue-300", lectures: ["Lecture 1", "Lecture 2", "Lecture 3", "Lecture 4"] },
  { name: "NLP", color: "bg-gray-100", textColor: "text-gray-700", border: "border-gray-300", lectures: ["Lecture 1", "Lecture 2"] },
  { name: "SAAD", color: "bg-yellow-100", textColor: "text-yellow-700", border: "border-yellow-300", lectures: ["Lecture 1", "Lecture 2", "Lecture 3"] },
];

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="resources-container">
      <h1 className="resources-title">Resources</h1>
      <div className="resources-grid">
        {subjects.map((subject, index) => (
          <button
            key={index}
            className={`resource-card ${subject.color} ${subject.border}`}
            onClick={() => navigate(`/lectures/${subject.name}`)}
          >
            <h2 className={`resource-title ${subject.textColor}`}>{subject.name}</h2>
          </button>
        ))}
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import "./Resources.css";

// export default function Resources() {
//   const [resources, setResources] = useState([]);

//   useEffect(() => {
//     // Fetching data from the backend
//     fetch("https://api.example.com/resources")
//       .then((response) => response.json())
//       .then((data) => setResources(data)) // Dynamically update UI
//       .catch((error) => console.error("Error fetching resources:", error));
//   }, []);

//   return (
//     <div className="resources-container">
//       <h1 className="resources-title">Resources</h1>
//       <div className="resources-grid">
//         {resources.length === 0 ? (
//           <p className="text-gray-500 text-center">No subjects available.</p>
//         ) : (
//           resources.map((resource, index) => (
//             <div key={index} className={`resource-card ${resource.color} ${resource.border}`}>
//               <h2 className={`resource-title ${resource.textColor}`}>{resource.title}</h2>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
