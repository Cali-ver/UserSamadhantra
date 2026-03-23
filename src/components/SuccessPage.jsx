import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { verifyPayment, fetchUserProfile } from "../services/api";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}');
  const { 
    userName = pendingPayment.userName || "User", 
    userEmail = pendingPayment.userEmail || "", 
    membershipType = pendingPayment.membershipType || "" 
  } = location.state || {};
  
  // Use fetched profile data if available, otherwise fallback to state/localStorage
  const displayName = userProfile?.full_name || userName;
  const displayEmail = userProfile?.email || userEmail;
  const displayMembershipType = userProfile?.user_type || membershipType;

  useEffect(() => {
    // ✅ CHECK TOKEN & FETCH USER PROFILEnp
    const checkTokenAndVerifyPayment = async () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!authToken || !userData) {
        console.error("❌ No token found, redirecting to home");
        setTokenValid(false);
        navigate('/', { replace: true });
        return;
      }
      
      console.log("✅ Token found:", authToken);
      setTokenValid(true);
      
      // Fetch user profile from API
      setIsFetchingProfile(true);
      try {
        const profile = await fetchUserProfile();
        console.log("✅ User profile fetched:", profile);
        setUserProfile(profile);
        
        // Save updated user data to localStorage
        localStorage.setItem('userData', JSON.stringify(profile));
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        // If token is invalid, redirect to home
        if (error.message.includes("authentication") || error.message.includes("token")) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token_type');
          localStorage.removeItem('userData');
          navigate('/', { replace: true });
          return;
        }
        // Otherwise continue with localStorage data
      } finally {
        setIsFetchingProfile(false);
      }
      
      // Now verify payment
      const paymentData = localStorage.getItem('paymentSuccess');
      
      if (paymentData) {
        setIsVerifying(true);
        try {
          const payment = JSON.parse(paymentData);
          console.log("🔄 Verifying payment on success page...", payment);
          
          const verifyResponse = await verifyPayment({
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature
          });
          
          console.log("✅ Payment verified successfully!", verifyResponse);
          
          // Refetch user profile to get the updated payment_status
          try {
            const updatedProfile = await fetchUserProfile();
            setUserProfile(updatedProfile);
            localStorage.setItem('userData', JSON.stringify(updatedProfile));
          } catch (profileErr) {
            console.error("⚠️ Failed to refetch profile after payment verification:", profileErr);
          }
        } catch (error) {
          console.error("⚠️ Background verification failed:", error);
        } finally {
          localStorage.removeItem('paymentSuccess');
          localStorage.removeItem('pendingPayment');
          setIsVerifying(false);
          setVerificationDone(true);
        }
      } else {
        localStorage.removeItem('pendingPayment');
        setVerificationDone(true);
      }
    };
    
    checkTokenAndVerifyPayment();
    
    // Redirect to dashboard after 5 seconds ONLY if token is valid AND payment_status is paid
    const timer = setTimeout(async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Check payment_status from userProfile or localStorage
        const currentProfile = userProfile || JSON.parse(localStorage.getItem('userData') || '{}');
        const paymentStatus = (currentProfile?.payment_status || '').toLowerCase().trim();
        
        if (paymentStatus === 'paid') {
          navigate("/dashboard");
        } else {
          console.error("❌ Cannot redirect to dashboard - payment_status is not 'paid':", paymentStatus);
        }
      } else {
        console.error("❌ Cannot redirect to dashboard - no token");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Samadhantra!
          </h1>
          
          {isFetchingProfile ? (
            <div className="mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Loading your profile...</p>
            </div>
          ) : (
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {displayName}
            </h3>
          )}
          
          <p className="text-lg text-green-600 font-semibold mb-4">
            Payment Successful! 🎉
          </p>

          <p className="text-gray-600 mb-4">
            Your membership has been activated successfully.
          </p>

          {displayEmail && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span> {displayEmail}
              </p>
            </div>
          )}

          {displayMembershipType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Membership Type:</span> {displayMembershipType}
              </p>
            </div>
          )}

          {/* ✅ TOKEN VALIDATION STATUS */}
          {!tokenValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">Authentication failed - Please contact support</p>
            </div>
          )}

          {isVerifying && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
              <p className="text-sm text-yellow-700">Confirming payment with server...</p>
            </div>
          )}

          {verificationDone && !isVerifying && tokenValid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">Payment confirmed & authenticated!</p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              {tokenValid ? "Redirecting to dashboard in 5 seconds..." : "Please contact support to complete registration"}
            </p>
          </div>

          <button
            onClick={async () => {
              const token = localStorage.getItem('authToken');
              
              if (token) {
                // Verify payment_status before redirecting
                const currentProfile = userProfile || JSON.parse(localStorage.getItem('userData') || '{}');
                const paymentStatus = (currentProfile?.payment_status || '').toLowerCase().trim();
                
                if (paymentStatus === 'paid') {
                  navigate("/dashboard");
                } else {
                  alert(`Payment not completed. Current status: ${paymentStatus || 'unknown'}. Please complete payment first.`);
                }
              } else {
                alert("Authentication required. Please contact support.");
              }
            }}
            disabled={!tokenValid}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
              tokenValid 
                ? "bg-green-500 text-white hover:bg-green-600" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {tokenValid ? "Go to Dashboard Now" : "Authentication Required"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
