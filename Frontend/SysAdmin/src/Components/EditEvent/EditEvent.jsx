import React, { useState } from "react";
import "./EditEvent.css";
import { API_BASE_URL } from "../../api/api";

const EditEvent = ({ eventData, destinations = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: eventData.title || "",
    desc: eventData.desc || "",
    destination_id: eventData.destination_id || "",
    date: eventData.date ? eventData.date.split("T")[0] : "",
    media_link: eventData.media_link || "",
    mediaFile: null,
  });

  const [preview, setPreview] = useState(eventData.media_link || null);

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
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Helper: Get Cloudinary preset and cloud name from backend
  const getCloudinaryPreset = async () => {
    const res = await fetch(`${API_BASE_URL}/event/upload_preset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to get Cloudinary preset");
    return res.json();
  };

  // Helper: Upload image to Cloudinary
  const uploadToCloudinary = async (file, uploadPreset, cloudName) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    if (!res.ok) throw new Error("Failed to upload image to Cloudinary");
    return res.json(); // contains .secure_url
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.desc ||
      !formData.destination_id ||
      !formData.date
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    let mediaLink = formData.media_link;

    // If a new file is selected, upload to Cloudinary
    if (formData.mediaFile) {
      try {
        const { cloud_name, upload_preset } = await getCloudinaryPreset();
        const uploadRes = await uploadToCloudinary(
          formData.mediaFile,
          upload_preset,
          cloud_name
        );
        mediaLink = uploadRes.secure_url;
      } catch (err) {
        alert("Image upload failed: " + err.message);
        return;
      }
    }

    // Prepare form data for backend
    const backendForm = new FormData();
    backendForm.append("id", eventData.id || eventData._id);
    backendForm.append("title", formData.title);
    backendForm.append("desc", formData.desc);
    backendForm.append("destination_id", formData.destination_id);
    backendForm.append("date", formData.date);
    backendForm.append("media_link", mediaLink);

    onSave(backendForm);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>{eventData.id ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Name *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="desc">Description *</label>
            <textarea
              id="desc"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Enter event description"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="destination_id">Destination *</label>
            <select
              id="destination_id"
              name="destination_id"
              value={formData.destination_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a destination</option>
              {destinations.map((dest) => (
                <option key={dest.id || dest._id} value={dest.id || dest._id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {eventData.id ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
