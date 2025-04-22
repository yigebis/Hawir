import React, { useState, useMemo } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AddAgency from "../AddAgency/AddAgency";
import EditAgency from "../EditAgency/EditAgency";
import "./ManageAgencies.css";

const ManageAgencies = ({ agencies, setAgencies }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [undoAvailable, setUndoAvailable] = useState(false); //  new state

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

  const handleAddAgency = (newAgency) => {
    const agencyWithId = { ...newAgency, id: Date.now() };
    setAgencies((prev) => [...prev, agencyWithId]);
  };

  const handleEditClick = (agency) => {
    setSelectedAgency(agency);
    setShowEditModal(true);
  };

  const handleEditAgency = (updatedAgency) => {
    setAgencies((prev) =>
      prev.map((agency) =>
        agency.id === updatedAgency.id
          ? { ...agency, ...updatedAgency }
          : agency
      )
    );
    setShowEditModal(false);
  };

  const handleDeleteClick = (agency) => {
    setAgencyToDelete(agency);
    setShowDeleteModal(true);
  };

  const confirmDeleteAgency = () => {
    setShowDeleteModal(false);

    // Remove the agency
    const updatedAgencies = agencies.filter(
      (agency) => agency.id !== agencyToDelete.id
    );
    setAgencies(updatedAgencies);

    setUndoAvailable(true); //  enable undo
    const timeout = setTimeout(() => {
      setAgencyToDelete(null); // Finalize deletion
      setUndoAvailable(false); // Hide undo after timeout
    }, 5000);

    setUndoTimeout(timeout);
  };

  const undoDeleteAgency = () => {
    clearTimeout(undoTimeout);
    setAgencies((prev) => [...prev, agencyToDelete]);
    setAgencyToDelete(null);
    setUndoAvailable(false); //  reset undo
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setAgencyToDelete(null); //  cancel clears state
                  setUndoAvailable(false); //  prevent undo
                }}
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

      {undoAvailable && agencyToDelete && (
        <div className="undo-notification">
          <p>
            Agency <strong>{agencyToDelete.name}</strong> deleted.{" "}
            <button onClick={undoDeleteAgency}>Undo</button>
          </p>
        </div>
      )}

      <main className="manage-agencies-main">
        <div className="header">
          <div className="dashboard-title-actions">
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
                  onClick={() => handleEditClick(agency)}
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
