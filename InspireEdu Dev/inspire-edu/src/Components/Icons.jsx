import React from "react";

const Icons = ({ path_title, icon_path }) => {
  return (
    <div className="icon-container">
      <img src={icon_path} alt={path_title} className="icon" />
      <h3>{path_title}</h3>
    </div>
  );
};

export default Icons;
