import React, { useState, useEffect } from "react";
import "./EditLocation.css";

const EditLocation = ({ destinationData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: destinationData?.id || "", // Ensure ID is included
    name: destinationData?.name || "",
    stations: destinationData?.stations || [],
  });

  useEffect(() => {
    if (destinationData) {
      setFormData({
        id: destinationData.id,
        name: destinationData.name || "",
        stations: destinationData.stations || [],
      });
    }
  }, [destinationData]);

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
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Edit Destination</h2>
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

export default EditLocation;
