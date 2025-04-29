import React, { useState, useEffect } from "react";
import "./AddAgency.css";

const AddAgency = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    services: "",
    contactEmail: "",
    contactPhone: "",
    super_admin_email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  });

  // Real-time password validation
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
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else {
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

    const newAgency = {
      name: formData.name,
      services: formData.services
        ? formData.services.split(",").map((s) => s.trim())
        : [],
      description: formData.description,
      contact: [formData.contactPhone, formData.contactEmail].filter(Boolean),
      super_admin_email: formData.super_admin_email,
      password: formData.password,
    };

    onSave(newAgency); // Call the onSave function passed from ManageAgencies
    onClose(); // Close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Add New Agency</h2>
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
            placeholder="Contact Email"
            value={formData.contactEmail}
            onChange={handleChange}
          />

          <input
            type="text"
            name="contactPhone"
            placeholder="Contact Phone"
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
            placeholder="Password *"
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

export default AddAgency;
