import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../../Components/Agency/AgencyHeader";
import Sidebar from "../../Components/Agency/Sidebar";
import Dashboard from "../../Components/Agency/Dashboard";
import AddTravel from "../../Components/Agency/AddTravel";
import NotificationModal from "../../Components/Agency/NotificationModal";
import "../../Styles/Agency/MainDashboard.css";

function MainDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="grid-container">
      <Sidebar />

      {/* Pass openNotifications function to Header */}
      <Header openNotifications={() => setNotificationOpen(true)} />

      <main className={`main-content ${showForm ? "blurred" : ""}`}>
        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard openForm={() => setShowForm(true)} />}
          />
          <Route path="/travels" element={<div>Travels Component</div>} />
          <Route path="/customers" element={<div>Customers Component</div>} />
          <Route path="/reports" element={<div>Reports Component</div>} />
          <Route path="/tours" element={<div>Tours Component</div>} />
          <Route path="/add-travel" element={<AddTravel />} />
        </Routes>
      </main>

      {/* Notification Modal */}
      {isNotificationOpen && (
        <div className="overlay">
          <NotificationModal
            isOpen={isNotificationOpen}
            onClose={() => setNotificationOpen(false)}
          />
        </div>
      )}

      {showForm && (
        <div className="overlay">
          <AddTravel onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}

export default MainDashboard;
