import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const agenciesPerPage = 6;

  const navigate = useNavigate();
  const location = useLocation();

  // Read page from URL on mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page"), 10);
    if (pageFromUrl && pageFromUrl > 0) {
      setCurrentPage(pageFromUrl);
    } else {
      setCurrentPage(1);
    }
    fetchAgencies();
    // eslint-disable-next-line
  }, [location]);

  // Update URL when page changes
  const setPageAndUrl = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() }, { replace: true });
  };

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agency/all`);
      const data = await response.json();
      setAgencies(data);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    }
    setLoading(false);
  };

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
      await addAgency(newAgency);
      fetchAgencies();
      setPageAndUrl(1); // Go to first page after add
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding agency:", error);
      alert("Failed to add agency. Please try again.");
    }
  };

  const handleEditAgency = async (updatedAgency) => {
    try {
      await editAgency(updatedAgency.id, updatedAgency);
      fetchAgencies(); // Refetch the list after editing
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
      fetchAgencies();
      setShowEditModal(false);
      setSelectedAgency(null);
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert("Failed to delete agency. Please try again.");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPageAndUrl(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPageAndUrl(currentPage + 1);
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
          {loading ? (
            <div className="loading-spinner" style={{ width: "100%", textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
            </div>
          ) : paginatedAgencies.length === 0 ? (
            <p>No agencies found.</p>
          ) : (
            paginatedAgencies.map((agency) => (
              <div className="agency-card" key={agency.id}>
                <div className="agency-header">
                  <div className="agency-logo-container">
                    {agency.logo ? (
                      <img
                        src={agency.logo}
                        alt={agency.name}
                        className="agency-logo"
                      />
                    ) : (
                      <div className="agency-logo-fallback">
                        {agency.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                  </div>
                  <h3 className="agency-name">{agency.name}</h3>
                </div>
                <span className="agency-id-chip">ID: {agency.id}</span>

                <p className="agency-description">{agency.description}</p>
                <hr className="linebreak" />

                <div className="agency-contact">
                  <p>
                    <i className="fas fa-envelope"></i>{" "}
                    {agency.contact && agency.contact[1] ? agency.contact[1] : "No email"}
                  </p>
                  <p>
                    <i className="fas fa-phone"></i>{" "}
                    {agency.contact && agency.contact[0] ? agency.contact[0] : "No phone"}
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
            ))
          )}
        </div>

        {/* Pagination controls: only show when not loading and there are agencies */}
        {!loading && paginatedAgencies.length > 0 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Spinner CSS */}
        <style>
          {`
            .spinner {
              border: 6px solid #f3f3f3;
              border-top: 6px solid #4caf50;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}
        </style>
      </main>
    </div>
  );
};

export default ManageAgencies;