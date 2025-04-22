import React, { useState, useMemo } from "react";
import "./Dashboard.css";
import Sidebar from "../Sidebar/Sidebar";
import logo from "../../assets/logo.jpg";
import AddAgency from "../AddAgency/AddAgency";
import EditAgency from "../EditAgency/EditAgency";

const Dashboard = ({ agencies, setAgencies }) => {
  // const [agencies, setAgencies] = useState([
  //   {
  //     id: 1,
  //     name: "Selam Bus",
  //     logo: logo,
  //     description: "Leading national bus service provider.",
  //     services: ["Luxury Buses", "Online Booking", "Parcel Delivery"],
  //     contact: ["+251-911-123456", "info@selambus.com"],
  //     superAdminEmail: "admin@selambus.com", // Add this field
  //   },
  //   {
  //     id: 2,
  //     name: "Golden Bus",
  //     logo: logo,
  //     description: "Reliable regional transport services.",
  //     services: ["Affordable Fares", "Group Travel"],
  //     contact: ["+251-922-654321", "support@goldenbus.com"],
  //     superAdminEmail: "admin@goldenbus.com", // Add this field
  //   },
  // ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedAgency, setSelectedAgency] = useState(null);

  const filteredAgencies = useMemo(() => {
    let filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [agencies, searchQuery, sortOption]);

  const handleAddAgency = (newAgency) => {
    if (
      !newAgency.name?.trim() ||
      !newAgency.contact?.[0]?.trim() ||
      !newAgency.contact?.[1]?.trim() ||
      !newAgency.superAdminEmail?.trim() ||
      !newAgency.password?.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const agencyWithId = { ...newAgency, id: Date.now() };
    setAgencies((prev) => [...prev, agencyWithId]);
  };

  // const handleEditAgency = (updatedAgency) => {
  //   setAgencies((prev) =>
  //     prev.map((agency) =>
  //       agency.id === updatedAgency.id
  //         ? { ...agency, ...updatedAgency }
  //         : agency
  //     )
  //   );
  //   setShowEditModal(false);
  // };

  // const handleEditClick = (agency) => {
  //   setSelectedAgency(agency);
  //   setShowEditModal(true);
  // };

  return (
    <div className="dashboard-container">
      <Sidebar />

      {showAddModal && (
        <AddAgency
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAgency}
        />
      )}

      {/* {showEditModal && selectedAgency && (
        <EditAgency
          agencyData={selectedAgency}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditAgency}
        />
      )} */}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-title-actions">
            <h1>Travel Agencies</h1>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              Add Agency
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
              placeholder="Search agencies..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
                {/* <button
                  className="edit-btn"
                  onClick={() => handleEditClick(agency)}
                >
                  <i className="fas fa-edit"></i> Edit
                </button> */}
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
