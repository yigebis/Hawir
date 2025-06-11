import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { API_BASE_URL } from "../../api/api";
import "./DeleteEventsPage.css";

const DeleteEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [timer, setTimer] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/event/all?page=1`);
        const data = await response.json();
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    loadEvents();
  }, []);

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setAdminPassword("");
    setError("");
  };

  const handleConfirmDelete = () => {
    if (!adminPassword) {
      setError("Password is required.");
      return;
    }

    const event = eventToDelete; // capture the event reference
    setPendingDeletion(event);
    setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
    setEventToDelete(null);
    setError("");

    const deleteTimer = setTimeout(async () => {
      try {
        await fetch(`${API_BASE_URL}/event/delete/${event.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: adminPassword }),
        });
        setPendingDeletion(null);
      } catch (error) {
        console.error("Error deleting event:", error);
        setError("Failed to delete event. Please check your password.");
        setEvents((prev) => [...prev, event]);
        setPendingDeletion(null);
      }
    }, 5000);

    setTimer(deleteTimer);
  };

  const handleUndoDelete = () => {
    if (!pendingDeletion) return;
    setEvents((prev) => [...prev, pendingDeletion]);
    setPendingDeletion(null);
    clearTimeout(timer);
    setTimer(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="delete-events-page">
      <Sidebar />
      <main className="delete-events-main">
        <button className="back-btn" onClick={() => navigate("/settings")}>
          &larr; Back
        </button>
        <h1>Delete Events</h1>
        <table className="event-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Event Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((event, index) => (
              <tr key={event.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{event.title}</td>
                <td>
                  {event.date ? new Date(event.date).toLocaleDateString() : ""}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(event)}
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
            { length: Math.ceil(events.length / itemsPerPage) },
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

        {eventToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>
                Enter your password to confirm the deletion of{" "}
                <strong>{eventToDelete.title}</strong>.
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
                  onClick={() => setEventToDelete(null)}
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
              Event <strong>{pendingDeletion.title}</strong> will be deleted in
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

export default DeleteEventsPage;
