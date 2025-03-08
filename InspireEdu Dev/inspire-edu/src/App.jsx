import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SideBar from "./Components/SideBar";
import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import Resources from "./Components/Resources";
import Lectures from "./Components/Lectures";
import LectureContent from "./Components/LectureContent";
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
