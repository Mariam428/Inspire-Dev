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

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Lectures.css"; // Ensure styles match

const subjectLectures = {
  OS: ["Lecture 1", "Lecture 2", "Lecture 3"],
  Compiler: ["Lecture 1", "Lecture 2"],
  "Computer Networks": ["Lecture 1", "Lecture 2", "Lecture 3"],
  "Algorithm Analysis": ["Lecture 1", "Lecture 2", "Lecture 3", "Lecture 4"],
  NLP: ["Lecture 1", "Lecture 2"],
  SAAD: ["Lecture 1", "Lecture 2", "Lecture 3"],
};

export default function Lectures() {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const lectures = subjectLectures[subjectName] || [];

  return (
    <div className="lectures-container">
      <h1 className="lectures-title">Lectures</h1>
      <div className="lectures-list">
        {lectures.length > 0 ? (
          lectures.map((lecture, index) => (
            <button key={index} className="lecture-card vertical" onClick={() => navigate(`/lecture-content/${subjectName}/${lecture}`)}>
              {lecture}
            </button>
          ))
        ) : (
          <p className="text-gray-500">No lectures available.</p>
        )}
      </div>
    </div>
  );
}
