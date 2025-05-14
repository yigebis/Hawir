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
  const [currentPage, setCurrentPage] = useState(1);
  const agenciesPerPage = 6;

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
      (agency.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
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

  const paginatedAgencies = useMemo(() => {
    const startIndex = (currentPage - 1) * agenciesPerPage;
    const endIndex = startIndex + agenciesPerPage;
    return filteredAgencies.slice(startIndex, endIndex);
  }, [filteredAgencies, currentPage, agenciesPerPage]);

  const totalPages = Math.ceil(filteredAgencies.length / agenciesPerPage);

  const handleAddAgency = async (newAgency) => {
    try {
      const agencyWithDefaults = {
        ...newAgency,
        contact: newAgency.contact || ["", ""],
      };

      const addedAgency = await addAgency(agencyWithDefaults);
      setAgencies((prev) => [...prev, addedAgency]);
    } catch (error) {
      console.error("Error adding agency:", error);
      alert("Failed to add agency. Please try again.");
    }
  };

  const handleEditAgency = async (updatedAgency) => {
    try {
      const editedAgency = await editAgency(updatedAgency.id, updatedAgency);
      setAgencies((prev) =>
        prev.map((agency) =>
          agency.id === updatedAgency.id ? editedAgency : agency
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error editing agency:", error);
      alert("Failed to edit agency. Please try again.");
    }
  };

  const handleDeleteClick = (agency) => {
    setSelectedAgency(agency);
    setShowEditModal(true);
  };

  const confirmDeleteAgency = async () => {
    try {
      await deleteAgency(selectedAgency.id);
      setAgencies((prev) =>
        prev.filter((agency) => agency.id !== selectedAgency.id)
      );
      setShowEditModal(false);
      setSelectedAgency(null);
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
          {paginatedAgencies.map((agency) => (
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
              </div>
            </div>
          ))}
          {paginatedAgencies.length === 0 && <p>No agencies found.</p>}
        </div>

        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default ManageAgencies;