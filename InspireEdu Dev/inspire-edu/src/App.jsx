import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SideBar from "./Components/SideBar";
import StudentDashboard from "./Components/Student-Dashboard/Dashboard";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Resources from "./Components/Resources";
import Lectures from "./Components/Lectures";
import LectureContent from "./Components/LectureContent"; 
import Setup from "./Components/study-plan/weeklyplan";
import Grades from "./Components/study-plan/grades";
import Availability from "./Components/study-plan/availability";
import Schedule from "./Components/study-plan/schedule";
import EducatorDashboard from "./Components/Teacher-Dashboard/TeacherDashboard"; 
import ProtectedRoute from "./Components/ProtectedRoute"; 
import TeacherSidebar from "./Components/TeacherSideBar";
import LectureResources from "./Components/LectureResources";import Classes from "./Components/Classes";
import Videos from "./Components/Videos";
import VideoContent from "./Components/VideoContent";
import Courses from "./Components/Courses";
import AddCourses from "./Components/AddCourse";
import Performance from "./Components/Performance";
import Popup from "./Components/PopUp";


import "./App.css";     

function Layout() {
  const location = useLocation();
  
  // Hide sidebar on certain routes
  const hideSidebarRoutes = ["/login", "/register", "/forgot-password"];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname.toLowerCase());

  // Get user role from localStorage
  const userRole = localStorage.getItem("role");  

  return (
    <div className="app-container">
      {/* Show Sidebar only on specific routes */}
      {showSidebar && (
        <div className="sidebar">
          {userRole === "educator" ? <TeacherSidebar /> : <SideBar />}
        </div>
      )}
      <div className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/lectures/:subjectName" element={<Lectures />} />
          <Route path="/lecture-content/:subjectName/:lectureName" element={<LectureResources />} />
          <Route path="/study-plan/weeklyplan" element={<Setup />} />
          <Route path="/study-plan/grades" element={<Grades />} />
          <Route path="/study-plan/availability" element={<Availability />} />
          <Route path="/study-plan/schedule" element={<Schedule />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/videos/:subjectName" element={<Videos />} />
          <Route path="/video-content/:subjectName/:videoName" element={<VideoContent />} />
          <Route path="/Register-Course" element={<Courses />} />
          <Route path="/Add-Course" element={<AddCourses />} />
          <Route path="/Performance" element={<Performance/>} />
          


          {/* Protected Routes for Students */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Protected Routes for Educators */}
          <Route element={<ProtectedRoute allowedRoles={["educator"]} />}>
            <Route path="/educator-dashboard" element={<EducatorDashboard />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
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