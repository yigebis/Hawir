
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      setTimeout(() => {
        toast({
          title: "Reset link sent",
          description: "Please check your email for password reset instructions",
        });
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8F9FD] px-4 py-6">
      <div className="w-full max-w-[416px] bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] p-6">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1">
            <img 
              src="/lovable-uploads/660fb2a5-c2d9-4b43-80bb-40e54215ee9d.png" 
              alt="Hawir Logo" 
              className="w-16 h-16"
            />
            <div className="text-[#F35B04] font-['Jost'] text-xl font-bold tracking-wider">
              HAWIR
            </div>
          </div>
        </div>
        
        <div className="text-[#666] font-['Inter'] text-sm mb-5 text-center">
          <span className="font-bold">Reset Password</span> Enter your email to receive reset instructions
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[#1A1A1A] font-['Inter'] text-sm">
              Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`h-11 text-sm ${error ? 'border-red-500' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-[#4E7B34] hover:bg-[#3d6128] text-white rounded-lg font-['Inter'] text-sm mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          
          <div className="flex justify-center mt-4">
            <Link 
              to="/login" 
              className="text-[#0B0E14] text-xs font-['Jost'] cursor-pointer hover:underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
