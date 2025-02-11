import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import hawirLogo from "./assets/logo.jpg";
import bus from "./assets/Bus.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation Section */}
      <nav className="navbar">
        <div className="logo">
          <img
            src={hawirLogo}
            alt="HaWir Logo"
          />
          <span>HAWIR</span>
        </div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/community">Community</a></li>
          <li>
            <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
          </li>
          <li>
            <button className="nav-button sign-up" onClick={() => navigate('/register')}>Sign Up</button>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>
            Ethiopia’s Travel Network <span>at Your Fingertips</span>
          </h1>
          <p>
            Say goodbye to long queues and hello to convenient travel booking with Hawir.
          </p>
          <button className="cta-button">Choose your destination</button>
        </div>
        <div className="hero-image">
          <img
            src={bus} 
            alt="Travel Bus"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
