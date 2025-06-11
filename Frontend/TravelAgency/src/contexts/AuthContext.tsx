import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { loginAgencyAdmin } from "@/lib/api/auth";
import { getAgencyByUniqueID, AgencyData } from "@/lib/api/agency"; // Import AgencyData

interface User {
  name: string;
  email: string;
  agencyId: string;
  profilePicture?: string;
  registrationDate?: string;
  services?: string[];
  description?: string;
  contact?: string[];
  language?: string;
  calendar?: string;
  // adminRole?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  agency: AgencyData | null; // Add agency data to the context
  token: string | null;
  login: (credentials: { agencyId: string; email: string; password: string }, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [agency, setAgency] = useState<AgencyData | null>(null); // State for agency data
  const [token, setToken] = useState<string | null>(null); // <-- Add token state
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Attempt to load user, agency, and token from local storage on mount
    const storedUser = localStorage.getItem("user");
    const storedAgency = localStorage.getItem("agency");
    const storedToken = localStorage.getItem("token"); // <-- Load token from local storage

    if (storedUser && storedToken) { // isAuthenticated if user and token are present
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken); // <-- Set token state
        setIsAuthenticated(true);

        // Optionally load agency if stored
        if (storedAgency) {
          setAgency(JSON.parse(storedAgency));
        } else {
          // If user and token are present but agency isn't, you might
          // want to refetch agency data here using the token and parsedUser.agencyId
          // Example: getAgencyByUniqueID(parsedUser.agencyId, storedToken).then(setAgency).catch(console.error);
          // For simplicity, we'll just proceed without agency data if it's missing in storage.
        }

      } catch (e) {
        console.error("Failed to parse stored auth data:", e);
        // Clear invalid storage items if parsing fails
        localStorage.removeItem("user");
        localStorage.removeItem("agency");
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setAgency(null);
        setToken(null);
      }
    } else {
      // If user or token is missing, ensure we are not authenticated and clear storage
      localStorage.removeItem("user");
      localStorage.removeItem("agency");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
      setAgency(null);
      setToken(null);
    }

    setIsLoading(false);
  }, []); // Empty dependency array means this runs once on mount

  const login = async (credentials: { agencyId: string; email: string; password: string }, rememberMe: boolean) => {
    setIsLoading(true);
    // Clear any previous errors or state before attempting login
    setUser(null);
    setAgency(null);
    setToken(null);
    setIsAuthenticated(false);

    try {
      const loginResponse = await loginAgencyAdmin(credentials);
      console.log("login Response:", loginResponse);
      const { token } = loginResponse; // <-- Get the token here!
      setToken(token);
      console.log("Token received:", token);

      // Decode token to get agency_id (assuming your token payload structure)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const uniqueID = payload.agency_id; // Adjust key based on your token payload

      // Use the newly acquired token to fetch agency data if getAgencyByUniqueID requires it
      // Modify getAgencyByUniqueID if it needs the token as an argument
      const agencyData = await getAgencyByUniqueID(uniqueID, token); // <-- Pass token if required by your API call
      setAgency(agencyData); // Store agency data in context state

      console.log("Retrieved Agency Data:", agencyData); // Console log the data

      const loggedInUser: User = {
        name: agencyData.name, // Map data from agencyData
        email: agencyData.super_admin_email, // Map data from agencyData
        agencyId: agencyData.unique_id, // Map data from agencyData
        profilePicture: agencyData.logo_url,
        registrationDate: agencyData.registration_date,
        services: agencyData.services,
        description: agencyData.description,
        contact: agencyData.contact,
        language: agencyData.language,
        calendar: agencyData.calendar,
        // adminRole: payload.role, // Get role from token payload if available/needed
      };

      setUser(loggedInUser); // <-- Set user state
      setToken(token); // <-- Set token state
      setIsAuthenticated(true); // <-- Set authenticated state

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("agency", JSON.stringify(agencyData));
        localStorage.setItem("token", token); // <-- Store the token in local storage
      }

      navigate("/"); // Navigate after successful login
      toast({
        title: "Login successful",
        description: `Welcome, ${loggedInUser.name}!`,
      });

    } catch (error: any) {
      // Clear state and local storage on login failure
      setUser(null);
      setAgency(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("agency");
      localStorage.removeItem("token");

      let errorMessage = "Login failed.";
      if (error.message === "Invalid email or password") {
        errorMessage = "The email and password combination you entered is incorrect.";
      } else if (error.message === "Agency ID not found") {
        errorMessage = "The Agency ID you entered does not exist.";
      } else if (error.message) {
        // Attempt to use a more specific error message from the caught error object
        // Check if error has a structure like { message: "..." }
        try {
          const errorJson = JSON.parse(error.message); // Assuming error.message might be a stringified JSON
          errorMessage = errorJson.message || error.message;
        } catch (e) {
          errorMessage = error.message; // Fallback to using the raw error message string
        }
      } else {
        errorMessage = "An unexpected error occurred during login.";
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAgency(null); // Clear agency data on logout
    setToken(null); // <-- Clear token state on logout
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("agency"); // Clear agency data from local storage
    localStorage.removeItem("token"); // <-- Clear token from local storage
    navigate("/login"); // Redirect to login page
  };

  return (
    // Include token in the context value
    <AuthContext.Provider value={{ isAuthenticated, user, agency, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};