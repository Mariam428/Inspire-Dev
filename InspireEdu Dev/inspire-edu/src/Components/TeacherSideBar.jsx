import React from "react";
import { NavLink } from "react-router-dom";
import Icons from "./Icons";
import "./SideBar.css";

const sidebarItems = [
  { title: "Dashboard", icon: "/icons/apartment_13534337.png", path: "/educator-dashboard" },
  { title: "Classes", icon: "/icons/books_18894128.png", path: "/classes" },
  { title: "Resources", icon: "/icons/notes_4898396.png", path: "/resources" }
];

const TeacherSideBar = () => {
  const userEmail = localStorage.getItem("userEmail");

  // Add "Add Course" for admin only
  const fullSidebar = [...sidebarItems];
  if (userEmail === "admin@gmail.com") {
    fullSidebar.push({
      title: "Add Course",
      icon: "/icons/plus_8001591.png",
      path: "/Add-Course"
    });
  }

  return (
    <div className="side-container">
      {/* Logo Section */}
      <div className="logo">
        <img src="light.png" alt="Logo" />
        <h2>InspireEdu</h2>
      </div>

      {/* Sidebar Items with Navigation */}
      <div className="menu">
        {fullSidebar.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
          >
            <Icons path_title={item.title} icon_path={item.icon} />
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default TeacherSideBar;
