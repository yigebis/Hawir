import React, { useState } from "react";
import "../../Styles/Agency/NotificationModal.css";

const NotificationModal = ({ isOpen, onClose }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: "green",
      title: "Trip #7890: Addis Ababa → Bahir Dar",
      desc: "Status Changed: Trip is delayed by 30 minutes",
      time: "10 minutes ago",
      details: {
        tripNumber: "#7890",
        origin: "Addis Ababa",
        destination: "Bahir Dar",
        originalDeparture: "9:00 AM",
        newDeparture: "9:30 AM",
        delayDuration: "30 minutes",
        date: "March 15, 2025",
        message: "Due to unforeseen circumstances, this trip is delayed.",
        affectedPassengers: 42,
      },
    },
    {
      id: 2,
      type: "blue",
      title: "New Booking: John Doe",
      desc: "Booked seat for Trip #7890 (Gondar → Mekelle)",
      time: "30 minutes ago",
      details: {
        tripNumber: "#7890",
        origin: "Gondar",
        destination: "Mekelle",
        originalDeparture: "10:00 AM",
        newDeparture: "10:00 AM",
        delayDuration: "0 minutes",
        date: "March 15, 2025",
        message: "We have received your booking request and will process it soon.",
        affectedPassengers: 1,
      },
    },
    {
      id: 3,
      type: "red",
      title: "Trip #1234 Canceled",
      desc: "Canceled due to weather conditions",
      time: "1 hour ago",
      details: {
        tripNumber: "#1234",
        origin: "Addis Ababa",
        destination: "Bahir Dar",
        originalDeparture: "9:00 AM",
        newDeparture: "9:30 AM",
        delayDuration: "30 minutes",
        date: "March 15, 2025",
        message: "Due to unforeseen circumstances, this trip is canceled.",
        affectedPassengers: 42,
      },
    },
  ];

  return (
    <div className="notification-overlay">
      <div className="notification-modal">
        {selectedNotification ? (
          <div className="notification-details">
            <button
              className="back-btn"
              onClick={() => setSelectedNotification(null)}
            >
              ← Back to Notifications
            </button>
            <h2>
              Trip {selectedNotification.tripNumber}:{" "}
              {selectedNotification.origin} → {selectedNotification.destination}
            </h2>
            <p>
              <strong>Original Departure:</strong>{" "}
              {selectedNotification.originalDeparture}
            </p>
            <p>
              <strong>New Departure:</strong>{" "}
              {selectedNotification.newDeparture}
            </p>
            <p>
              <strong>Delay Duration:</strong>{" "}
              {selectedNotification.delayDuration}
            </p>
            <p>
              <strong>Date:</strong> {selectedNotification.date}
            </p>
            <p>
              <strong>Message:</strong> {selectedNotification.message}
            </p>
            <p>
              <strong>Affected Passengers:</strong>{" "}
              {selectedNotification.affectedPassengers} passengers
            </p>
            <div className="notification-actions">
              <button className="notify-passengers">Notify Passengers</button>
              <button className="reschedule-trip">Reschedule Trip</button>
            </div>
          </div>
        ) : (
          <>
            <div className="notification-header">
              <div className="notify">
                <h2>Notifications</h2>
                <p>You have 3 unread notifications</p>
              </div>
              <div className="right">
                <button className="mark-all mark-read">Mark all as read</button>
                <button className="close-btn" onClick={onClose}>
                  ✖️
                </button>
              </div>
            </div>

            <div className="notification-tabs">
              <button className="active">All</button>
              <button>Updates</button>
              <button>Alerts</button>
              <button>Bookings</button>
              <button>Feedback</button>
            </div>

            <div className="notification-list">
              {notifications.map((notification) => (
                <div className="notification-item" key={notification.id}>
                  <div className="notificationTitle">
                    <span className={`dot ${notification.type}`}></span>
                    <div className="desc">
                      <strong>{notification.title}</strong>
                      <p>{notification.desc}</p>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button className="mark-read">Mark as read</button>
                    {notification.details && (
                      <button
                        className="view-details"
                        onClick={() =>
                          setSelectedNotification(notification.details)
                        }
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="notification-footer">
              <div className="notification-types">
                <h4>Notification Types</h4>
                <div className="coloring">
                  <div className="colorCodes">
                    <span className="dot green"></span> Trip Updates
                  </div>
                  <div className="colorCodes">
                    <span className="dot red"></span> Urgent
                  </div>
                  <div className="colorCodes">
                    <span className="dot orange"></span> Feedback
                  </div>
                  <div className="colorCodes">
                    <span className="dot blue"></span> Bookings
                  </div>
                  <div className="colorCodes">
                    <span className="dot purple"></span> System
                  </div>
                </div>
              </div>
              <div className="quick-actions">
                <h4>Quick Actions</h4>
                <button className="settings-btn">Settings</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
