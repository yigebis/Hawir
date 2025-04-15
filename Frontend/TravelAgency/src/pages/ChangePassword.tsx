import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";
import { resetAgencyPassword } from "@/lib/api/agency"; // Import the service function
import {
  validateChangePasswordForm, // Import the validation function
  ChangePasswordFormValues,
  ChangePasswordFormErrors,
} from "@/lib/validation/authValidation"; // Import from the correct path

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { agency } = useContext(AuthContext) as AuthContextType;

  const [formData, setFormData] = useState<ChangePasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<ChangePasswordFormErrors>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const validateForm = (): boolean => {
    const newErrors = validateChangePasswordForm(formData);
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when typing
    if (errors[name as keyof ChangePasswordFormErrors]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) { // Call the validateForm function here
      return;
    }

    setIsLoading(true);

    try {
      if (!agency?.unique_id) {
        toast({
          title: "Error",
          description: "Agency information not found. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      console.log(`here is agency data`);
      console.log(agency);

      const payload = {
        agency_id: agency.unique_id,
        old_password: formData.currentPassword,
        new_password: formData.newPassword,
      };

      console.log("Payload");
      console.log(payload);

      const response = await resetAgencyPassword(payload);
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password updated",
          description: data.message || "Your password has been successfully changed.",
        });
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the server. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Change Password</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-[#1A1A1A] font-['Inter'] text-sm">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  className={`h-11 text-sm ${errors.currentPassword ? 'border-red-500' : ''}`}
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.current ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-[#1A1A1A] font-['Inter'] text-sm">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter your new password"
                  className={`h-11 text-sm ${errors.newPassword ? 'border-red-500' : ''}`}
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.new ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[#1A1A1A] font-['Inter'] text-sm">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className={`h-11 text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={20} className="text-gray-500" />
                  ) : (
                    <Eye size={20} className="text-gray-500" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#4E7B34] hover:bg-[#3d6128]"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ChangePassword;