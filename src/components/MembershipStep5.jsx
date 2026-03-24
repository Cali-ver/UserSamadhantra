import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, Save, Loader2, CheckCircle, AlertCircle, LogIn } from "lucide-react";
import { registerUser, createPaymentOrder } from "../services/api";

// Helper to validate UUID format
const isValidUUID = (str) => {
  if (!str || str === "undefined" || str === "null") return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str);
};

const MembershipStep5 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    personalInfo, 
    stakeholderId, 
    stakeholderTitle, 
    stakeholderPrice, 
    stakeholderFormData,
    skipRegistration = false, // ✅ NEW: Flag from login flow
    fromLogin = false
  } = location.state || {};

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showPaymentCompleteButton, setShowPaymentCompleteButton] = useState(false);

  // Check for pending/completed payments on mount
  useEffect(() => {
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    if (paymentSuccess) {
      const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}');
      console.log("🔄 Found completed payment, redirecting to success...");
      
      navigate('/success', {
        replace: true,
        state: {
          userName: pendingPayment.userName || "User",
          userEmail: pendingPayment.userEmail || "",
          membershipType: pendingPayment.membershipType || ""
        }
      });
      return;
    }
    
    const pendingPayment = localStorage.getItem('pendingPayment');
    if (pendingPayment) {
      const pending = JSON.parse(pendingPayment);
      const timeDiff = Date.now() - pending.timestamp;
      if (timeDiff > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pendingPayment');
      }
    }
  }, [navigate]);

  // Auto-detect return from UPI app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("📱 User returned to page, checking payment status...");
        
        const paymentSuccess = localStorage.getItem('paymentSuccess');
        const pendingPayment = localStorage.getItem('pendingPayment');
        
        if (paymentSuccess) {
          const pending = JSON.parse(pendingPayment || '{}');
          console.log("✅ Payment found, redirecting to success...");
          navigate('/success', {
            replace: true,
            state: {
              userName: pending.userName || "User",
              userEmail: pending.userEmail || "",
              membershipType: pending.membershipType || ""
            }
          });
        } else if (pendingPayment) {
          const pending = JSON.parse(pendingPayment);
          const timeDiff = Date.now() - pending.timestamp;
          if (timeDiff > 30000) {
            console.log("⚠️ Pending payment detected, showing recovery button");
            setShowPaymentCompleteButton(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [navigate]);

  // Polling timer
  useEffect(() => {
    const pendingPayment = localStorage.getItem('pendingPayment');
    if (!pendingPayment) return;

    const pollingTimer = setTimeout(() => {
      const currentPending = localStorage.getItem('pendingPayment');
      const paymentSuccess = localStorage.getItem('paymentSuccess');
      
      if (currentPending && !paymentSuccess) {
        console.log("⏰ 30s timeout - showing recovery button");
        setShowPaymentCompleteButton(true);
      }
    }, 30000);

    return () => clearTimeout(pollingTimer);
  }, [paymentData]);

  const handleBack = () => {
    navigate("/step-4", {
      state: { personalInfo, stakeholderId, stakeholderTitle, stakeholderPrice, stakeholderFormData }
    });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedToPayment = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setIsEmailAlreadyRegistered(false);

    try {
      let userResponse = null;
      let accessToken = null;

      // ✅ CHECK IF COMING FROM LOGIN (SKIP REGISTRATION)
      if (skipRegistration || fromLogin) {
        console.log("✅ Skipping registration - User came from login");
        accessToken = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!accessToken || !userData.id) {
          throw new Error("Authentication failed. Please login again.");
        }
        
        userResponse = { 
          id: userData.id,
          access_token: accessToken,
          ...userData
        };
        setUserId(userData.id);
        setRegistrationStatus("success");
        
      } else {
        // ✅ CHECK IF USER ALREADY REGISTERED
        const existingUserId = localStorage.getItem('registeredUserId');
        const existingToken = localStorage.getItem('authToken');
        
        if (existingUserId && existingToken) {
          console.log("♻️ User already registered, reusing token");
          userResponse = { 
            id: existingUserId,
            access_token: existingToken,
            user: JSON.parse(localStorage.getItem('userData') || '{}')
          };
          accessToken = existingToken;
          setUserId(existingUserId);
          setRegistrationStatus("success");
          
        } else {
          // ✅ NEW REGISTRATION
          const fullData = {
            ...personalInfo,
            ...stakeholderFormData,
            user_type: stakeholderId,
          };

          const registrationData = {
            ...fullData,
            latitude: fullData.latitude || 0,
            longitude: fullData.longitude || 0,
          };

          // Sanitize conditionally required custom_* fields for ALL user types.
          // Only send custom_X_type when the matching X_type field is 'Other'.
          const conditionalCustomFields = [
            ['freelancer_type',   'custom_freelancer_type'],
            ['investor_type',     'custom_investor_type'],
            ['industry_type',     'custom_industry_type'],
            ['student_type',      'custom_student_type'],
            ['startup_type',      'custom_startup_type'],
            ['service_type',      'custom_service_type'],
            ['incubation_type',   'custom_incubation_type'],
            ['institute_type',    'custom_institute_type'],
          ];

          for (const [typeField, customField] of conditionalCustomFields) {
            if (registrationData[typeField] !== undefined && registrationData[typeField] !== 'Other') {
              delete registrationData[customField];
            }
            if (registrationData[typeField] === undefined) {
              // Field not present at top level — also clean up just in case
              delete registrationData[customField];
            }
          }

          try {
            console.log("🔐 Registering new user...");
            const regResponse = await registerUser(registrationData);
            
            const responseData = regResponse.data || regResponse;
            accessToken = responseData.access_token;
            const tokenType = responseData.token_type || 'bearer';
            const userData = responseData.user || responseData;

            if (!accessToken) {
              console.error("❌ No access_token in response:", regResponse);
              throw new Error("Registration did not return access token");
            }

            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('token_type', tokenType);
            localStorage.setItem('userData', JSON.stringify({
              ...userData,
              access_token: accessToken,
              token_type: tokenType
            }));

            if (!userData.id || !isValidUUID(userData.id)) {
              console.error("❌ Invalid user ID:", userData.id);
              throw new Error("Invalid user ID received from registration");
            }

            userResponse = { 
              id: userData.id, 
              ...userData,
              access_token: accessToken,
              token_type: tokenType
            };

            localStorage.setItem('registeredUserId', userData.id);
            setUserId(userData.id);
            console.log("✅ User registered with ID:", userData.id);
            setRegistrationStatus("success");

          } catch (regError) {
            console.error("❌ Registration failed:", regError);
            
            // ✅ CHECK IF EMAIL ALREADY REGISTERED
            const errorMsg = regError.message || "";
            if (errorMsg.toLowerCase().includes('email') && 
                (errorMsg.toLowerCase().includes('already') || 
                 errorMsg.toLowerCase().includes('exist') ||
                 errorMsg.toLowerCase().includes('registered'))) {
              setIsEmailAlreadyRegistered(true);
              setErrorMessage("This email is already registered. Please login to continue.");
            } else {
              setErrorMessage(errorMsg || "Registration failed. Please try again.");
            }
            
            setRegistrationStatus("error");
            setIsProcessing(false);
            return;
          }
        }
      }

      // ✅ CREATE PAYMENT ORDER
      const paymentOrderData = {
        user_id: userResponse.id,
        user_type: stakeholderId,
        amount: stakeholderPrice,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      console.log("💳 Creating payment order...");
      const orderData = await createPaymentOrder(paymentOrderData);
      console.log("✅ Payment order created:", orderData);

      setPaymentData(orderData);

      // ✅ SAVE PENDING PAYMENT
      const pendingPaymentData = {
        orderId: orderData.order_id,
        amount: stakeholderPrice,
        currency: orderData.currency,
        userId: userResponse.id,
        userName: personalInfo?.full_name || userResponse.full_name,
        userEmail: personalInfo?.email || userResponse.email,
        membershipType: stakeholderId,
        timestamp: Date.now(),
        access_token: accessToken,
        token_type: 'bearer'
      };

      localStorage.setItem('pendingPayment', JSON.stringify(pendingPaymentData));
      console.log("💾 Pending payment saved");

      // ✅ LOAD RAZORPAY
      const script = await loadRazorpayScript();
      if (!script) {
        throw new Error("Razorpay SDK failed to load");
      }

      openRazorpay(orderData, personalInfo || userResponse);

    } catch (error) {
      console.error("❌ Payment flow error:", error);
      setErrorMessage(error.message || "An error occurred");
      setIsProcessing(false);
    }
  };

  const openRazorpay = (orderData, personalData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Samadhantra Membership",
      description: `${stakeholderTitle} Membership`,
      order_id: orderData.order_id,
      handler: async function (response) {
        console.log("✅ Razorpay payment successful:", response);

        const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}');
        if (pendingPayment.access_token) {
          localStorage.setItem('authToken', pendingPayment.access_token);
          localStorage.setItem('token_type', pendingPayment.token_type || 'bearer');
          console.log("✅ Token restored");
        }

        const paymentSuccessData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        };

        localStorage.setItem('paymentSuccess', JSON.stringify(paymentSuccessData));
        console.log("✅ Navigating to success page...");

        navigate('/success', {
          replace: true,
          state: {
            userName: personalData.full_name,
            userEmail: personalData.email,
            membershipType: stakeholderTitle
          }
        });
      },
      prefill: {
        name: personalData.full_name,
        email: personalData.email,
        contact: personalData.phone_number
      },
      theme: {
        color: "#3399cc"
      },
      modal: {
        ondismiss: function() {
          console.log("⚠️ Payment cancelled");
          setIsProcessing(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!stakeholderId) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Please complete the previous steps first.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#4CAF50] text-white px-6 py-2 rounded-md hover:bg-[#43A047]"
            >
              Go to Step 1
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Green Header */}
          <div className="bg-[#4CAF50] px-8 py-6">
            <h1 className="text-white text-2xl md:text-3xl font-bold">
              Membership Application - Step 5
            </h1>
            <p className="text-green-100 text-sm mt-2">
              Complete your payment
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Back Button */}
            {!fromLogin && !skipRegistration && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-[#4CAF50] mb-6 transition-colors"
                disabled={isProcessing}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Step 4
              </button>
            )}

            {/* Info Message - Coming from Login */}
            {(skipRegistration || fromLogin) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Welcome Back!</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Your registration is complete. Please complete the payment to activate your membership.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {registrationStatus === "success" && paymentData && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800">
                      {skipRegistration || fromLogin ? "Ready for Payment!" : "Registration Successful!"}
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                      Payment gateway opened. Please complete the payment.
                    </p>
                    <div className="mt-3 p-3 bg-white rounded border border-green-200">
                      <p className="text-sm text-gray-600">Order ID: <span className="font-mono font-medium">{paymentData.order_id}</span></p>
                      <p className="text-sm text-gray-600">Amount: <span className="font-medium">₹{paymentData.amount?.toLocaleString("en-IN")}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message with Login Button */}
            {registrationStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">Registration Failed</h3>
                    <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                    
                    {/* ✅ LOGIN BUTTON - Only show if email already registered */}
                    {isEmailAlreadyRegistered && (
                      <button
                        onClick={() => navigate('/login')}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <LogIn className="w-4 h-4" />
                        Go to Login Page
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Complete Fallback Button */}
            {showPaymentCompleteButton && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800">Payment Complete?</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        If you have successfully completed the payment, click the button below:
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment') || '{}');
                      navigate('/success', {
                        replace: true,
                        state: {
                          userName: pendingPayment.userName || "User",
                          userEmail: pendingPayment.userEmail || "",
                          membershipType: pendingPayment.membershipType || stakeholderTitle
                        }
                      });
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    I've Completed Payment - Go to Success Page
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentCompleteButton(false);
                      if (paymentData) {
                        openRazorpay(paymentData, personalInfo);
                      }
                    }}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    No, I Need to Pay Again
                  </button>
                </div>
              </div>
            )}

            {/* Payment Information Section */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Payment Information
                </h2>
              </div>
              <p className="text-gray-500 text-sm mb-6 ml-8">
                Review the amount and proceed to payment
              </p>

              {/* Amount Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Total Amount to Pay</p>
                    <p className="text-3xl font-bold text-green-800">
                      ₹{stakeholderPrice?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Selected Stakeholder:</p>
                    <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
                      {stakeholderTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={registrationStatus === "success" || isProcessing}
                  className="mt-0.5 w-5 h-5 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 font-medium hover:underline">
                    Terms & Conditions
                  </a>{" "}
                  and understand that membership activation is subject to administrative approval.
                </span>
              </label>
            </div>

            {/* Proceed Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleProceedToPayment}
                disabled={!agreedToTerms || isProcessing || registrationStatus === "success"}
                className={`flex items-center gap-2 px-8 py-3 rounded-md font-semibold transition-colors ${
                  !agreedToTerms || isProcessing || registrationStatus === "success"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4CAF50] hover:bg-[#43A047]"
                } text-white`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : skipRegistration || fromLogin ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Register & Proceed to Payment
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500">
                {registrationStatus === "success" 
                  ? "Payment gateway has been opened in a new window"
                  : skipRegistration || fromLogin
                    ? "Click to open payment gateway"
                    : "Click to register and open payment gateway"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipStep5;