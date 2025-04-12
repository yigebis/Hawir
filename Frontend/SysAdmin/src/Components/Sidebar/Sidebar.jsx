import React from 'react'
import "./Sidebar.css";
import logo from "../../assets/logo.jpg"; 


function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" />
        <h2>HAWIR Admin</h2>
      </div>
      <ul className="sidebar-menu">
        <li className="active">Dashboard</li>
        {/* <li>Locations</li> */}
        <li>Manage Agencies</li>
        <li>Logout</li>
      </ul>
    </aside>
  );
}

export default Sidebar
