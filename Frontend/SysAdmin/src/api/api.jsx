import axios from "axios";

// Base URL for your backend
export const API_BASE_URL = "https://hawir-rv5k.onrender.com"; // Replace with your backend's URL

// Fetch all agencies
export const fetchAgencies = async () => {
  const response = await axios.get(`${API_BASE_URL}/agency/all`); // Replace with your backend's endpoint for fetching agencies
  return response.data;
};

// Fetch all events
export const fetchEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/event/all?page=1`);
  return await response.json();
};

// Fetch all locations
export const fetchLocations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destination/all`);
    return response.data;
  } catch (error) {
    console.error("Error in fetchLocations:", error);
    throw error;
  }
};

// Add a new agency
export const addAgency = async (agency) => {
  const response = await axios.post(`${API_BASE_URL}/agency/add`, agency);
  return response.data;
};

// Edit an agency
export const editAgency = async (id, updatedAgency) => {
  const response = await axios.put(
    `${API_BASE_URL}/agency/edit/${id}`,
    updatedAgency
  );
  return response.data;
};

// Delete an agency
export const deleteAgency = async (id, payload) => {
  try {
    const token = sessionStorage.getItem("token"); // Retrieve the token from sessionStorage

    const response = await axios.delete(`${API_BASE_URL}/agency/delete/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
      data: payload, // Include the payload in the request body
    });

    return response.data;
  } catch (error) {
    console.error("Error in deleteAgency:", error);
    throw error;
  }
};

// Delete a location
export const deleteLocation = async (id, payload) => {
  try {
    const token = sessionStorage.getItem("token"); // Retrieve the token from sessionStorage

    const response = await axios.delete(
      `${API_BASE_URL}/destination/delete/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        data: payload, // Include the payload in the request body
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in deleteLocation:", error);
    throw error;
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Failed to login.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in adminLogin:", error);
    throw error;
  }
};