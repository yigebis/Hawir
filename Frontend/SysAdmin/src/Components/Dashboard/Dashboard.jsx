import React from "react";
// import axios from "axios";
import { useState, useMemo } from "react";
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import logo from "../../assets/logo.jpg";

const Dashboard = () => {
  // Sample hardcoded data (replace with API call later)
  const agencies = [
    {
      id: 1,
      name: "Selam Bus",
      logo: logo,
      description: "Leading national bus service provider.",
      services: ["Luxury Buses", "Online Booking", "Parcel Delivery"],
      contact: ["+251-911-123456", "info@selambus.com"],
    },
    {
      id: 2,
      name: "Golden Bus",
      logo: logo,
      description: "Reliable regional transport services.",
      services: ["Affordable Fares", "Group Travel"],
      contact: ["+251-922-654321", "support@goldenbus.com"],
    },
    // Add more agencies...
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const filteredAgencies = useMemo(() => {
    let filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "oldest":
        filtered.sort((a, b) => a.id - b.id); // assuming lower ID = older
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b.id - a.id); // assuming higher ID = newer
        break;
    }

    return filtered;
  }, [agencies, searchQuery, sortOption]);

  // // Actual API call
  // const [agencies, setAgencies] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [searchQuery, setSearchQuery] = useState("");

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:5000/api/agencies") // Replace with your actual API endpoint
  //     .then((response) => {
  //       setAgencies(response.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Failed to fetch agencies:", error);
  //       setLoading(false);
  //     });
  // }, []);

  // const filteredAgencies = agencies.filter((agency) =>
  //   agency.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-actions">
            <h1>Travel Agencies</h1>
            <button className="add-btn">Add Agency</button>
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

        {/* Agency Cards */}
        <div className="agency-list grid">
          {filteredAgencies.map((agency) => (
            <div className="agency-card" key={agency.id}>
              {/* Header with logo and status */}
              <div className="agency-header">
                <div className="agency-logo-container">
                  <img
                    src={agency.logo}
                    alt={agency.name}
                    className="agency-logo"
                  />
                </div>
                <h3 className="agency-name">{agency.name}</h3>
                {/* <span className="agency-status">Active</span> */}
              </div>

              {/* Description */}
              <p className="agency-description">{agency.description}</p>
              <hr className="linebreak" />

              {/* Contact Info */}
              <div className="agency-contact">
                <p>
                  <i className="fas fa-envelope"></i> {agency.contact[1]}
                </p>
                <p>
                  <i className="fas fa-phone"></i> {agency.contact[0]}
                </p>
              </div>
              <hr className="linebreak" />

              {/* Actions */}
              <div className="agency-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    console.log(`Edit agency: ${agency.name}`);
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="view-details-btn"
                  onClick={() => {
                    console.log(`View details for agency: ${agency.name}`);
                  }}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
