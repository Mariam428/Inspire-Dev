import React from "react";
import Icons from "./Icons";
import "./SideBar.css"; 

const sidebarItems = [
  { title: "Dashboard", icon: "/icons/apartment_13534337.png" },
  { title: "Classes", icon: "/icons/books_18894128.png" },
  { title: "Resources", icon: "/icons/notes_4898396.png" }
];

const SideBar = () => {
  return (
    <div className="side-container">
      {/* Logo Section */}
      <div className="logo">
        <img src="light.png" alt="Logo" /> 
        <h2>InspireEdu</h2>
      </div>

      {/* Sidebar Items */}
      <div className="menu">
        {sidebarItems.map((item, index) => (
          <Icons key={index} path_title={item.title} icon_path={item.icon} />
        ))}
      </div>
    </div>
  );
};

export default SideBar;
