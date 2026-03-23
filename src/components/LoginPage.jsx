import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft } from "lucide-react";
import { loginUser, priceMapping, fetchUserProfile } from "../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Step 1: Login API call
      console.log("🔍 Starting login API call for:", formData.email);
      const response = await loginUser(formData);
      
      console.log("🔍 Login API response received:", response);
      console.log("🔍 Response keys:", Object.keys(response));
      console.log("🔍 Full response:", JSON.stringify(response, null, 2));
      
      // Handle different response structures - check for nested data or direct properties
      let loginData = response;
      if (response?.data) {
        loginData = response.data;
        console.log("🔍 Response has nested 'data' property, using that");
      }
      
      // Check for access_token in various possible locations
      const accessToken = loginData?.access_token || loginData?.accessToken || response?.access_token || response?.accessToken;
      const paymentStatus = loginData?.payment_status || loginData?.paymentStatus || response?.payment_status || response?.paymentStatus;
      const tokenType = loginData?.token_type || loginData?.tokenType || response?.token_type || response?.tokenType || 'bearer';
      
      console.log("🔍 Extracted values:", { accessToken: !!accessToken, paymentStatus, tokenType });
      
      // Validate response structure
      if (!accessToken) {
        console.error("❌ No access_token found in response structure");
        console.error("❌ Response structure:", JSON.stringify(response, null, 2));
        throw new Error("Invalid login response: missing access_token. Please check API response structure.");
      }
      
      console.log("✅ Login successful, access_token found");
      
      // ✅ Step 2: Save authentication tokens IMMEDIATELY
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('token_type', tokenType);
      
      // ✅ Step 3: Fetch complete user profile using apiClient (has interceptors)
      let userData;
      try {
        console.log("🔍 Fetching user profile...");
        userData = await fetchUserProfile();
        console.log("🔍 User profile fetched successfully:", userData);
      } catch (profileError) {
        console.error("🔍 Profile fetch error:", profileError);
        
        // If profile fetch fails, try using response data if available
        // Otherwise, use payment_status from login response directly
        console.warn("⚠️ Profile fetch failed, using login response data:", profileError);
        
        // Check if we have payment_status in the login response
        if (paymentStatus) {
          // Create minimal userData from login response
          const userInfo = loginData?.user || response?.user || {};
          userData = {
            id: userInfo.id || loginData?.id || response?.id || localStorage.getItem('registeredUserId'),
            payment_status: paymentStatus,
            user_type: userInfo.user_type || userInfo.userType || loginData?.user_type,
            full_name: userInfo.full_name || userInfo.fullName || loginData?.full_name,
            email: formData.email,
            phone_number: userInfo.phone_number || userInfo.phoneNumber || loginData?.phone_number
          };
        } else {
          console.warn("⚠️ No payment_status in login response, will fetch from profile");
          // Try to fetch profile one more time, or treat as unpaid
          throw new Error("Failed to fetch user profile and no payment_status in login response");
        }
      }
      
      console.log("✅ User profile fetched:", userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('registeredUserId', userData.id);

        // Immediately navigate to dashboard after successful login
        navigate('/dashboard', { replace: true });
        return;
      
      // ✅ Step 4: Redirect based on payment status
      // Use userData.payment_status as primary source (from profile), fallback to paymentStatus from login response
      const finalPaymentStatus = (userData?.payment_status || paymentStatus || '').toLowerCase().trim();
      
      console.log("🔍 Payment status check:", { finalPaymentStatus, userDataPaymentStatus: userData?.payment_status, loginResponsePaymentStatus: paymentStatus });
      console.log("🔍 Full response object:", JSON.stringify(response, null, 2));
      console.log("🔍 Full userData object:", JSON.stringify(userData, null, 2));
      
      // Verify token is still in localStorage before redirecting
      const tokenBeforeRedirect = localStorage.getItem('authToken');
      console.log("🔍 Token check before redirect:", { hasToken: !!tokenBeforeRedirect, tokenLength: tokenBeforeRedirect?.length });
      
      if (finalPaymentStatus === 'paid') {
        // Payment complete → Dashboard
        console.log("✅ Payment status: PAID → Redirecting to Dashboard");
        console.log("🔍 About to call navigate('/dashboard')");
        
        // Double-check token exists before navigating
        if (!localStorage.getItem('authToken')) {
          console.error("❌ CRITICAL: Token missing before dashboard redirect!");
          setError("Authentication error. Please try again.");
          return;
        }
        
        navigate('/dashboard', { replace: true });
        console.log("✅ Navigate call completed");
        
      } else if (finalPaymentStatus === 'pending' || finalPaymentStatus === 'unpaid') {
        // Payment incomplete → Direct to Step 5 (Payment page)
        console.log("⚠️ Payment status: PENDING/UNPAID → Redirecting to Payment");
        console.log("🔍 About to call navigate('/step-5')");
        
        // ✅ Save pending payment info for Step 5
        const pendingPayment = {
          userName: userData.full_name,
          userEmail: userData.email,
          membershipType: userData.user_type,
          userId: userData.id
        };
        localStorage.setItem('pendingPayment', JSON.stringify(pendingPayment));
        
        // Get price from mapping
        const userType = userData?.user_type || loginData?.user?.user_type || response?.user?.user_type;
        const stakeholderPrice = priceMapping[userType] || 1000;
        
        // Verify token before redirecting
        if (!localStorage.getItem('authToken')) {
          console.error("❌ CRITICAL: Token missing before step-5 redirect!");
          setError("Authentication error. Please try again.");
          return;
        }
        
        // ✅ Redirect to Step 5 with user data
        navigate('/step-5', { 
          replace: true,
          state: {
            fromLogin: true,
            personalInfo: {
              full_name: userData?.full_name || "",
              email: userData?.email || formData.email,
              phone_number: userData?.phone_number || ""
            },
            stakeholderId: userType,
            stakeholderTitle: userType?.charAt(0).toUpperCase() + userType?.slice(1) || "Member",
            stakeholderPrice: stakeholderPrice,
            skipRegistration: true // ✅ Important: Skip registration, only show payment
          }
        });
        console.log("✅ Navigate to step-5 call completed");
        
      } else {
        // Unknown/null/empty status → Treat as unpaid and redirect to payment
        console.warn("⚠️ Unknown or missing payment status:", finalPaymentStatus, "- Treating as unpaid");
        
        // Treat unknown status as unpaid - redirect to payment page
        const userType = userData?.user_type || loginData?.user?.user_type || response?.user?.user_type || 'student';
        const stakeholderPrice = priceMapping[userType] || 1000;
        
        const pendingPayment = {
          userName: userData?.full_name || loginData?.user?.full_name || response?.user?.full_name || "User",
          userEmail: userData?.email || formData.email,
          membershipType: userType,
          userId: userData?.id || loginData?.user?.id || response?.user?.id
        };
        localStorage.setItem('pendingPayment', JSON.stringify(pendingPayment));
        
        navigate('/step-5', { 
          replace: true,
          state: {
            fromLogin: true,
            personalInfo: {
              full_name: userData?.full_name || loginData?.user?.full_name || response?.user?.full_name || "",
              email: userData?.email || formData.email,
              phone_number: userData?.phone_number || loginData?.user?.phone_number || response?.user?.phone_number || ""
            },
            stakeholderId: userType,
            stakeholderTitle: userType?.charAt(0).toUpperCase() + userType?.slice(1) || "Member",
            stakeholderPrice: stakeholderPrice,
            skipRegistration: true
          }
        });
      }
      
    } catch (error) {
      console.error("❌ Login failed:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // IMPORTANT: Do NOT redirect on error - just show error message
      // The axios interceptor might redirect, but we should prevent that during login
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Login to your Samadhantra account</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Register Now
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;