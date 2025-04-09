import React from "react";
import { NavLink } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Logo from "../../assets/selam.png";
import "../../Styles/Agency/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar-container">
      <aside className="sidebar">
        <div className="sidebar-title">
          <div className="sidebar-brand">
            <img src={Logo} alt="Logo" />
            <span>Selam Bus</span>
          </div>
          <span className="close-icon">X</span>
        </div>
        <hr />
        <ul className="sidebar-list">
          <li>
            <NavLink
              to="/Maindashboard/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-list-item active-link" : "sidebar-list-item"
              }
            >
              <i className="fa fa-tachometer icon" aria-hidden="true"></i>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Maindashboard/travels"
              className={({ isActive }) =>
                isActive ? "sidebar-list-item active-link" : "sidebar-list-item"
              }
            >
              <i className="fa fa-road icon" aria-hidden="true"></i>
              Manage Travels
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/Maindashboard/buses"
              className={({ isActive }) =>
                isActive ? "sidebar-list-item active-link" : "sidebar-list-item"
              }
            >
              <i className="fa fa-bus icon" aria-hidden="true"></i>
              Buses
            </NavLink>
          </li> */}

          <li>
            <NavLink
              to="/Maindashboard/customers"
              className={({ isActive }) =>
                isActive ? "sidebar-list-item active-link" : "sidebar-list-item"
              }
            >
              <i className="fa fa-users icon" aria-hidden="true"></i>
              Customers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Maindashboard/reports"
              className={({ isActive }) =>
                isActive ? "sidebar-list-item active-link" : "sidebar-list-item"
              }
            >
              <i className="fa fa-line-chart icon" aria-hidden="true"></i>
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Maindashboard/tours"
              className={({ isActive }) =>
                isActive ? "sidebar-list-item active-link" : "sidebar-list-item"
              }
            >
              <i className="fas fa-map-marked-alt icon"></i>
              Tours
            </NavLink>
          </li>
        </ul>
      </aside>
    </div>
  );
}

export default Sidebar;
