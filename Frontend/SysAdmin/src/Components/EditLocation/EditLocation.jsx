import React, { useState, useEffect } from "react";
import "./EditLocation.css";
import { API_BASE_URL } from "../../api/api.jsx";
import { toast } from "react-toastify";

const EditLocation = ({ destinationData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: destinationData?.id || "",
    name: destinationData?.name || "",
    stations: destinationData?.stations || [],
    image: destinationData?.image || null,
  });
  const [preview, setPreview] = useState(destinationData?.image || null);

  useEffect(() => {
    if (destinationData) {
      setFormData({
        id: destinationData.id,
        name: destinationData.name || "",
        stations: destinationData.stations || [],
        image: destinationData.image || null,
      });
      setPreview(destinationData.image || null);
    }
  }, [destinationData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStationChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      stations: e.target.value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // Helper: Get Cloudinary preset and cloud name from backend
  const getCloudinaryPreset = async () => {
    const res = await fetch(`${API_BASE_URL}/destination/upload_preset`);
    if (!res.ok) throw new Error("Failed to get Cloudinary preset");
    return res.json();
  };

  // Helper: Upload image to Cloudinary
  const uploadToCloudinary = async (file, uploadPreset, cloudName) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) throw new Error("Failed to upload image to Cloudinary");
    return res.json(); // contains .secure_url
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = "";
    try {
      if (formData.image instanceof File) {
        const { cloud_name, upload_preset } = await getCloudinaryPreset();
        const uploadRes = await uploadToCloudinary(
          formData.image,
          upload_preset,
          cloud_name
        );
        imageUrl = uploadRes.secure_url;
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }
    } catch (err) {
      toast.error("Image upload failed: " + err.message);
      return;
    }

    const data = {
      name: formData.name || "",
      stations: Array.isArray(formData.stations)
        ? formData.stations.filter((s) => s && s.trim())
        : [],
      image: imageUrl || "",
    };

    fetch(`${API_BASE_URL}/destination/edit/${formData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            let errorMsg = `Failed to edit destination: ${response.status}`;
            try {
              const errObj = JSON.parse(text);
              if (errObj.error) errorMsg = errObj.error;
            } catch {}
            throw new Error(errorMsg);
          });
        }
        return response.json();
      })
      .then(() => {
        onSave(); // Only notify parent to refresh and close modal
      })
      .catch((error) => {
        toast.error(error.message);
      });
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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                marginTop: "8px",
              }}
            />
          )}
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
