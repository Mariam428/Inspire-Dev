import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);

    if (email && password) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      alert('Please enter email and password');
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
