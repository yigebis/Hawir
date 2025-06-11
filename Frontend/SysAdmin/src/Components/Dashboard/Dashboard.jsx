import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";

const Dashboard = ({ agencies, events, locations }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // NEW: filter dropdown state
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const navigate = useNavigate();

  // Enhanced filter logic for agencies, events, and locations
  const filteredAgencies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return agencies.filter(
      (agency) =>
        agency.name.toLowerCase().includes(q) ||
        (agency.description && agency.description.toLowerCase().includes(q)) ||
        (agency.address && agency.address.toLowerCase().includes(q))
    );
  }, [agencies, searchQuery]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return events.filter((event) => {
      const name = event.name || event.title || "";
      const desc = event.description || event.desc || "";
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [events, searchQuery]);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(q) ||
        (location.description && location.description.toLowerCase().includes(q))
    );
  }, [locations, searchQuery]);

  // Modal handlers
  const handleViewDetails = (agency) => {
    setSelectedAgency(agency);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedAgency(null);
    setIsModalOpen(false);
  };
  const handleViewEventDetails = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };
  const handleCloseEventModal = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(false);
  };

  // Find the location for the selected event
  const eventLocation =
    selectedEvent &&
    locations.find(
      (loc) =>
        loc.id === selectedEvent.destination_id ||
        loc._id === selectedEvent.destination_id
    );

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-title-actions">
            <h1>Dashboard</h1>
          </div>
          <div className="header-actions">
            <select
              className="filter-type-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="agencies">Agencies</option>
              <option value="events">Events</option>
              <option value="locations">Locations</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Agencies Section */}
        {(filterType === "all" || filterType === "agencies") && (
          <section className="dashboard-section">
            <h2>Travel Agencies</h2>
            <div className="agency-list grid">
              {filteredAgencies.slice(0, 3).map((agency) => (
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
                      className="view-details-btn"
                      onClick={() => handleViewDetails(agency)}
                    >
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </div>
                </div>
              ))}
              {filteredAgencies.length === 0 && <p>No agencies found.</p>}
            </div>
            <button
              className="view-more-btn-dashboard"
              onClick={() => navigate("/manage-agencies")}
            >
              View More
            </button>
          </section>
        )}

        {/* Modal for Agency Details */}
        {isModalOpen && selectedAgency && (
          <div className="modal-overlay">
            <div className="modal-content-details">
              <div className="modal-header">
                <h2>{selectedAgency.name}</h2>
                <button className="close-modal-btn" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Description</h3>
                  <p>{selectedAgency.description}</p>
                </div>
                <div className="modal-section">
                  <h3>Contact Information</h3>
                  <p>
                    <strong>Email:</strong> {selectedAgency.contact[1]}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedAgency.contact[0]}
                  </p>
                </div>
                <div className="modal-section">
                  <h3>Services</h3>
                  <p>{selectedAgency.services.join(", ")}</p>
                </div>
                <div className="modal-section">
                  <h3>Additional Details</h3>
                  <p>
                    <strong>Address:</strong> {selectedAgency.address || "N/A"}
                  </p>
                  <p>
                    <strong>Website:</strong>{" "}
                    <a
                      href={selectedAgency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedAgency.website || "N/A"}
                    </a>
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Events Section */}
        {(filterType === "all" || filterType === "events") && (
          <section className="dashboard-section">
            <h2>Events</h2>
            <div className="event-list grid">
              {filteredEvents.slice(0, 3).map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-image">
                    <img
                      src={
                        event.media_link
                          ? event.media_link.includes("/upload/")
                            ? event.media_link.replace(
                                "/upload/",
                                "/upload/f_auto,q_auto/"
                              )
                            : event.media_link
                          : "/placeholder.jpg"
                      }
                      alt={event.name || event.title}
                    />
                  </div>
                  <div className="event-details">
                    <h3 className="event-name">{event.name || event.title}</h3>
                    <p className="event-description">
                      <strong>Description: </strong>
                      {event.description || event.desc}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : event.startDate && event.endDate
                        ? `${new Date(
                            event.startDate
                          ).toLocaleDateString()} - ${new Date(
                            event.endDate
                          ).toLocaleDateString()}`
                        : "N/A"}
                    </p>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewEventDetails(event)}
                    >
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && <p>No events found.</p>}
            </div>
            <button
              className="view-more-btn-dashboard"
              onClick={() => navigate("/manage-events")}
            >
              View More
            </button>
          </section>
        )}

        {/* Modal for Event Details */}
        {isEventModalOpen && selectedEvent && (
          <div className="modal-overlay">
            <div className="modal-content-details">
              <div className="modal-header">
                <h2>{selectedEvent.title || selectedEvent.name}</h2>
                <button
                  className="close-modal-btn"
                  onClick={handleCloseEventModal}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-section">
                  <img
                    src={
                      selectedEvent.imageUrl ||
                      selectedEvent.image ||
                      "/placeholder.jpg"
                    }
                    alt={selectedEvent.title || selectedEvent.name}
                    style={{ maxWidth: "300px", marginBottom: "1rem" }}
                  />
                  <h3>Description</h3>
                  <p>{selectedEvent.description || selectedEvent.desc}</p>
                </div>
                <div className="modal-section">
                  <h3>Date</h3>
                  <p>
                    {selectedEvent.date
                      ? new Date(selectedEvent.date).toLocaleDateString()
                      : selectedEvent.startDate && selectedEvent.endDate
                      ? `${new Date(
                          selectedEvent.startDate
                        ).toLocaleDateString()} - ${new Date(
                          selectedEvent.endDate
                        ).toLocaleDateString()}`
                      : "N/A"}
                  </p>
                </div>
                <div className="modal-section">
                  <h3>Location</h3>
                  {eventLocation ? (
                    <>
                      <p>
                        <strong>{eventLocation.name}</strong>
                      </p>
                      <p>{eventLocation.description}</p>
                    </>
                  ) : (
                    <p>No location found for this event.</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={handleCloseEventModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Locations Section */}
        {(filterType === "all" || filterType === "locations") && (
          <section className="dashboard-section">
            <h2>Locations</h2>
            <div className="location-list grid">
              {filteredLocations.slice(0, 3).map((location) => (
                <div className="location-card" key={location.id}>
                  <div className="location-image">
                    <img
                      src={location.imageUrl || location.image}
                      alt={location.name}
                    />
                  </div>
                  <div className="location-details">
                    <h3 className="location-name">{location.name}</h3>
                    <p className="location-desc">{location.description}</p>
                    <p>
                      <strong>Stations:</strong>{" "}
                      {location.stations && location.stations.length > 0
                        ? location.stations.join(", ")
                        : "N/A"}
                    </p>
                    {/* <p>
                      <strong>Hotels:</strong> {location.hotels?.length || 0}
                    </p> */}
                    <button
                      className="view-details-btn"
                      onClick={() =>
                        navigate(`/location-details/${location.id}`)
                      }
                    >
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </div>
                </div>
              ))}
              {filteredLocations.length === 0 && <p>No locations found.</p>}
            </div>
            <button
              className="view-more-btn-dashboard"
              onClick={() => navigate("/manage-locations")}
            >
              View More
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
