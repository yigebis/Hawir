import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Registration from "./Pages/Registration";
import MessagePage from "./Pages/MessagePage";
import Home from "./Pages/Home";
import TravelView from "./Pages/TravelView";
// import Dashboard from "./Dashboard"; // Example: A protected route after login

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/message" element={<MessagePage />} />
        <Route path="/travelview" element={<TravelView />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
