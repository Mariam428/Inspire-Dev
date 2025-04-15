import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Create this CSS file for styling

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/courses");
        setAllCourses(response.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate educator course selection
    if (role === "educator" && selectedCourses.length === 0) {
      setError("Please select at least one course");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        name,
        email,
        password,
        role,
        educatorCourses: selectedCourses
      });
      
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <div className="role-options">
            <label>
              <input
                type="radio"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              Student
            </label>
            <label>
              <input
                type="radio"
                value="educator"
                checked={role === "educator"}
                onChange={() => setRole("educator")}
              />
              Educator
            </label>
          </div>
        </div>

        {role === "educator" && (
          <div className="form-group">
            <label>Select Your Courses:</label>
            <div className="course-selection">
              {allCourses.map(course => (
                <div key={course._id} className="course-option">
                  <input
                    type="checkbox"
                    id={`course-${course._id}`}
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => toggleCourseSelection(course._id)}
                  />
                  <label htmlFor={`course-${course._id}`}>
                    {course.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn">Register</button>
      </form>
    </div>
  );
};

export default Register;