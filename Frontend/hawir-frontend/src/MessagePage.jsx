import React from "react";
import PropTypes from "prop-types";
import "./MessagePage.css";
import { useLocation, useNavigate } from "react-router-dom";
import error500 from "./assets/InternalServerError.png";

const MessageCard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract message data from the route state
  const { type } = location.state || {
    type: "info",
  };

  return (
    <div className="message-card">
      <div className={`message-card-content ${type}`}>
        {type === "error" ? (
          // Show only the image for the 500 error
          <img
            src={error500}
            alt="Internal Server Error"
            className="error-image"
          />
        ) : (
          // Render text for other types
          <>
            <p>{location.state?.text || "No message to display."}</p>
          </>
        )}
        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    </div>
  );
};

MessageCard.propTypes = {
  type: PropTypes.oneOf(["success", "error", "info"]),
  text: PropTypes.string,
};

export default MessageCard;
