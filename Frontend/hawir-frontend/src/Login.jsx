import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Message from "./MessagePage";
import axios from "axios";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons from react-icons
import googleIcon from "./assets/Google_Icons-09-512.png";
import hawirLogo from "./assets/logo.jpg";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginPreference: "email",
    email: "",
    phoneNumber: "",
    password: "",
  });

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for server response or error
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    const payload =
      formData.loginPreference === "email"
        ? { email: formData.email, password: formData.password }
        : { phone_number: formData.phoneNumber, password: formData.password };

    const endpoint =
      formData.loginPreference === "email"
        ? "https://hawir-rv5k.onrender.com/api/login/email"
        : "https://hawir-rv5k.onrender.com/api/login/phone";

    try {
      const response = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Redirect to MessagePage with a success message
      console.log("Token:", response.data.token); // Token can be used for further actions
      // <Link to={"/message"}></Link>;
      navigate("/");
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const errorMessage =
          err.response.data?.error || "Unexpected server error";

        
        console.error("Error:", err.message);
        setError(errorMessage);
      }
      setMessage("");
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
        <img src={hawirLogo} alt="Hawir Logo" />
        <h1>HAWIR</h1>
      </div>
      <h2>Welcome Back to Hawir!</h2>
      <div className="message">
        {message && <Message type="success" text={message} />}
        <div>{error && <p className="error-message">{error}</p>}</div>
      </div>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="loginPreference">Login Preference</label>
          <select
            id="loginPreference"
            className="form-control"
            name="loginPreference"
            value={formData.loginPreference}
            onChange={handleChange}
          >
            <option value="email">Email</option>
            <option value="phone_number">Phone Number</option>
          </select>
        </div>

        {formData.loginPreference === "email" && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              className="form-control"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
        )}

        {formData.loginPreference === "phone_number" && (
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              className="form-control"
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              className="form-control"
              type={showPassword ? "text" : "password"} // Toggle type based on visibility
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ paddingRight: "40px" }} // Add padding to avoid text overlap with icon
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle visibility state
              style={{
                position: "absolute",
                right: "10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-remember">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button type="submit" className="sign-in-btn">
          Sign in
        </button>

        <div className="forgot-password">
          <a href="#">Forgot your password?</a>
        </div>

        <div className="divider">or</div>
        <button
          type="button"
          className="google-sign-in"
          onClick={() => {
            window.location.href =
              "https://hawir-rv5k.onrender.com/auth/with/google";
          }}
        >
          <img src={googleIcon} alt="Google Icon" />
          Sign in with Google
        </button>
        <div className="signup-link">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
