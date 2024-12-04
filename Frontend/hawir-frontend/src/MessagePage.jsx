import React from "react";
import PropTypes from "prop-types";
import "./MessagePage.css";
import { useLocation, useNavigate } from "react-router-dom";

const MessageCard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract message data from the route state
  const { type, text } = location.state || {
    type: "info",
    text: "No message to display.",
  };

  return (
    <div className="message-card">
      <div className={`message-card-content ${type}`}>
        <p>{text}</p>
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    </div>
  );
};

MessageCard.propTypes = {
  type: PropTypes.oneOf(["success","info"]),
  text: PropTypes.string,
};

export default MessageCard;
