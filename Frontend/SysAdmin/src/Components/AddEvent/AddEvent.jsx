import React, { useState, useEffect } from "react";
import "./AddEvent.css";
import { API_BASE_URL } from "../../api/api";

const AddEvent = ({ onClose, onSave, destinations = [] }) => {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    destination_id: "",
    date: "",
    media_link: "",
    mediaFile: null,
  });
  const [errors, setErrors] = useState({});
  const [uploadConfig, setUploadConfig] = useState({
    cloud_name: "",
    upload_preset: "",
  });
  const [preview, setPreview] = useState(null);

  // Fetch Cloudinary upload preset from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/event/upload_preset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUploadConfig({
          cloud_name: data.cloud_name,
          upload_preset: data.upload_preset,
        });
      })
      .catch((err) => console.error("Failed to fetch upload preset:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      if (files && files[0]) {
        const file = files[0];
        setFormData((prev) => ({
          ...prev,
          mediaFile: file,
        }));
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${uploadConfig.cloud_name}/image/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadConfig.upload_preset);

    const res = await fetch(url, {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.desc) newErrors.desc = "Description is required.";
    if (formData.desc && formData.desc.length < 10)
      newErrors.desc = "Description must be at least 10 characters.";
    if (!formData.destination_id)
      newErrors.destination_id = "Destination is required.";
    if (!formData.date) newErrors.date = "Date is required.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.date && new Date(formData.date) < today) {
      newErrors.date = "Date cannot be before today.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Upload image(s) to Cloudinary and get URL(s)
    let mediaLink = formData.media_link;
    if (formData.mediaFile) {
      try {
        mediaLink = await uploadToCloudinary(formData.mediaFile);
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }

    // Format date
    const formattedDate = new Date(formData.date).toISOString().split("T")[0];

    // Submit to backend (you may change this to JSON if needed)
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("desc", formData.desc);
    payload.append("destination_id", formData.destination_id);
    payload.append("date", formattedDate);
    payload.append("media_link", mediaLink);

    onSave(payload); // send to backend
    onClose(); // close modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Add New Event</h2>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              required
            />
            {errors.desc && <p className="error">{errors.desc}</p>}
          </div>

          {/* Destination */}
          <div className="form-group">
            <label htmlFor="destination_id">Destination</label>
            <select
              id="destination_id"
              name="destination_id"
              value={formData.destination_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Destination</option>
              {destinations.map((dest) => (
                <option key={dest._id || dest.id} value={dest._id || dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>
            {errors.destination_id && (
              <p className="error">{errors.destination_id}</p>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date">Event Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            {errors.date && <p className="error">{errors.date}</p>}
          </div>

          {/* Media Upload */}
          <div className="form-group">
            <label htmlFor="media">Event Image</label>
            <input
              type="file"
              id="media"
              name="media"
              accept="image/*"
              onChange={handleChange}
            />
            {(preview || formData.media_link) && (
              <div className="media-preview">
                <p>Current Image:</p>
                <img
                  src={
                    preview
                      ? preview
                      : formData.media_link
                      ? formData.media_link.includes("/upload/")
                        ? formData.media_link.replace(
                            "/upload/",
                            "/upload/f_auto,q_auto/"
                          )
                        : formData.media_link
                      : "/placeholder.jpg"
                  }
                  alt={formData.title || "Event Image"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    marginTop: "10px",
                    display: "block",
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;
