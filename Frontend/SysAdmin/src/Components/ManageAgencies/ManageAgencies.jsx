import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AddAgency from "../AddAgency/AddAgency";
import EditAgency from "../EditAgency/EditAgency";
import { addAgency, editAgency, deleteAgency, API_BASE_URL } from "../../api/api";
import "./ManageAgencies.css";

const ManageAgencies = () => {
  const [agencies, setAgencies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);

  // Fetch agencies from the backend when the component loads
  useEffect(() => {
    const loadAgencies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agency/all`); 
        const data = await response.json();
        setAgencies(data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      }
    };

    loadAgencies();
  }, []);

  const filteredAgencies = useMemo(() => {
    let filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "oldest":
        filtered.sort((a, b) => a.id - b.id);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    return filtered;
  }, [agencies, searchQuery, sortOption]);

  const handleAddAgency = async (newAgency) => {
    try {
      const addedAgency = await addAgency(newAgency); // Call the backend API
      setAgencies((prev) => [...prev, addedAgency]); // Update the state with the new agency
    } catch (error) {
      console.error("Error adding agency:", error);
      alert("Failed to add agency. Please try again.");
    }
  };

  const handleEditAgency = async (updatedAgency) => {
    try {
      const editedAgency = await editAgency(updatedAgency.id, updatedAgency); // Call the backend API
      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === updatedAgency.id ? editedAgency : agency
        )
      ); // Update the state with the edited agency
      setShowEditModal(false); // Close the edit modal
    } catch (error) {
      console.error("Error editing agency:", error);
      alert("Failed to edit agency. Please try again.");
    }
  };

  const handleDeleteClick = (agency) => {
    setAgencyToDelete(agency);
    setShowDeleteModal(true);
  };

  const confirmDeleteAgency = async () => {
    try {
      await deleteAgency(agencyToDelete.id); // Call the backend API
      setAgencies((prev) =>
        prev.filter((agency) => agency.id !== agencyToDelete.id)
      ); // Remove the agency from the state
      setShowDeleteModal(false); // Close the delete modal
      setAgencyToDelete(null); // Clear the selected agency
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert("Failed to delete agency. Please try again.");
    }
  };

  return (
    <div className="manage-agencies-container">
      <Sidebar />

      {showAddModal && (
        <AddAgency
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAgency}
        />
      )}

      {showEditModal && selectedAgency && (
        <EditAgency
          agencyData={selectedAgency}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditAgency}
        />
      )}

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the agency{" "}
              <strong>{agencyToDelete?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDeleteAgency}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="manage-agencies-main">
        <div className="header">
          <div className="title-actions">
            <h1>Manage Agencies</h1>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus"></i> Add Agency
            </button>
          </div>

          <div className="header-actions">
            <label className="sort-label">
              Sort By:
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </label>
            <input
              type="text"
              placeholder="Search agencies..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="agency-list grid">
          {filteredAgencies.map((agency) => (
            <div className="agency-card" key={agency.id}>
              <div className="agency-header">
                <div className="agency-logo-container">
                  <img
                    src={agency.logo}
                    alt={agency.name}
                    className="agency-logo"
                  />
                </div>
                <h3 className="agency-name">{agency.name}</h3>
              </div>

              <p className="agency-description">{agency.description}</p>
              <hr className="linebreak" />

              <div className="agency-contact">
                <p>
                  <i className="fas fa-envelope"></i> {agency.contact[1]}
                </p>
                <p>
                  <i className="fas fa-phone"></i> {agency.contact[0]}
                </p>
              </div>
              <hr className="linebreak" />

              <div className="agency-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setSelectedAgency(agency);
                    setShowEditModal(true);
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteClick(agency)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ManageAgencies;