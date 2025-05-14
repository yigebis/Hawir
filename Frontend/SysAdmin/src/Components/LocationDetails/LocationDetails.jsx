import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../api/api";
import Sidebar from "../Sidebar/Sidebar";
import "./LocationDetails.css";

const LocationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    latitude: "",
    longitude: "",
    description: "",
    culture: "",
    history: "",
    hotels: [],
    image: "",
    tourist_attractions: [],
  });

  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/destination/details/${id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch location details.");
        }

        const data = await response.json();
        setDetails({
          ...data,
          hotels: data.hotels || [],
          image: data.image || "",
          tourist_attractions: data.tourist_attractions || [],
        });
      } catch (err) {
        toast.error("Error: " + err.message);
      }
    };

    fetchDetails();
  }, [id]);

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/destination/details/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          destination_id: id,
          latitude: details.latitude,
          longitude: details.longitude,
          description: details.description,
          image: details.image || "",
          hotels: details.hotels,
          culture: details.culture,
          history: details.history,
          tourist_attractions: details.tourist_attractions || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location details.");
      }

      toast.success("Location details updated successfully!");
      setShowEditForm(false);
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const handleHotelChange = (index, field, value) => {
    const updatedHotels = [...details.hotels];
    updatedHotels[index] = { ...updatedHotels[index], [field]: value };
    setDetails({ ...details, hotels: updatedHotels });
  };

  const addHotel = () => {
    setDetails({
      ...details,
      hotels: [...details.hotels, { name: "", image_url: "", map_link: "" }],
    });
  };

  const removeHotel = (index) => {
    const updatedHotels = details.hotels.filter((_, i) => i !== index);
    setDetails({ ...details, hotels: updatedHotels });
  };

  return (
    <div className="location-details-page">
      <Sidebar />
      <div className="location-details-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          &larr; Back
        </button>
        <h1>Location Details</h1>
        <div className="details-section">
          <p>
            <strong>Latitude:</strong> {details.latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {details.longitude}
          </p>
          <p>
            <strong>Description:</strong> {details.description}
          </p>
          <p>
            <strong>Culture:</strong> {details.culture}
          </p>
          <p>
            <strong>History:</strong> {details.history}
          </p>

          <h3>Hotels</h3>
          {details.hotels.length > 0 ? (
            details.hotels.map((hotel, index) => (
              <div key={index} className="hotel-item">
                <p>
                  <strong>Name:</strong> {hotel.name}
                </p>
                <p>
                  <strong>Image URL:</strong> {hotel.image_url}
                </p>
                <p>
                  <strong>Map Link:</strong>{" "}
                  <a href={hotel.map_link} target="_blank" rel="noopener noreferrer">
                    View on Map
                  </a>
                </p>
              </div>
            ))
          ) : (
            <p>No hotels available for this location.</p>
          )}

          <button className="edit-btn" onClick={() => setShowEditForm(true)}>
            Edit
          </button>
        </div>

        {showEditForm && (
          <div className="edit-details-form">
            <h2>Edit Location Details</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChanges();
              }}
            >
              <label>
                Latitude:
                <input
                  type="text"
                  value={details.latitude}
                  onChange={(e) =>
                    setDetails({ ...details, latitude: e.target.value })
                  }
                />
              </label>
              <label>
                Longitude:
                <input
                  type="text"
                  value={details.longitude}
                  onChange={(e) =>
                    setDetails({ ...details, longitude: e.target.value })
                  }
                />
              </label>
              <label>
                Description:
                <textarea
                  value={details.description}
                  onChange={(e) =>
                    setDetails({ ...details, description: e.target.value })
                  }
                />
              </label>
              <label>
                Culture:
                <textarea
                  value={details.culture}
                  onChange={(e) =>
                    setDetails({ ...details, culture: e.target.value })
                  }
                />
              </label>
              <label>
                History:
                <textarea
                  value={details.history}
                  onChange={(e) =>
                    setDetails({ ...details, history: e.target.value })
                  }
                />
              </label>

              <h3>Hotels</h3>
              {details.hotels.map((hotel, index) => (
                <div key={index} className="hotel-item">
                  <label>
                    Hotel Name:
                    <input
                      type="text"
                      value={hotel.name}
                      onChange={(e) =>
                        handleHotelChange(index, "name", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Image URL:
                    <input
                      type="text"
                      value={hotel.image_url}
                      onChange={(e) =>
                        handleHotelChange(index, "image_url", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Map Link:
                    <input
                      type="text"
                      value={hotel.map_link}
                      onChange={(e) =>
                        handleHotelChange(index, "map_link", e.target.value)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="remove-hotel-btn"
                    onClick={() => removeHotel(index)}
                  >
                    Remove Hotel
                  </button>
                </div>
              ))}
              <button type="button" className="add-hotel-btn" onClick={addHotel}>
                Add Hotel
              </button>

              <div className="form-actions">
                <button type="button" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default LocationDetails;
