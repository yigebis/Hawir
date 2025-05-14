import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <h2>HAWIR Admin</h2>
      </div>
      <ul className="sidebar-menu">
        <li className={location.pathname === "/dashboard" ? "active" : ""}>
          <Link to="/dashboard">
            <i className="fas fa-th-large"></i> Dashboard
          </Link>
        </li>
        <li
          className={location.pathname === "/manage-agencies" ? "active" : ""}
        >
          <Link to="/manage-agencies">
            <i className="fas fa-building"></i> Manage Agencies
          </Link>
        </li>
        <li className={location.pathname === "/manage-events" ? "active" : ""}>
          <Link to="/manage-events">
            <i className="fas fa-calendar-alt"></i> Manage Events
          </Link>
        </li>
        <li
          className={location.pathname === "/manage-locations" ? "active" : ""}
        >
          <Link to="/manage-locations">
            <i className="fas fa-map-marker-alt"></i> Manage Locations
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <ul>
          <li className={location.pathname === "/settings" ? "active" : ""}>
            <Link to="/settings">
              <i className="fas fa-cog"></i> Settings
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
