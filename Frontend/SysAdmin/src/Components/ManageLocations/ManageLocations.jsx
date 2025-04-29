import React, { useState, useMemo } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AddLocation from "../AddLocation/AddLocation";
import EditLocation from "../EditLocation/EditLocation";
import "./ManageLocations.css";
import harar from "../../assets/harar.jpeg";

const ManageLocations = ({ locations, setLocations }) => {
  // const [locations, setLocations] = useState([
  //   {
  //     id: 1,
  //     name: "Harar",
  //     desc: "A historic city known for its ancient walls and vibrant culture.",
  //     currentWeather: "Cloudy, 22°C",
  //     hotels: [
  //       {
  //         name: "Heritage Plaza Hotel",
  //         imageUrl: "https://via.placeholder.com/150",
  //       },
  //       {
  //         name: "Harar Guest House",
  //         imageUrl: "https://via.placeholder.com/150",
  //       },
  //     ],
  //     culture: "Famous for its diverse traditions and coffee culture.",
  //     history: "Known as the City of Saints, with over 82 mosques.",
  //     people: "Welcoming and culturally diverse community.",
  //     population: "122,000",
  //     touristAttractions: [
  //       {
  //         name: "Harar Jugol",
  //         desc: "A UNESCO World Heritage Site with ancient walls.",
  //       },
  //       {
  //         name: "Hyena Feeding",
  //         desc: "A unique tradition of feeding wild hyenas.",
  //       },
  //     ],
  //     postDate: "2025-04-26",
  //   },
  // ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deletedLocation, setDeletedLocation] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [undoAvailable, setUndoAvailable] = useState(false);

  const handleAddLocation = (newLocation) => {
    setLocations((prev) => [...prev, { ...newLocation, id: Date.now() }]);
  };

  const handleEditLocation = (updatedLocation) => {
    setLocations((prev) =>
      prev.map((location) =>
        location.id === updatedLocation.id ? updatedLocation : location
      )
    );
    setShowEditModal(false);
  };

  const handleDeleteClick = (location) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  const confirmDeleteLocation = () => {
    setShowDeleteModal(false);

    const updatedLocations = locations.filter(
      (location) => location.id !== selectedLocation.id
    );
    setLocations(updatedLocations);

    setDeletedLocation(selectedLocation);
    setUndoAvailable(true);

    const timeout = setTimeout(() => {
      setDeletedLocation(null);
      setUndoAvailable(false);
    }, 5000);

    setUndoTimeout(timeout);
    setSelectedLocation(null);
  };

  const undoDeleteLocation = () => {
    clearTimeout(undoTimeout);
    setLocations((prev) => [...prev, deletedLocation]);
    setDeletedLocation(null);
    setUndoAvailable(false);
  };

  // Filter and search logic
  const filteredLocations = useMemo(() => {
    let filtered = locations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter option
    if (filterOption !== "all") {
      filtered = filtered.filter((location) =>
        filterOption === "highPopulation"
          ? parseInt(location.population.replace(/,/g, ""), 10) > 100000
          : filterOption === "lowPopulation"
          ? parseInt(location.population.replace(/,/g, ""), 10) <= 100000
          : true
      );
    }

    // Apply sort option
    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.postDate) - new Date(b.postDate));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        break;
    }

    return filtered;
  }, [locations, searchQuery, filterOption, sortOption]);

  return (
    <div className="manage-locations-container">
      <Sidebar />

      <div className="manage-locations-content">
        <header className="locations-header">
          <h1>Manage Locations</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            Add Location
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
            placeholder="Search locations..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="locations-list">
          {filteredLocations.map((location) => (
            <div className="location-card" key={location.id}>
              <div className="location-image">
                <img src={harar} alt={location.name} />
              </div>
              <div className="location-details">
                <h3 className="location-name">{location.name}</h3>
                <p className="location-desc">{location.desc}</p>
                <p className="location-info">
                  <strong>Culture:</strong> {location.culture}
                </p>
                <p className="location-info">
                  <strong>Weather:</strong> {location.currentWeather}
                </p>
                <div className="tourist-attractions">
                  <strong>Tourist Attractions:</strong>
                  <ul>
                    {location.touristAttractions.map((attraction, index) => (
                      <li key={index}>
                        <strong>{attraction.name}:</strong> {attraction.desc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="location-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedLocation(location);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(location)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredLocations.length === 0 && <p>No locations found.</p>}
        </div>

        {showAddModal && (
          <AddLocation
            onClose={() => setShowAddModal(false)}
            onSave={handleAddLocation}
          />
        )}

        {showEditModal && selectedLocation && (
          <EditLocation
            locationData={selectedLocation}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditLocation}
          />
        )}

        {showDeleteModal && (
          <div className="delete-modal">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>
                Are you sure you want to delete the location{" "}
                <strong>{selectedLocation?.name}</strong>?
              </p>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="confirm-btn" onClick={confirmDeleteLocation}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {undoAvailable && deletedLocation && (
          <div className="undo-notification">
            <p>
              Location <strong>{deletedLocation.name}</strong> deleted.{" "}
              <button onClick={undoDeleteLocation}>Undo</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLocations;
