import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.jpg";

function Sidebar({ agencies, setAgencies }) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <h2>HAWIR Admin</h2>
      </div>
      <ul className="sidebar-menu">
        <li className={location.pathname === "/dashboard" ? "active" : ""}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li
          className={location.pathname === "/manage-agencies" ? "active" : ""}
        >
          <Link to="/manage-agencies">Manage Agencies</Link>
        </li>
        <li className={location.pathname === "/manage-events" ? "active" : ""}>
          <Link to="/manage-events">Manage Evnets</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
