import React from "react";
import "../../Styles/Agency/RecentActivity.css";

const RecentActivity = ({ openForm }) => {
  const trips = [
    {
      id: "TR123",
      destination: "Bahir Dar",
      date: "Jan 15, 2026",
      price: "2000 Birr",
    },
    {
      id: "TR456",
      destination: "Dire Dawa",
      date: "Feb 10, 2026",
      price: "2500 Birr",
    },
  ];

  return (
    <div className="recent-activity">
      <div className="recent-header">
        <h3>Recent Activity</h3>
        <button className="addTrip" onClick={openForm}>
          + Add Trip
        </button>
      </div>

      {trips.map((trip, index) => (
        <div key={index} className="trip-card">
          <div className="trip-info">
            <p className="trip-title">
              <strong>{trip.destination} Trip</strong>
            </p>
            <p>Departure: {trip.date}</p>
            <p>ID: {trip.id}</p>
          </div>
          <p className="trip-price">Price: {trip.price}</p>
        </div>
      ))}

      <button className="view-all">View All</button>
    </div>
  );
};

export default RecentActivity;
