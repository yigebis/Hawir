import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./Components/SignIn/SignIn";
import Dashboard from "./Components/Dashboard/Dashboard";
import ManageAgencies from "./Components/ManageAgencies/ManageAgencies";
import ManageEvents from "./Components/ManageEvents/ManageEvents";
import ManageLocations from "./Components/ManageLocations/ManageLocations";
import { fetchAgencies } from "./api/api"; // Import the fetchAgencies API function

const App = () => {
  const [agencies, setAgencies] = useState([]);
  const [events, setEvents] = useState([]); // Placeholder for events
  const [locations, setLocations] = useState([]); // Placeholder for locations

  // Fetch agencies from the backend when the app loads
  useEffect(() => {
    const loadAgencies = async () => {
      try {
        const data = await fetchAgencies(); // Fetch agencies from the backend
        setAgencies(data); // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching agencies:", error);
      }
    };

    loadAgencies();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              agencies={agencies}
              setAgencies={setAgencies}
              events={events}
              setEvents={setEvents}
              locations={locations}
              setLocations={setLocations}
            />
          }
        />
        <Route
          path="/manage-agencies"
          element={
            <ManageAgencies agencies={agencies} setAgencies={setAgencies} />
          }
        />
        <Route
          path="/manage-events"
          element={<ManageEvents events={events} setEvents={setEvents} />}
        />
        <Route
          path="/manage-locations"
          element={
            <ManageLocations
              locations={locations}
              setLocations={setLocations}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
