import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import AddLocation from "../AddLocation/AddLocation";
import EditLocation from "../EditLocation/EditLocation";
import "./ManageLocations.css";
import harar from "../../assets/harar.jpeg";
import { API_BASE_URL } from "../../api/api";

const ManageLocations = () => {
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [deletedDestination, setDeletedDestination] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const locationsPerPage = 6; // Number of locations per page
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all destinations on component mount
    fetch(`${API_BASE_URL}/destination/all`)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Failed to fetch destinations: ${response.status} - ${text}`
            );
          });
        }
        return response.json();
      })
      .then((data) => setDestinations(data))
      .catch((error) => console.error("Error fetching destinations:", error));
  }, []);

  const handleAddDestination = (newDestination) => {
    fetch(`${API_BASE_URL}/destination/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDestination),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Failed to add destination: ${response.status} - ${text}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        // Ensure the response contains the required fields
        if (!data.id || !data.name || !data.stations) {
          console.error("Invalid response from server:", data);
          return;
        }

        setDestinations((prev) => [...prev, data]);
        setShowAddModal(false);
      })
      .catch((error) => console.error("Error adding destination:", error));
  };

  const handleEditDestination = (updatedDestination) => {
    fetch(`${API_BASE_URL}/destination/edit/${updatedDestination.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDestination),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Failed to edit destination: ${response.status} - ${text}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        setDestinations((prev) =>
          prev.map((dest) => (dest.id === data.id ? data : dest))
        );
        setShowEditModal(false);
      })
      .catch((error) => console.error("Error editing destination:", error));
  };

  const handleDeleteClick = (destination) => {
    setSelectedDestination(destination);
    setShowDeleteModal(true);
  };

  const confirmDeleteDestination = () => {
    setShowDeleteModal(false);

    fetch(`${API_BASE_URL}/destination/delete/${selectedDestination.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Failed to delete destination: ${response.status} - ${text}`
            );
          });
        }
        // No need to parse JSON for a successful DELETE, might return empty or a message
        return response.text(); // Or response.json() if your backend returns JSON on delete
      })
      .then(() => {
        const updatedDestinations = destinations.filter(
          (dest) => dest.id !== selectedDestination.id
        );
        setDestinations(updatedDestinations);
        setDeletedDestination(selectedDestination);
        setUndoAvailable(true);
        const timeout = setTimeout(() => {
          setDeletedDestination(null);
          setUndoAvailable(false);
        }, 5000);
        setUndoTimeout(timeout);
        setSelectedDestination(null);
      })
      .catch((error) => console.error("Error deleting destination:", error));
  };

  const undoDeleteDestination = () => {
    clearTimeout(undoTimeout);
    fetch(`${API_BASE_URL}/destination/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deletedDestination),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `Failed to undo delete: ${response.status} - ${text}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        setDestinations((prev) => [...prev, data]);
        setDeletedDestination(null);
        setUndoAvailable(false);
      })
      .catch((error) => console.error("Error undoing delete:", error));
  };

  const filteredDestinations = useMemo(() => {
    let filtered = destinations;

    if (searchQuery) {
      filtered = filtered.filter((dest) =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // Assuming your backend handles sorting by date if needed
        break;
    }

    return filtered;
  }, [destinations, searchQuery, sortOption]);

  const paginatedDestinations = useMemo(() => {
    const startIndex = (currentPage - 1) * locationsPerPage;
    const endIndex = startIndex + locationsPerPage;
    return filteredDestinations.slice(startIndex, endIndex);
  }, [filteredDestinations, currentPage, locationsPerPage]);

  const totalPages = Math.ceil(filteredDestinations.length / locationsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="manage-locations-container">
      <Sidebar />

      <div className="manage-locations-content">
        <header className="locations-header">
          <h1>Manage Destinations</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            Add Destination
          </button>
        </header>

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
            placeholder="Search destinations..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="locations-list">
          {paginatedDestinations.map((destination) => (
            <div className="location-card" key={destination.id}>
              <div className="location-image">
                <img src={harar} alt={destination.name} />{" "}
                {/* Consider dynamic images */}
              </div>
              <div className="location-details">
                <h3 className="location-name">{destination.name}</h3>
                {destination.stations && (
                  <p className="location-info">
                    <strong>Stations:</strong> {destination.stations.join(", ")}
                  </p>
                )}
                <div className="location-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedDestination(destination);
                      setShowEditModal(true);
                    }}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    className="view-more-btn"
                    onClick={() =>
                      navigate(`/location-details/${destination.id}`)
                    }
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>
          ))}
          {paginatedDestinations.length === 0 && <p>No destinations found.</p>}
        </div>

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

        {showAddModal && (
          <AddLocation
            onClose={() => setShowAddModal(false)}
            onSave={handleAddDestination}
          />
        )}

        {showEditModal && selectedDestination && (
          <EditLocation
            destinationData={selectedDestination}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditDestination}
          />
        )}

        {showDeleteModal && (
          <div className="delete-modal">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>
                Are you sure you want to delete the destination{" "}
                <strong>{selectedDestination?.name}</strong>?
              </p>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={confirmDeleteDestination}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {undoAvailable && deletedDestination && (
          <div className="undo-notification">
            <p>
              Destination <strong>{deletedDestination.name}</strong> deleted.{" "}
              <button onClick={undoDeleteDestination}>Undo</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLocations;
