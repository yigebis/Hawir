import React, { useState, useEffect } from "react";
import "../AddAgency/AddAgency.css";

const EditAgency = ({ agencyData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: agencyData.name || "",
    logo: agencyData.logo || "",
    description: agencyData.description || "",
    services: agencyData.services ? agencyData.services.join(", ") : "",
    contactEmail: agencyData.contact[1] || "", // Extract email from contact array
    contactPhone: agencyData.contact[0] || "", // Extract phone from contact array
    super_admin_email: agencyData.super_admin_email || "", // Pre-fill Super Admin Email
    password: "", // Leave blank for security reasons
  });

  const [errors, setErrors] = useState({});
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  });

  useEffect(() => {
    const pwd = formData.password;

    setPasswordValidations({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      digit: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.super_admin_email)
      newErrors.super_admin_email = "Super Admin Email is required.";
    if (formData.password) {
      const { length, upper, lower, digit, special } = passwordValidations;
      if (!(length && upper && lower && digit && special)) {
        newErrors.password = "Password does not meet all requirements.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updatedAgency = {
      id: agencyData.id, // Ensure the ID is preserved
      name: formData.name,
      logo: formData.logo,
      description: formData.description,
      services: formData.services
        ? formData.services.split(",").map((s) => s.trim())
        : [],
      contact: [formData.contactPhone, formData.contactEmail].filter(Boolean),
      super_admin_email: formData.super_admin_email,
      password: formData.password || undefined, // Only include if updated
    };

    onSave(updatedAgency);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Edit Agency</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Agency Name *"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
          />

          <input
            type="text"
            name="services"
            placeholder="Services (comma-separated, optional)"
            value={formData.services}
            onChange={handleChange}
          />

          <input
            type="email"
            name="contactEmail"
            placeholder="Contact Email (optional)"
            value={formData.contactEmail}
            onChange={handleChange}
          />

          <input
            type="text"
            name="contactPhone"
            placeholder="Contact Phone (optional)"
            value={formData.contactPhone}
            onChange={handleChange}
          />

          <input
            type="email"
            name="super_admin_email"
            placeholder="Super Admin Email *"
            value={formData.super_admin_email}
            onChange={handleChange}
          />
          {errors.super_admin_email && (
            <span className="error">{errors.super_admin_email}</span>
          )}

          <input
            type="password"
            name="password"
            placeholder="New Password (leave blank to keep current)"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="error">{errors.password}</span>}

          <ul className="password-rules">
            <li className={passwordValidations.length ? "valid" : ""}>
              Minimum 8 characters
            </li>
            <li className={passwordValidations.upper ? "valid" : ""}>
              At least one uppercase letter
            </li>
            <li className={passwordValidations.lower ? "valid" : ""}>
              At least one lowercase letter
            </li>
            <li className={passwordValidations.digit ? "valid" : ""}>
              At least one digit (0–9)
            </li>
            <li className={passwordValidations.special ? "valid" : ""}>
              At least one special character (!@#$...)
            </li>
          </ul>

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

export default EditAgency;
