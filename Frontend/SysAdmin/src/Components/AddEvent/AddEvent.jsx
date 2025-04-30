import React, { useState } from "react";
import "./AddEvent.css";

const AddEvent = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "Educational & Business",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.location || !formData.startDate) {
      alert("Please fill in all required fields.");
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...formData,
    };

    onSave(newEvent); // Pass the new event data to the parent component
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Add New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3" // Limit the textarea size
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Educational & Business">Educational & Business</option>
              <option value="IT and Technology">IT and Technology</option>
              <option value="Sports & Fitness">Sports & Fitness</option>
              <option value="Cultural & Arts">Cultural & Arts</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
