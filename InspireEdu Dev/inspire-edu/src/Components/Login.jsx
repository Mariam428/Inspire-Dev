import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {          
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      
      // Store token, role, email
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", email);
      localStorage.setItem("name", data.name);
      
      // Store registration date (we'll need to modify the backend to include this)
      if (data.registrationDate) {
        localStorage.setItem("registrationDate", data.registrationDate);
      }
      
      // ✅ Fetch enrolled courses for the logged-in user
      const enrolledRes = await fetch(`http://localhost:5000/enrollments/${email}`);
      const enrolledData = await enrolledRes.json();
  
      if (enrolledRes.ok && Array.isArray(enrolledData)) {
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledData.map((course) => course?.courseId)));
      } else {
        console.error("Failed to fetch enrolled courses:", enrolledData.error);
      }
  
      // Redirect user based on role
      if (data.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/educator-dashboard");
      }
  
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
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="extra-options">
          <p>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} className="link">
              Register here
            </span>
          </p>
          <p>
            <span onClick={() => navigate("/forgot-password")} className="link">
              Forgot Password?
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
