import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideBar from "./Components/SideBar";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import Resources from "./Components/Resources";
import Lectures from "./Components/Lectures";
import LectureContent from "./Components/LectureContent"; // Import the new component
import Setup from "./Components/study-plan/weeklyplan";
import Grades from "./Components/study-plan/grades";
import Availability from "./Components/study-plan/availability"
import Schedule from "./Components/study-plan/schedule"

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="sidebar">
          <SideBar />
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/Dashboard" replace />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Resources" element={<Resources />} /> {/* Ensure this line is added */}
            <Route path="/lectures/:subjectName" element={<Lectures />} />
            <Route path="/lecture-content/:subjectName/:lectureName" element={<LectureContent />} />
            <Route path="/study-plan/weeklyplan" element={<Setup />} />
            <Route path="/study-plan/grades" element={<Grades />} />
            <Route path="/study-plan/availability" element={<Availability />} />
            <Route path="/study-plan/schedule" element={<Schedule/>} />


          
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

// export default function App() {
//   return (
//     <div className="bg-red-500 text-white text-3xl font-bold p-10 text-center">
//       Tailwind is Working! 🚀
//     </div>
//   );
// }

