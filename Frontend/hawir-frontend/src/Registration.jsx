import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Message from "./MessagePage";
import axios from "axios";
import "./Registration.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons from react-icons
import googleIcon from "./assets/Google_Icons-09-512.png";
import hawirLogo from "./assets/logo.jpg";

const Registration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    loginPreference: "email", // Default to email
    receiveUpdates: false,
  });

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for server response or error
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.loginPreference === "email" ? formData.email : "",
      phone_number:
        formData.loginPreference === "phone_number" ? formData.phoneNumber : "",
      password: formData.password,
      login_preference: formData.loginPreference,
      receive_updates: formData.receiveUpdates,
    };

    try {
      const response = await axios.post(
        "https://hawir-rv5k.onrender.com/api/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      // Redirect to MessagePage with a success message
      navigate("/message", {
        state: { type: "success", text: response.data.message },
      });
    } catch (err) {
      if (err.response) {
        // Handle responses from the server
        const status = err.response.status;
        const errorMessage =
          err.response.data?.error || "Unexpected server error";

        if (status === 409) {
          // Specific message for 409
          setError(errorMessage);
        } else if (status === 400) {
          // Bad request
          setError(errorMessage);
        } else {
          // Generic error for other statuses
          setError(errorMessage);
        }
      } else if (err.request) {
        // No response received (network issue)
        console.error("No response:", err.request);
        setError("Network error or server unreachable.");
      } else {
        // Other errors (like request setup issues)
        console.error("Error:", err.message);
        setError("An unexpected error occurred. Please try again.");
      }
      setMessage("");
    }
  };

  return (
    <div className="registration-container">
      <div className="logo">
        <img src={hawirLogo} alt="Hawir Logo" />
        <h1>HAWIR</h1>
      </div>
      <h2>Welcome Aboard! Register Now</h2>

      <div className="message">
        {message && <Message type="success" text={message} />}
        <div>{error && <p className="error-message">{error}</p>}</div>
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            className="form-control"
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Alemu"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            className="form-control"
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Kifle"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Registraton Preference</label>
          <select
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
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
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
              placeholder="+251"
              value={formData.phoneNumber}
              onChange={handleChange}
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
        <div className="form-checkbox">
          <input
            type="checkbox"
            id="receiveUpdates"
            name="receiveUpdates"
            checked={formData.receiveUpdates}
            onChange={handleChange}
          />
          <label htmlFor="receiveUpdates">
            I want to receive updates via email.
          </label>
        </div>
        <button type="submit" className="sign-up-btn">
          Sign up
        </button>

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
        <div className="signin-link">
          Already have an account? <Link to="/login">Sign in </Link>
        </div>
      </form>
    </div>
  );
};

export default Registration;
