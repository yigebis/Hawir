import React from "react";
import "../../Styles/Agency/StatsCard.css";

const StatsCard = ({ title, value, color }) => {
  return (
    <div className={`stats-card ${color}`}>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  );
};

export default StatsCard;
