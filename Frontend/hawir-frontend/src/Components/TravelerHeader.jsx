import React from "react";
import hawirLogo from "../assets/logo.jpg";
import "../Styles/TravelerHeader.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const TravelerHeader = () => {
  return (
    <header className="header container">
      <div className="logo container1">
        <img src={hawirLogo} alt="Hawir Logo" />
        <h1>HAWIR</h1>
      </div>
      <div className="container2">
        <nav className="nav">
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">My Booking</a>
            </li>
            <li>
              <a href="#">Events</a>
            </li>
            <li>
              <a href="#">Trip Tracker</a>
            </li>
          </ul>
        </nav>
        <div className="icons">
          <span>
            <i className="fas fa-bell"></i>
          </span>
          <span>
            <i className="fas fa-globe"></i>
          </span>
          <span>
            <i className="fas fa-user"></i>
          </span>
        </div>
      </div>
    </header>
  );
};

export default TravelerHeader;
