import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token"); // Check if the token exists

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/" replace />;
  }

  // If token exists, render the protected component
  return children;
};

export default ProtectedRoute;