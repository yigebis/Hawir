import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./Components/SignIn/SignIn";
import Dashboard from "./Components/Dashboard/Dashboard";
import ManageAgencies from "./Components/ManageAgencies/ManageAgencies";
import ManageEvents from "./Components/ManageEvents/ManageEvents";
import ManageLocations from "./Components/ManageLocations/ManageLocations";
import Settings from "./Components/Settings/Settings";
import DeleteAgenciesPage from "./Components/DeleteAgencies/DeleteAgenciesPage";
import DeleteLocationsPage from "./Components/DeleteLocationsPage/DeleteLocationsPage";
import DeleteEventsPage from "./Components/DeleteEventsPage/DeleteEventsPage";
import LocationDetails from "./Components/LocationDetails/LocationDetails";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

import { fetchAgencies, fetchLocations, fetchEvents } from "./api/api"; // Import the fetchAgencies and fetchLocations API functions

const App = () => {
  const [agencies, setAgencies] = useState([]);
  const [events, setEvents] = useState([]); // Placeholder for events
  const [locations, setLocations] = useState([]); // Placeholder for locations

  // Fetch agencies and locations from the backend when the app loads
  useEffect(() => {
    const loadData = async () => {
      try {
        const agenciesData = await fetchAgencies(); // Fetch agencies
        setAgencies(agenciesData); // Update agencies state

        const locationsData = await fetchLocations(); // Fetch locations
        setLocations(locationsData); // Update locations state

        const eventsData = await fetchEvents(); // Fetch events
        setEvents(eventsData); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<SignIn />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                agencies={agencies}
                setAgencies={setAgencies}
                events={events}
                setEvents={setEvents}
                locations={locations}
                setLocations={setLocations}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-agencies"
          element={
            <ProtectedRoute>
              <ManageAgencies agencies={agencies} setAgencies={setAgencies} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-events"
          element={
            <ProtectedRoute>
              <ManageEvents events={events} setEvents={setEvents} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-locations"
          element={
            <ProtectedRoute>
              <ManageLocations
                locations={locations}
                setLocations={setLocations}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location-details/:id"
          element={
            <ProtectedRoute>
              <LocationDetails
                locations={locations}
                setLocations={setLocations}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/deleteagencies"
          element={
            <ProtectedRoute>
              <DeleteAgenciesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/deleteevents"
          element={
            <ProtectedRoute>
              <DeleteEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/deletelocations"
          element={
            <ProtectedRoute>
              <DeleteLocationsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
