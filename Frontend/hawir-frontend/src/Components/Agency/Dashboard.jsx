import React from "react";
import StatsCard from "../Agency/StatsCard";
import RecentActivity from "../Agency/RecentActivity";
import "../../Styles/Agency/Dashboard.css";

const Dashboard = ({ openForm }) => {
  return (
    <div className="dashboard-content">
      {/* Top Banner */}
      <div className="banner">
        <h3>Manage your travels with ease</h3>
        {/* Statistics Section */}
        <div className="stats">
          <StatsCard
            title="Total Customer"
            value="10,000+"
            color="stascardRed"
          />
          <StatsCard title="Active Travel" value="800+" color="stascardGreen" />
          <StatsCard title="Destination" value="60+" color="stascardOrange" />
          <StatsCard title="Canceled Travels" value="6" color="stascardGray" />
        </div>
      </div>

      {/* Recent Activity Section */}
      <RecentActivity openForm={openForm} />
    </div>
  );
};

export default Dashboard;
