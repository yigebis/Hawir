import React from "react";
import { useLocation } from "react-router-dom";
import { BsSearch, BsGlobe, BsFillBellFill } from "react-icons/bs";
import "../../Styles/Agency/AgencyHeader.css";

const pageTitles = {
  "/Maindashboard/dashboard": "Dashboard",
  "/Maindashboard/travels": "Manage Travels",
  "/Maindashboard/customers": "Customers",
  "/Maindashboard/reports": "Reports",
  "/Maindashboard/tours": "Tours",
};

function Header({ openNotifications }) {
  const location = useLocation();

  // Default to "Home" if no match is found
  const currentPage = pageTitles[location.pathname] || "Home";

  return (
    <header className="header">
      {/* Left Section - Dynamic Page Title */}
      <div className="header-left">
        <h3 className="dashboard-text">{currentPage}</h3>
      </div>

      {/* Center Section - Search Bar */}
      <div className="header-center">
        <div className="search-box">
          <input type="text" placeholder="Search for destination" />
          <BsSearch className="search-icon" />
        </div>
      </div>

      {/* Right Section - Icons & Profile */}
      <div className="header-right">
        <BsGlobe className="icon" />
        {/* Clicking the bell opens the notification modal */}
        <button className="notification-icon" onClick={openNotifications}>
          <BsFillBellFill className="icon" />
        </button>
      </div>
    </header>
  );
}

export default Header;
