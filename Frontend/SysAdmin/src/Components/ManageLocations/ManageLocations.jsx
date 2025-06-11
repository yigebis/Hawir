import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import AddLocation from "../AddLocation/AddLocation";
import EditLocation from "../EditLocation/EditLocation";
import "./ManageLocations.css";
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
  const [loading, setLoading] = useState(true);
  const locationsPerPage = 6;
  const navigate = useNavigate();
  const location = useLocation();

  // Centralized fetch function
  const fetchDestinations = () => {
    setLoading(true);
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
      .catch((error) => console.error("Error fetching destinations:", error))
      .finally(() => setLoading(false));
  };

  // Read page from URL on mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page"), 10);
    if (pageFromUrl && pageFromUrl > 0) {
      setCurrentPage(pageFromUrl);
    } else {
      setCurrentPage(1);
    }
    fetchDestinations();
    // eslint-disable-next-line
  }, [location]);

  // Update URL when page changes
  const setPageAndUrl = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() }, { replace: true });
  };

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
            let errorMsg = `Failed to add destination: ${response.status}`;
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
        fetchDestinations(); // Refetch after add
        setShowAddModal(false);
      })
      .catch((error) => {
        alert(error.message);
        console.error("Error adding destination:", error);
      });
  };

  const handleEditDestination = (updatedDestination) => {
    console.log("Editing destination:", updatedDestination); 
    fetch(`${API_BASE_URL}/destination/edit/${updatedDestination.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updatedDestination.name,
        stations: Array.isArray(updatedDestination.stations)
          ? updatedDestination.stations.filter((s) => s && s.trim())
          : [],
        image: updatedDestination.image,
      }),
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
        fetchDestinations(); // Refetch after edit
        setShowEditModal(false);
      })
      .catch((error) => {
        alert(error.message);
        console.error("Error editing destination:", error);
      });
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
            let errorMsg = `Failed to delete destination: ${response.status}`;
            try {
              const errObj = JSON.parse(text);
              if (errObj.error) errorMsg = errObj.error;
            } catch {}
            throw new Error(errorMsg);
          });
        }
        return response.text();
      })
      .then(() => {
        fetchDestinations(); // Refetch after delete
        setDeletedDestination(selectedDestination);
        setUndoAvailable(true);
        const timeout = setTimeout(() => {
          setDeletedDestination(null);
          setUndoAvailable(false);
        }, 5000);
        setUndoTimeout(timeout);
        setSelectedDestination(null);
      })
      .catch((error) => {
        alert(error.message);
        console.error("Error deleting destination:", error);
      });
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
            let errorMsg = `Failed to undo delete: ${response.status}`;
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
        fetchDestinations(); // Refetch after undo
        setDeletedDestination(null);
        setUndoAvailable(false);
      })
      .catch((error) => {
        alert(error.message);
        console.error("Error undoing delete:", error);
      });
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
      default:
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
      setPageAndUrl(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPageAndUrl(currentPage + 1);
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
          {loading ? (
            <div
              className="loading-spinner"
              style={{
                width: "100%",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              <div className="spinner"></div>
            </div>
          ) : paginatedDestinations.length === 0 ? (
            <p>No destinations found.</p>
          ) : (
            paginatedDestinations.map((destination) => (
              <div className="location-card" key={destination.id}>
                <div className="location-image">
                  {destination.image ? (
                    <img
                      src={
                        destination.image.includes("/upload/")
                          ? destination.image.replace(
                              "/upload/",
                              "/upload/f_auto,q_auto/"
                            )
                          : destination.image
                      }
                      alt={destination.name}
                    />
                  ) : (
                    <div className="location-image-fallback">
                      {destination.name?.charAt(0).toUpperCase() || "L"}
                    </div>
                  )}
                </div>
                <div className="location-details">
                  <h3 className="location-name">{destination.name}</h3>
                  {destination.stations && (
                    <p className="location-info">
                      <strong>Stations:</strong>{" "}
                      {destination.stations.join(", ")}
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
            ))
          )}
        </div>

        {/* Pagination controls: only show when not loading and there are destinations */}
        {!loading && paginatedDestinations.length > 0 && (
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

        {showAddModal && (
          <AddLocation
            onClose={() => setShowAddModal(false)}
            onSave={() => {
              fetchDestinations();
              setShowAddModal(false);
            }}
          />
        )}

        {showEditModal && selectedDestination && (
          <EditLocation
            destinationData={selectedDestination}
            onClose={() => setShowEditModal(false)}
            onSave={() => {
              fetchDestinations();
              setShowEditModal(false);
            }}
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
