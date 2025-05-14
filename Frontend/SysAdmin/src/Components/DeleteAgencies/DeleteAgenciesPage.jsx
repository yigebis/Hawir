import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAgencies, deleteAgency } from "../../api/api";
import Sidebar from "../Sidebar/Sidebar";
import "./DeleteAgenciesPage.css";

const DeleteAgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeletion, setPendingDeletion] = useState(null); // Store the agency pending deletion
  const [timer, setTimer] = useState(null); // Timer for delayed deletion
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const loadAgencies = async () => {
      try {
        const data = await fetchAgencies();
        setAgencies(data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      }
    };

    loadAgencies();
  }, []);

  const handleDeleteClick = (agency) => {
    setAgencyToDelete(agency);
    setAdminPassword("");
  };

  const handleConfirmDelete = () => {
    if (!adminPassword) {
      setError("Password is required.");
      return;
    }

    console.log("Marking agency for deletion:", agencyToDelete.id); // Debugging log

    // Temporarily remove the agency from the UI
    setPendingDeletion(agencyToDelete);
    setAgencies((prev) =>
      prev.filter((agency) => agency.id !== agencyToDelete.id)
    );
    setAgencyToDelete(null);
    setError("");

    // Start a timer to send the delete request after 5 seconds
    const deleteTimer = setTimeout(async () => {
      try {
        await deleteAgency(agencyToDelete.id, { password: adminPassword });
        console.log("Agency deleted successfully:", agencyToDelete.id);
        setPendingDeletion(null); // Clear pending deletion
      } catch (error) {
        console.error("Error deleting agency:", error);
        setError("Failed to delete agency. Please check your password.");
        // Restore the agency to the UI if the delete request fails
        setAgencies((prev) => [...prev, agencyToDelete]);
        setPendingDeletion(null);
      }
    }, 5000); // 5-second delay

    setTimer(deleteTimer);
  };

  const handleUndoDelete = () => {
    if (!pendingDeletion) return;

    console.log("Undoing deletion for agency:", pendingDeletion.id); // Debugging log

    // Restore the agency to the UI
    setAgencies((prev) => [...prev, pendingDeletion]);
    setPendingDeletion(null);

    // Clear the timer
    clearTimeout(timer);
    setTimer(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedAgencies = agencies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="delete-agencies-page">
      <Sidebar />
      <main className="delete-agencies-main">
        <button className="back-btn" onClick={() => navigate("/settings")}>
          &larr; Back
        </button>

        <h1>Delete Agencies</h1>
        <table className="agency-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Agency Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAgencies.map((agency, index) => (
              <tr key={agency.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{agency.name}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(agency)}
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
            { length: Math.ceil(agencies.length / itemsPerPage) },
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

        {agencyToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>
                Enter your password to confirm the deletion of{" "}
                <strong>{agencyToDelete.name}</strong>.
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
                  onClick={() => setAgencyToDelete(null)}
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
              Agency <strong>{pendingDeletion.name}</strong> will be deleted in
              5 seconds.
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

export default DeleteAgenciesPage;
