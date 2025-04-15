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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAgency = localStorage.getItem("agency"); // Optionally store agency in local storage
    if (storedUser && storedAgency) {
      setUser(JSON.parse(storedUser));
      setAgency(JSON.parse(storedAgency));
      setIsAuthenticated(true);
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      // Potentially refetch agency data here if it wasn't stored
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { agencyId: string; email: string; password: string }, rememberMe: boolean) => {
    setIsLoading(true);

    try {
      const loginResponse = await loginAgencyAdmin(credentials);
      const { token } = loginResponse;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const uniqueID = payload.agency_id;

      const agencyData = await getAgencyByUniqueID(uniqueID, token);
      setAgency(agencyData); // Store agency data in context state

      console.log("Retrieved Agency Data:", agencyData); // Console log the data

      const loggedInUser: User = {
        name: agencyData.name,
        email: agencyData.super_admin_email,
        agencyId: agencyData.unique_id,
        profilePicture: agencyData.logo_url,
        registrationDate: agencyData.registration_date,
        services: agencyData.services,
        description: agencyData.description,
        contact: agencyData.contact,
        language: agencyData.language,
        calendar: agencyData.calendar,
        // adminRole: payload.role,
      };

      setUser(loggedInUser);
      setIsAuthenticated(true);

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("agency", JSON.stringify(agencyData)); // Optionally store agency in local storage
      }

      navigate("/");
      toast({
        title: "Login successful",
        description: `Welcome, ${loggedInUser.name}!`,
      });

    } catch (error: any) {
      let errorMessage = "Login failed.";
      if (error.message === "Invalid email or password") {
        errorMessage = "The email and password combination you entered is incorrect.";
      } else if (error.message === "Agency ID not found") {
        errorMessage = "The Agency ID you entered does not exist.";
      } else if (error.message) {
        errorMessage = error.message; // Use the backend's specific error if available
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
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("agency"); // Clear agency data from local storage
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, agency, login, logout, isLoading }}>
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