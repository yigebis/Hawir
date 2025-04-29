import axios from "axios";

// Base URL for your backend
export const API_BASE_URL = "https://hawir-rv5k.onrender.com"; // Replace with your backend's URL

// Fetch all agencies
export const fetchAgencies = async () => {
  const response = await axios.get(`${API_BASE_URL}/agency/all`); // Replace with your backend's endpoint for fetching agencies
  return response.data;
};

// Add a new agency
export const addAgency = async (agency) => {
  const response = await axios.post(`${API_BASE_URL}/agency/add`, agency);
  return response.data;
};

// Edit an agency
export const editAgency = async (id, updatedAgency) => {
  const response = await axios.put(`${API_BASE_URL}/agency/edit/${id}`, updatedAgency);
  return response.data;
};

// Delete an agency
export const deleteAgency = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/agency/delete/${id}`);
  return response.data;
};