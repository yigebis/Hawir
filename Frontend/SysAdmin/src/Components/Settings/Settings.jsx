import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { API_BASE_URL } from "../../api/api";
import "./Settings.css"; // Assuming CSS remains largely the same

const Settings = () => {
  const navigate = useNavigate();

  // State for password change form (updated for two passwords)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [oldPassword2, setOldPassword2] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [confirmNewPassword2, setConfirmNewPassword2] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSectionClick = (section) => {
    // Navigation logic remains the same
    if (section === "deleteAgencies") {
      navigate("/settings/deleteagencies");
    } else if (section === "deleteEvents") {
      navigate("/settings/deleteevents");
    } else if (section === "deleteLocations") {
      navigate("/settings/deletelocations");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    // Validate form inputs
    if (
      !oldPassword ||
      !newPassword ||
      !confirmNewPassword ||
      !oldPassword2 ||
      !newPassword2 ||
      !confirmNewPassword2
    ) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New first password and confirmation do not match.");
      return;
    }

    if (newPassword2 !== confirmNewPassword2) {
      setError("New second password and confirmation do not match.");
      return;
    }

    // password complexity validation 

    try {
      const response = await fetch(`${API_BASE_URL}/admin/password/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include token
        },
        // Send the data structure expected by the backend
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          old_password2: oldPassword2,
          new_password2: newPassword2,
        }),
      });

      if (!response.ok) {
        // Try to get error details from the backend response
        let errorMessage = "Failed to change passwords.";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage; // Use backend error if available
        } catch (jsonError) {
          // Ignore error if response is not JSON or empty
          console.error("Failed to parse error response:", jsonError);
        }
        throw new Error(errorMessage);
      }

      setSuccess("Passwords changed successfully.");
      setError(""); // Clear error on success

      // Clear all input fields
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setOldPassword2("");
      setNewPassword2("");
      setConfirmNewPassword2("");
    } catch (err) {
      // Display the error message from validation or API call
      setError(err.message);
      setSuccess(""); // Clear success message on error
    }
  };

  return (
    <div className="settings-container">
      <Sidebar />
      <main className="settings-main">
        <h1>Settings</h1>

        {/* Password Change Section - Updated for Two Passwords */}
        <div className="password-change-section">
          <h2>Change Admin Passwords</h2>
          <form
            onSubmit={handlePasswordChange}
            className="password-change-form"
          >
            {/* First Password Fields */}
            <h4 className="password-group-header">First Password Set</h4>
            <input
              type="password"
              placeholder="Current First Password (old_password)"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              aria-label="Current First Password" // Accessibility
            />
            <input
              type="password"
              placeholder="New First Password (new_password)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-label="New First Password" // Accessibility
            />
            <input
              type="password"
              placeholder="Confirm New First Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              aria-label="Confirm New First Password" // Accessibility
            />

            {/* Second Password Fields */}
            <h4 className="password-group-header">Second Password Set</h4>
            <input
              type="password"
              placeholder="Current Second Password (old_password2)"
              value={oldPassword2}
              onChange={(e) => setOldPassword2(e.target.value)}
              aria-label="Current Second Password" // Accessibility
            />
            <input
              type="password"
              placeholder="New Second Password (new_password2)"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              aria-label="New Second Password" // Accessibility
            />
            <input
              type="password"
              placeholder="Confirm New Second Password"
              value={confirmNewPassword2}
              onChange={(e) => setConfirmNewPassword2(e.target.value)}
              aria-label="Confirm New Second Password" // Accessibility
            />

            {/* Messages and Submit Button */}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <button type="submit" className="save-btn">
              Change Passwords
            </button>
          </form>
        </div>

        

        <div className="danger-zone">
          <h2>Danger Zone</h2>
          <p>Be careful! These actions cannot be undone.</p>
          <div className="danger-buttons">
            <button
              className="danger-btn"
              onClick={() => handleSectionClick("deleteAgencies")}
            >
              Delete Agencies
            </button>
            <button
              className="danger-btn"
              onClick={() => handleSectionClick("deleteEvents")}
            >
              Delete Events
            </button>
            <button
              className="danger-btn"
              onClick={() => handleSectionClick("deleteLocations")}
            >
              Delete Locations
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
