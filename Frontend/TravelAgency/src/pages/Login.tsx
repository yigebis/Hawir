import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateLoginForm, LoginFormErrors, LoginFormValues } from "@/hooks/validation"; // Adjust path as needed

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth(); // Get login function and loading state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Local loading state for UI
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormValues>({
    agencyId: "",
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({
    agencyId: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);

    if (Object.values(validationErrors).every(error => error === "")) {
      // Call the login function from the AuthContext
      await login({
        agencyId: formData.agencyId,
        email: formData.email,
        password: formData.password,
      }, formData.rememberMe);
    }
    // If there are errors, the 'errors' state will be updated,
    // and the error messages will be displayed in the UI.
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when typing
    setErrors({
      ...errors,
      [name]: ""
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8F9FD] px-4 py-6">
      <div className="w-full max-w-[416px] bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] p-6">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1">
            <img alt="Hawir Logo" className="w-16 h-16" src="/lovable-uploads/214b2982-c671-40f6-9c44-c4f4ddf94148.png" />
            <div className="text-[#F35B04] font-['Jost'] text-xl font-bold tracking-wider">
              HAWIR
            </div>
          </div>
        </div>

        <div className="text-[#666] font-['Inter'] text-sm mb-5 text-center">
          <span className="font-bold">Welcome Back</span> Log in to your travel agency account
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="agencyId" className="text-[#1A1A1A] font-['Inter'] text-sm">
              Agency ID
            </label>
            <div className="relative">
              <Input id="agencyId" name="agencyId" type="text" placeholder="Enter your agency ID" className={`h-11 text-sm ${errors.agencyId ? 'border-red-500' : ''}`} value={formData.agencyId} onChange={handleChange} />
              {errors.agencyId && <p className="text-red-500 text-xs mt-1">{errors.agencyId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[#1A1A1A] font-['Inter'] text-sm">
              Email
            </label>
            <div className="relative">
              <Input id="email" name="email" type="email" placeholder="Enter your email" className={`h-11 text-sm ${errors.email ? 'border-red-500' : ''}`} value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[#1A1A1A] font-['Inter'] text-sm">
              Password
            </label>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className={`h-11 text-sm ${errors.password ? 'border-red-500' : ''}`} value={formData.password} onChange={handleChange} />
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Checkbox id="rememberMe" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} className="w-4 h-4 rounded-sm" />
            <label htmlFor="rememberMe" className="text-[#666] font-['Inter'] text-sm cursor-pointer">
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full h-12 bg-[#4E7B34] hover:bg-[#3d6128] text-white rounded-lg font-['Inter'] text-sm mt-6" disabled={authLoading}>
            {authLoading ? "Logging in..." : "Log In"}
          </Button>

          <div className="flex justify-center mt-4">
            <Link to="/forgot-password" className="text-[#0B0E14] text-xs font-['Jost'] cursor-pointer hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;