import { useState } from "react"
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Login = () => {
  const navigate = useNavigate(); // Add this line to use navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    
    // Simple login logic (replace with your actual authentication)
    if (email && password) {
      // Simulate successful login
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard'); // Navigate to dashboard after login
    } else {
      alert('Please enter email and password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;