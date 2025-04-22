import React, { useState, useMemo } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AddEvent from "../AddEvent/AddEvent";
import EditEvent from "../EditEvent/EditEvent"; // Import EditEvent component
import "./ManageEvents.css";

const ManageEvents = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Annual Tech Conference",
      description: "A gathering of tech enthusiasts and startups.",
      location: "San Francisco",
      startDate: "2025-05-01",
      endDate: "2025-05-03",
      attendees: 340,
      status: "Educational & Business",
      image:
        "https://images.unsplash.com/photo-1694878873244-fa81446faba8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      name: "AI Innovation Day",
      description: "Showcase of AI-driven projects.",
      location: "New York",
      startDate: "2025-04-10",
      endDate: "2025-04-10",
      attendees: 150,
      status: "IT and Technology",
      image:
        "https://images.unsplash.com/photo-1694878981873-42a9d5538b52?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBsYWNlaG9sZGVyfGVufDB8fDB8fHww",
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [events, searchQuery, sortOption]);

  const handleAddEvent = (newEvent) => {
    const eventWithId = { ...newEvent, id: Date.now() };
    setEvents((prev) => [...prev, eventWithId]);
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleEditEvent = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
      )
    );
    setShowEditModal(false);
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = () => {
    setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="manage-events-container">
      <Sidebar />

      {showAddModal && (
        <AddEvent
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEvent}
        />
      )}

      {showEditModal && selectedEvent && (
        <EditEvent
          eventData={selectedEvent}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditEvent}
        />
      )}

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the event{" "}
              <strong>{selectedEvent?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDeleteEvent}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="manage-events-main">
        <div className="dashboard-header">
          <div className="dashboard-title-actions">
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
              placeholder="Search events..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="event-list grid">
          {filteredEvents.map((event) => (
            <div className="event-card" key={event.id}>
              <div className="event-image">
                <img src={event.image} alt={event.name} />
              </div>
              <div className="event-content">
                <div className="event-header">
                  <div className="event-date">
                    <span className="event-month">
                      {new Date(event.startDate)
                        .toLocaleString("default", { month: "short" })
                        .toUpperCase()}
                    </span>
                    <span className="event-day">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  <div className="event-category">
                    <span>{event.status}</span>
                  </div>
                </div>
                <h3 className="event-name">{event.name}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-footer">
                  <p className="event-location">
                    <i className="fas fa-map-marker-alt"></i> {event.location}
                  </p>
                  <p className="event-attendees">
                    <i className="fas fa-users"></i> {event.attendees} Interested
                  </p>
                </div>
                <div className="event-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(event)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(event)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <p className="no-events">No events found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageEvents;
