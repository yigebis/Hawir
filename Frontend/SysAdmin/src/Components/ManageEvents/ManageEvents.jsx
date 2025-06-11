import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import AddEvent from "../AddEvent/AddEvent";
import EditEvent from "../EditEvent/EditEvent";
import { API_BASE_URL } from "../../api/api";
import "./ManageEvents.css";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [dateMin, setDateMin] = useState("");
  const [dateMax, setDateMax] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch destinations once
  useEffect(() => {
    fetch(`${API_BASE_URL}/destination/all`)
      .then((res) => res.json())
      .then((data) => setDestinations(data || []))
      .catch((err) => console.error("Error fetching destinations:", err));
  }, []);

  // Read page from URL on mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page"), 10);
    if (pageFromUrl && pageFromUrl > 0) {
      setCurrentPage(pageFromUrl);
    } else {
      setCurrentPage(1);
    }
    // Don't fetch events here, let the next effect handle it
    // eslint-disable-next-line
  }, [location]);

  // Update URL when page changes
  const setPageAndUrl = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() }, { replace: true });
  };

  // Fetch events with filters
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", currentPage);
        if (searchTitle) params.append("title", searchTitle);
        if (searchDestination) params.append("destination_id", searchDestination);
        if (dateMin) params.append("date_min", dateMin);
        if (dateMax) params.append("date_max", dateMax);

        const response = await fetch(
          `${API_BASE_URL}/event/all?${params.toString()}`
        );
        const data = await response.json();
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    };

    loadEvents();
  }, [currentPage, searchTitle, searchDestination, dateMin, dateMax]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
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
  }, [events, sortOption]);

  const handleAddEvent = async (formData) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("You are not authorized. Please log in.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/event/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add event.");
      }
      setPageAndUrl(1); // Go to first page to see new event
      setShowAddModal(false);
      refetchEvents(1);
    } catch (error) {
      alert(error.message);
      console.error("Error adding event:", error);
    }
  };

  const handleEditEvent = async (formData) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("You are not authorized. Please log in.");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/event/edit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to edit event.");
      }
      setShowEditModal(false);
      refetchEvents(currentPage);
    } catch (error) {
      alert(error.message);
      console.error("Error editing event:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/event/delete/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete event.");
      }
      refetchEvents(currentPage);
    } catch (error) {
      alert(error.message);
      console.error("Error deleting event:", error);
    }
  };

  // Helper to refetch events (for add/edit/delete)
  const refetchEvents = (page = currentPage) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", page);
    if (searchTitle) params.append("title", searchTitle);
    if (searchDestination) params.append("destination_id", searchDestination);
    if (dateMin) params.append("date_min", dateMin);
    if (dateMax) params.append("date_max", dateMax);

    fetch(`${API_BASE_URL}/event/all?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setEvents(data || []))
      .catch((error) => console.error("Error fetching events:", error))
      .finally(() => setLoading(false));
  };

  const getDestinationName = (id) => {
    const dest = destinations.find((d) => d.id === id || d._id === id);
    return dest ? dest.name : id;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPageAndUrl(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setPageAndUrl(currentPage + 1);
  };

  return (
    <div className="manage-events-container">
      <Sidebar />

      {showAddModal && (
        <AddEvent
          destinations={destinations}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEvent}
        />
      )}

      {showEditModal && selectedEvent && (
        <EditEvent
          eventData={selectedEvent}
          destinations={destinations}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditEvent}
        />
      )}

      <main className="manage-events-main">
        <div className="header">
          <div className="title-actions">
            <h1>Manage Events</h1>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus"></i> Add Event
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
              placeholder="Search by title..."
              className="search-input"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
            <select
              className="search-select"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
            >
              <option value="">All Destinations</option>
              {destinations.map((dest) => (
                <option key={dest.id || dest._id} value={dest.id || dest._id}>
                  {dest.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateMin}
              onChange={(e) => setDateMin(e.target.value)}
              className="date-input"
            />
            <input
              type="date"
              value={dateMax}
              onChange={(e) => setDateMax(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        <div className="event-list grid">
          {loading ? (
            <div className="loading-spinner" style={{ width: "100%", textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="no-events">No events found.</p>
          ) : (
            filteredEvents.map((event, idx) => (
              <div
                className="event-card"
                key={event.id || event._id || `${event.title}-${event.date}-${idx}`}
              >
                <div className="event-image">
                  <img
                    src={
                      event.media_link
                        ? event.media_link.includes("/upload/")
                          ? event.media_link.replace("/upload/", "/upload/f_auto,q_auto/")
                          : event.media_link
                        : "/placeholder.jpg"
                    }
                    alt={event.title || "Event Image"}
                  />
                </div>
                <div className="event-details">
                  <h3 className="event-title">{event.title}</h3>
                  <p>
                    <strong>Description:</strong>{" "}
                    {event.desc || "Join the event"}
                  </p>
                  <p>
                    <strong>Destination:</strong>{" "}
                    {getDestinationName(event.destination_id)}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <div className="event-actions">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEditModal(true);
                      }}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    {/* <button
                      className="delete-btn"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage}</span>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageEvents;
