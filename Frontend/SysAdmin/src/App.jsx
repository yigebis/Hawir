import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./Components/SignIn/SignIn";
import Dashboard from "./Components/Dashboard/Dashboard";
import ManageAgencies from "./Components/ManageAgencies/ManageAgencies";
import logo from "./assets/logo.jpg";
import ManageEvents from "./Components/ManageEvents/ManageEvents";

const App = () => {
  const [agencies, setAgencies] = useState([
    {
      id: 1,
      name: "Selam Bus",
      logo: logo,
      description: "Leading national bus service provider.",
      services: ["Luxury Buses", "Online Booking", "Parcel Delivery"],
      contact: ["+251-911-123456", "info@selambus.com"],
      superAdminEmail: "admin@selambus.com",
    },
    {
      id: 2,
      name: "Golden Bus",
      logo: logo,
      description: "Reliable regional transport services.",
      services: ["Affordable Fares", "Group Travel"],
      contact: ["+251-922-654321", "support@goldenbus.com"],
      superAdminEmail: "admin@goldenbus.com",
    },
  ]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route
          path="/dashboard"
          element={<Dashboard agencies={agencies} setAgencies={setAgencies} />}
        />
        <Route
          path="/manage-agencies"
          element={
            <ManageAgencies agencies={agencies} setAgencies={setAgencies} />
          }
        />
        <Route
          path="/manage-events"
          element={<ManageEvents/>}
        />
      </Routes>
    </Router>
  );
};

export default App;
