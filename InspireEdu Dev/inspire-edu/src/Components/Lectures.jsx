// import React from "react";
// import { useParams } from "react-router-dom";
// import "./Resources.css"; // Ensure styles match

// const subjectLectures = {
//   OS: ["Lecture 1", "Lecture 2", "Lecture 3"],
//   Compiler: ["Lecture 1", "Lecture 2"],
//   "Computer Networks": ["Lecture 1", "Lecture 2", "Lecture 3"],
//   "Algorithm Analysis": ["Lecture 1", "Lecture 2", "Lecture 3", "Lecture 4"],
//   NLP: ["Lecture 1", "Lecture 2"],
//   SAAD: ["Lecture 1", "Lecture 2", "Lecture 3"],
// };

// export default function Lectures() {
//   const { subjectName } = useParams();
//   const lectures = subjectLectures[subjectName] || [];

//   return (
//     <div className="resources-container">
//       <h1 className="resources-title">Lectures</h1>
//       <div className="lectures-grid">
//         {lectures.length > 0 ? (
//           lectures.map((lecture, index) => (
//             <button key={index} className="lecture-card">
//               {lecture}
//             </button>
//           ))
//         ) : (
//           <p className="text-gray-500">No lectures available.</p>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Lectures.css"; // Import CSS file

const Lectures = () => {
  const { subjectName } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:5000/lectures/${subjectName}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Lectures:", data);
        const formattedLectures = data.map((lecture, index) => {
          return `Lecture ${index + 1}`; // ✅ Formats lecture names properly
        });
        setLectures(formattedLectures);
      })
      
      .catch((error) => console.error("Error fetching lectures:", error))
      .finally(() => setLoading(false));
  }, [subjectName]);

  return (
    <div className="lectures-container">
      <h1 className="lectures-title">{subjectName} Lectures</h1>
      
      {loading ? (
        <p className="loading-text">Loading lectures...</p>
      ) : lectures.length > 0 ? (
        <div className="lectures-list">
          {lectures.map((lecture, index) => (
            <Link key={index} to={`/lecture-content/${subjectName}/${lecture}`} className="lecture-link">
              <div className="lecture-card">
                <span className="lecture-icon">📘</span>
                <span className="lecture-title">{lecture.replace("LECTURE", "Lecture")}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-lectures">No lectures available for {subjectName}.</p>
      )}
    </div>
  );
};

export default Lectures;

