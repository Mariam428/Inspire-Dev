import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);
    alert("Registration successful! You can now log in.");
    navigate("/Login");
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="light.png" alt="Logo" className="logo-img" />
        <h2 className="logo-title">InspireEdu</h2>
      </div>

      <div className="login-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Confirm Password:</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn">Register</button>
        </form>

        <p>Already have an account? <span onClick={() => navigate("/Login")} className="link">Login</span></p>
      </div>
    </div>
  );
};

export default Register;
