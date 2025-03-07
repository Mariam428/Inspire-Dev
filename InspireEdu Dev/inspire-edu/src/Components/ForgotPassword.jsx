import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleReset = (e) => {
    e.preventDefault();
    alert("Password reset link sent to " + email);
    navigate("/Login");
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="light.png" alt="Logo" className="logo-img" />
        <h2 className="logo-title">InspireEdu</h2>
      </div>

      <div className="login-card">
        <h2>Forgot Password</h2>
        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>          
          <button type="submit" className="login-btn">Reset Password</button>
        </form>
        <p>Remember your password? <span onClick={() => navigate("/Login")} className="link">Login</span></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
