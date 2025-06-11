import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide sidebar on overlay click (mobile)
  const handleOverlayClick = () => setMobileOpen(false);

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={handleOverlayClick}></div>
      )}

      <aside
        className={`sidebar${collapsed ? " collapsed" : ""}${
          mobileOpen ? " mobile-open" : ""
        }`}
      >
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          {!collapsed && <h2>HAWIR Admin</h2>}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Open sidebar" : "Close sidebar"}
          >
            <i
              className={`fas ${
                collapsed ? "fa-chevron-right" : "fa-chevron-left"
              }`}
            ></i>
          </button>
          {/* Close button for mobile */}
          <button
            className="sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul className="sidebar-menu">
          <NavLink to="/dashboard" className="nav-link">
            <li>
              <i className="fas fa-th-large"></i> {!collapsed && <span>Dashboard</span>}
            </li>
          </NavLink>
          <NavLink to="/manage-agencies" className="nav-link">
            <li>
              <i className="fas fa-building"></i> {!collapsed && "Manage Agencies"}
            </li>
          </NavLink>
          <NavLink to="/manage-events" className="nav-link">
            <li>
              <i className="fas fa-calendar-alt"></i> {!collapsed && "Manage Events"}
            </li>
          </NavLink>
          <NavLink to="/manage-locations" className="nav-link">
            <li>
              <i className="fas fa-map-marker-alt"></i> {!collapsed && "Manage Destinations"}
            </li>
          </NavLink>
        </ul>
        <div className="sidebar-footer">
          <ul>
            <NavLink to="/settings" className="nav-link">
              <li>
                <i className="fas fa-cog"></i> {!collapsed && "Settings"}
              </li>
            </NavLink>
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
