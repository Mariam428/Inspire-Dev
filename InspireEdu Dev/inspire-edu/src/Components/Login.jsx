import { useState, useEffect } from "react";
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

      // Store user details in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", email);
      localStorage.setItem("name", data.name);
      localStorage.setItem("userId", data.userId);

      // Store registration date
      if (data.registrationDate) {
        localStorage.setItem("registrationDate", data.registrationDate);
      }

      // ✅ Calculate week number and store it
      if (data.registrationDate) {
        const regDate = new Date(data.registrationDate);
        const today = new Date();
        const timeDiff = today - regDate;
        const weeksSinceRegistration = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000)) + 1;

        localStorage.setItem("weekNumber", weeksSinceRegistration);
      }

      // ✅ Fetch enrolled courses
      const enrolledRes = await fetch(`http://localhost:5000/enrollments/${email}`);
      const enrolledData = await enrolledRes.json();
      if (enrolledRes.ok && Array.isArray(enrolledData)) {
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(enrolledData.map((course) => course?.courseId))
        );
      } else {
        console.error("Failed to fetch enrolled courses:", enrolledData.error);
      }

      const userId = data.userId;
const weekNumber = parseInt(localStorage.getItem("weekNumber"));

// ✅ Fetch previous week grades only if weekNumber > 1
if (weekNumber > 1) {
  const prevGradesRes = await fetch(
    `http://localhost:5000/get-quiz-grades?userId=${userId}&weekNumber=${weekNumber - 1}`
  );
  const prevGradesData = await prevGradesRes.json();

  if (prevGradesRes.ok) {
    console.log("✅ Previous Week Quiz Grades:", prevGradesData);
    localStorage.setItem("quizGrades", JSON.stringify(prevGradesData));
  } else {
    console.warn("⚠️ No quiz grades found for previous week:", prevGradesData.error);
  }
}else { console.log(" NO Previous Week Quiz Grades:");}

// ✅ Fetch current week grades (for dashboard)
const currentGradesRes = await fetch(
  `http://localhost:5000/get-quiz-grades?userId=${userId}&weekNumber=${weekNumber}`
);
const currentGradesData = await currentGradesRes.json();

if (currentGradesRes.ok) {
  console.log("✅ Current Week Quiz Grades:", currentGradesData);
  localStorage.setItem("currentquizGrades", JSON.stringify(currentGradesData));
} else {
  console.warn("⚠️ No quiz grades found for current week:", currentGradesData.error);
}

      
      // Navigate based on role
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
