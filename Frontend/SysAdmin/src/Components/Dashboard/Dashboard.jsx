import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";

const Dashboard = ({ agencies, events, locations }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); // Initialize navigation

  // Filter logic for agencies, events, and locations
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agencies, searchQuery]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const filteredLocations = useMemo(() => {
    return locations.filter((location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-title-actions">
            <h1>Dashboard</h1>
          </div>

          <div className="header-actions">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Agencies Section */}
        <section className="dashboard-section">
          <h2>Travel Agencies</h2>
          <div className="agency-list grid">
            {filteredAgencies.map((agency) => (
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
                    className="view-details-btn"
                    onClick={() => navigate(`/agency-details/${agency.id}`)}
                  >
                    <i className="fas fa-eye"></i> View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredAgencies.length === 0 && <p>No agencies found.</p>}
          </div>
          <button
            className="view-more-btn"
            onClick={() => navigate("/manage-agencies")}
          >
            View More
          </button>
        </section>

        {/* Events Section */}
        <section className="dashboard-section">
          <h2>Events</h2>
          <div className="event-list grid">
            {filteredEvents.map((event) => (
              <div className="event-card" key={event.id}>
                <div className="event-image">
                  <img src={event.image} alt={event.name} />
                </div>
                <div className="event-content">
                  <h3 className="event-name">{event.name}</h3>
                  <p className="event-description">{event.description}</p>
                  <p className="event-date">
                    {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/event-details/${event.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && <p>No events found.</p>}
          </div>
          <button
            className="view-more-btn"
            onClick={() => navigate("/manage-events")}
          >
            View More
          </button>
        </section>

        {/* Locations Section */}
        <section className="dashboard-section">
          <h2>Locations</h2>
          <div className="location-list grid">
            {filteredLocations.map((location) => (
              <div className="location-card" key={location.id}>
                <div className="location-image">
                  <img src={location.imageUrl} alt={location.name} />
                </div>
                <div className="location-details">
                  <h3 className="location-name">{location.name}</h3>
                  <p className="location-desc">{location.desc}</p>
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/location-details/${location.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredLocations.length === 0 && <p>No locations found.</p>}
          </div>
          <button
            className="view-more-btn"
            onClick={() => navigate("/manage-locations")}
          >
            View More
          </button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
