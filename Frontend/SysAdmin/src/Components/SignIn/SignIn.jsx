import React, { useState } from "react";
import "./SignIn.css";
import googleIcon from "../../assets/Google_Icons-09-512.png";
import hawirLogo from "../../assets/logo.jpg";
import { adminLogin } from "../../api/api"; 
import { useNavigate } from "react-router-dom"; // For navigation

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password || !password2) {
      setError("All fields are required.");
      return;
    }

    try {
      // Call the backend API
      const response = await adminLogin({ email, password, password2 });

      console.log("Backend Response:", response); // Log the response for debugging

      if (response.token) {
        // Save the token
        sessionStorage.setItem("token", response.token);

        // Navigate to the dashboard
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="logo-container">
        <img src={hawirLogo} alt="SysAdmin Logo" />
        <h2>HAWIR</h2>
      </div>

      <h3>Welcome Back!</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password 1</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password2">Password 2</label>
          <input
            type="password"
            id="password2"
            name="password2"
            placeholder="••••••••"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="checkbox-group">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button type="submit" className="login-button">
          Sign In
        </button>

        <div className="divider">or</div>

        <button type="button" className="google-button">
          <img src={googleIcon} alt="Google Logo" />
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default SignIn;
