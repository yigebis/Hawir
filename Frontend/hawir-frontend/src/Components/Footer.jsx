import React from "react";
import "../styles/Footer.css";
import hawirLogo from "../assets/Hawir-02.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo Section */}
        <div className="footer-logo">
          <div className="logo">
            <img src={hawirLogo} alt="HAWIR Logo" className="logo-img" />
            <h1>HAWIR</h1>
          </div>
          <p>Copyright © 2025. All rights reserved</p>
          <div className="social-icons">
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-dribbble"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="footer-links">
          <h4>Useful Links</h4>
          <ul>
            <li>
              <a href="#">About us</a>
            </li>
            <li>
              <a href="#">Contact us</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">Testimonials</a>
            </li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li>
              <a href="#">Help center</a>
            </li>
            <li>
              <a href="#">Terms of service</a>
            </li>
            <li>
              <a href="#">Legal</a>
            </li>
            <li>
              <a href="#">Privacy policy</a>
            </li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <h4>Stay up to date</h4>
          <div className="newsletter-input">
            <input type="email" placeholder="Your email address" />
            <button type="submit">📩</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
