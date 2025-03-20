import React from "react";
import { NavLink } from "react-router-dom";
import Icons from "./Icons";
import "./SideBar.css";

const sidebarItems = [
  { title: "Dashboard", icon: "/icons/apartment_13534337.png", path: "/dashboard" },
  { title: "Classes", icon: "/icons/books_18894128.png", path: "/classes" },
  { title: "Resources", icon: "/icons/notes_4898396.png", path: "/resources" },
  { title: "Study Plan", icon: "/icons/task_2098313.png", path: "/study-plan/weeklyplan" },
  // { title: "Chat", icon: "/icons/chat_589708.png", path: "/chat" },
  { title: "Performance", icon: "/icons/graph_2815158.png", path: "/Performance" },
  {title: "Course Registeration", icon: "/icons/resume_14354165.png", path: "/Register-Course" }
];

const SideBar = () => {
  return (
    <div className="side-container">
      {/* Logo Section */}
      <div className="logo">
        <img src="light.png" alt="Logo" />
        <h2>InspireEdu</h2>
      </div>

      {/* Sidebar Items with Navigation */}
      <div className="menu">
        {sidebarItems.map((item, index) => (
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

export default SideBar;
