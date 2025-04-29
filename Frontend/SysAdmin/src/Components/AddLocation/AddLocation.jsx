import React, { useState } from "react";
import "./AddLocation.css";

const AddLocation = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    currentWeather: "",
    hotels: [],
    culture: "",
    history: "",
    people: "",
    population: "",
    touristAttractions: [],
    postDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Add New Location</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Location Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="desc"
            placeholder="Description"
            value={formData.desc}
            onChange={handleChange}
          />
          <input
            type="text"
            name="currentWeather"
            placeholder="Current Weather"
            value={formData.currentWeather}
            onChange={handleChange}
          />
          <input
            type="text"
            name="culture"
            placeholder="Culture"
            value={formData.culture}
            onChange={handleChange}
          />
          <input
            type="text"
            name="history"
            placeholder="History"
            value={formData.history}
            onChange={handleChange}
          />
          <input
            type="text"
            name="people"
            placeholder="People"
            value={formData.people}
            onChange={handleChange}
          />
          <input
            type="text"
            name="population"
            placeholder="Population"
            value={formData.population}
            onChange={handleChange}
          />
          <textarea
            name="touristAttractions"
            placeholder="Tourist Attractions (comma-separated)"
            value={formData.touristAttractions}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                touristAttractions: e.target.value.split(",").map((t) => t.trim()),
              }))
            }
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