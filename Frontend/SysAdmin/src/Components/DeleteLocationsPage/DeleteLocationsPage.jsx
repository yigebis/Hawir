import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocations, deleteLocation } from "../../api/api";
import Sidebar from "../Sidebar/Sidebar";
import "./DeleteLocationsPage.css";

const DeleteLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [timer, setTimer] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Centralized fetch function
  const fetchAndSetLocations = async () => {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchAndSetLocations();
  }, []);

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setAdminPassword("");
    setError("");
  };

  const handleConfirmDelete = () => {
    if (!adminPassword) {
      setError("Password is required.");
      return;
    }

    setPendingDeletion(locationToDelete);
    setLocations((prev) =>
      prev.filter((location) => location.id !== locationToDelete.id)
    );
    setLocationToDelete(null);
    setError("");

    const deleteTimer = setTimeout(async () => {
      try {
        await deleteLocation(locationToDelete.id, { password: adminPassword });
        setPendingDeletion(null);
        fetchAndSetLocations(); // Refetch after successful delete
      } catch (error) {
        console.error("Error deleting location:", error);
        setError("Failed to delete location. Please check your password.");
        setLocations((prev) => [...prev, locationToDelete]);
        setPendingDeletion(null);
      }
    }, 5000);

    setTimer(deleteTimer);
  };

  const handleUndoDelete = () => {
    if (!pendingDeletion) return;

    setLocations((prev) => [...prev, pendingDeletion]);
    setPendingDeletion(null);
    clearTimeout(timer);
    setTimer(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedLocations = locations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="delete-locations-page">
      <Sidebar />
      <main className="delete-locations-main">
        <button className="back-btn" onClick={() => navigate("/settings")}>
          &larr; Back
        </button>

        <h1>Delete Locations</h1>
        <table className="location-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Location Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLocations.map((location, index) => (
              <tr key={location.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{location.name}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(location)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          {Array.from(
            { length: Math.ceil(locations.length / itemsPerPage) },
            (_, index) => (
              <button
                key={index}
                className={`pagination-btn ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}
        </div>

        {locationToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>
                Enter your password to confirm the deletion of{" "}
                <strong>{locationToDelete.name}</strong>.
              </p>
              <input
                type="password"
                placeholder="Enter your password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              {error && <span className="error">{error}</span>}
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setLocationToDelete(null)}
                >
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleConfirmDelete}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingDeletion && (
          <div className="undo-container">
            <p>
              Location <strong>{pendingDeletion.name}</strong> will be deleted
              in 5 seconds.
            </p>
            <button className="undo-btn" onClick={handleUndoDelete}>
              Undo
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeleteLocationsPage;
