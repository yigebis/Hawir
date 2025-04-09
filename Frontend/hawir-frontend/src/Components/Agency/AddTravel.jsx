import React, { useState } from "react";
import "../../Styles/Agency/AddTravel.css";

const AddTravel = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Trip</h2>

        {/* Trip Information */}
        <div className="section-title">
          Trip Information <span className="required">*Required</span>
        </div>
        <form>
          <div className="form-row">
            <div className="form-group">
              <label>Trip ID</label>
              <input type="text" placeholder="Enter Trip ID" />
            </div>
            <div className="form-group">
              <label>Beginning Location *</label>
              <input type="text" placeholder="Select departure city" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Destination *</label>
              <input type="text" placeholder="Select arrival city" />
            </div>
            <div className="form-group">
              <label>Departure Date *</label>
              <input type="date" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Departure Time *</label>
              <input type="time" />
            </div>
            <div className="form-group">
              <label>Arrival Time *</label>
              <input type="time" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (ETB) *</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Terminal</label>
              <input type="text" placeholder="Select starting terminal" />
            </div>
          </div>

          {/* Trip Status & Driver Details */}
          <div className="section-title">Trip Status & Driver Details</div>
          <div className="form-row">
            <div className="form-group">
              <label>Status *</label>
              <select>
                <option>Upcoming</option>
                <option>Ongoing</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Driver *</label>
              <select>
                <option>Select driver</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Car Number *</label>
              <input type="text" placeholder="Select vehicle" />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input type="text" value="VIP Service" readOnly />
            </div>
          </div>

          {/* Passenger & Bus Information */}
          <div className="section-title">Passenger & Bus Information</div>
          <div className="form-row">
            <div className="form-group">
              <label>Bus Type *</label>
              <select>
                <option>Select bus type</option>
              </select>
            </div>
            <div className="form-group">
              <label>Passenger Count</label>
              <div className="passenger-count">
                <div className="counter">
                  <button type="button">-</button>
                  <input type="text" readOnly />
                  <button type="button">+</button>
                  <span>/0 seats</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discount Options */}
          <div className="section-title">Discount Options</div>
          <div className="form-group discount-option">
            <input type="checkbox" id="enableDiscount" />
            <label htmlFor="enableDiscount">Enable Discount</label>
          </div>

          {/* Buttons */}
          <div className="button-group">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTravel;
