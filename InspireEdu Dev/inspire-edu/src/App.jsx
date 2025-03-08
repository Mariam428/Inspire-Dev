import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SideBar from "./Components/SideBar";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Resources from "./Components/Resources";
import Lectures from "./Components/Lectures";
import LectureContent from "./Components/LectureContent"; // Import the new component
import Setup from "./Components/study-plan/weeklyplan";
import Grades from "./Components/study-plan/grades";
import Availability from "./Components/study-plan/availability"
import Schedule from "./Components/study-plan/schedule"
import Classes from "./Components/Classes";
import Videos from "./Components/Videos";
import VideoContent from "./Components/VideoContent";

import "./App.css";

function Layout() {
  const location = useLocation();
  
  // Normalize pathname to ensure matching
  const currentPath = location.pathname.toLowerCase();
  const hideSidebarRoutes = ["/login", "/register", "/forgot-password"];

  return (
    <div className="app-container">
      {/* Only render Sidebar if the current path is NOT in hideSidebarRoutes */}
      {!hideSidebarRoutes.includes(currentPath) && (
        <div className="sidebar">
          <SideBar />
        </div>
      )}
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/lectures/:subjectName" element={<Lectures />} />
          <Route path="/lecture-content/:subjectName/:lectureName" element={<LectureContent />} />
          <Route path="/study-plan/weeklyplan" element={<Setup />} />
          <Route path="/study-plan/grades" element={<Grades />} />
          <Route path="/study-plan/availability" element={<Availability />} />
          <Route path="/study-plan/schedule" element={<Schedule/>} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/videos/:subjectName" element={<Videos />} />
          <Route path="/video-content/:subjectName/:videoName" element={<VideoContent />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
