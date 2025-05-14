import React, { useState } from "react";
import "./AddLocation.css";
import { API_BASE_URL } from "../../api/api.jsx";

const AddLocation = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    stations: [], // Initialize as an empty array
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStationChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      stations: e.target.value.split(",").map((s) => s.trim()),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const destination = {
      name: formData.name,
      stations: formData.stations,
    };
    console.log("Submitting destination:", destination); // Debugging
    fetch(`${API_BASE_URL}/destination/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(destination),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:", data); // Debugging
        onSave(data);
        onClose();
      })
      .catch((error) => console.error("Error adding destination:", error));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Add New Destination</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Destination Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="stations"
            placeholder="Stations (comma-separated)"
            value={formData.stations.join(", ")}
            onChange={handleStationChange}
          />
          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocation;