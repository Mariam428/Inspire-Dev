import React, { useEffect } from "react";

const Popup = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`popup ${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>✖</button>
    </div>
  );
};

export default Popup;
