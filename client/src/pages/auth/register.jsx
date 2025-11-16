import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBag, Lock, Mail, User, UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import axios from "axios";
import apiConfig from "@/config/api";

const UserRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Get the previous page from location state, or default to home
  const from = location.state?.from || '/';
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    match: false,
  });

  // Add blob animation CSS
  useEffect(() => {
    const styleId = 'register-page-animations';
    // Check if style already exists
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes blob {
        0% {
          transform: translate(0px, 0px) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
        100% {
          transform: translate(0px, 0px) scale(1);
        }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Real-time password validation
  useEffect(() => {
    setPasswordValidation({
      length: formData.password.length >= 6,
      match: formData.password === formData.confirmPassword && formData.password.length > 0 && formData.confirmPassword.length > 0,
    });
  }, [formData.password, formData.confirmPassword]);

  const handlePasswordChange = (value) => {
    setFormData({ ...formData, password: value });
  };

  const handleConfirmPasswordChange = (value) => {
    setFormData({ ...formData, confirmPassword: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call backend API for registration
      const response = await axios.post(
        `${apiConfig.BASE_URL}/api/auth/user/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store user session
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userToken", token);

        toast({
          title: "Success",
          description: "Account created successfully!",
        });

        // Redirect to the previous page or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 pt-4 pb-4 sm:py-6 overflow-y-auto">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md z-10 my-2 sm:my-4 md:my-0">
        <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1.5 sm:space-y-2 text-center px-3 sm:px-6 pt-3 sm:pt-6 md:pt-8 pb-2 sm:pb-4">
            <div className="flex justify-center mb-1.5 sm:mb-3 md:mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 sm:p-3 md:p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base text-gray-600">
              Sign up to get started with price comparison and save more
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 md:pb-8">
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4 md:space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 text-sm sm:text-base rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        passwordValidation.length ? "text-green-500" : "text-gray-300"
                      }`}
                    />
                    <span className={passwordValidation.length ? "text-green-600" : "text-gray-500"}>
                      At least 6 characters
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 text-sm sm:text-base rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <CheckCircle2
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        passwordValidation.match ? "text-green-500" : "text-red-400"
                      }`}
                    />
                    <span className={passwordValidation.match ? "text-green-600" : "text-red-600"}>
                      {passwordValidation.match ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {/* Sign Up Button */}
              <div className="pt-1.5 pb-1">
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading || !passwordValidation.length || !passwordValidation.match}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Sign Up
                    </>
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center text-xs sm:text-sm text-gray-600 mt-2 sm:mt-4 md:mt-5 pb-1 sm:pb-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Login here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default UserRegister;


