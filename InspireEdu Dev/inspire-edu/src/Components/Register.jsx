import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");  // Added name field
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");  // Default to student

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
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
          <label>Name:</label>
          <div className="input-group">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <label>Email:</label>
          <div className="input-group">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <label>Password:</label>
          <div className="input-group">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <label>Confirm Password:</label>
          <div className="input-group">
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          {/* Role Selection */}
          <label>Register As:</label>
          <div className="input-group">
            <label>
              <input 
                type="radio" 
                value="student" 
                checked={role === "student"} 
                onChange={() => setRole("student")}
              /> Student
            </label>
            <label>
              <input 
                type="radio" 
                value="educator" 
                checked={role === "educator"} 
                onChange={() => setRole("educator")}
              /> Educator
            </label>
          </div>

          <button type="submit" className="login-btn">Register</button>
        </form>

        <p>Already have an account? <span onClick={() => navigate("/login")} className="link">Login</span></p>
      </div>
    </div>
  );
};

export default Register;
