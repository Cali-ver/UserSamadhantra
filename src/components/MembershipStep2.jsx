import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getUserTypes, priceMapping, imageMapping, descriptionMapping } from "../services/api";

const MembershipStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { personalInfo } = location.state || {};
  
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        setLoading(true);
        const data = await getUserTypes();
        setUserTypes(data.data.user_types || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserTypes();
  }, []);

  const handleSelect = (userType) => {
    const price = priceMapping[userType.value] || 10000;
    console.log("Step 2 Submitted - Selected:", userType.label, "Price:", price);
    navigate("/step-3", {
      state: {
        personalInfo,
        stakeholderId: userType.value,
        stakeholderTitle: userType.label,
        stakeholderPrice: price,
      },
    });
  };

  const handleBack = () => {
    navigate("/", {
      state: { personalInfo }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4CAF50]" />
          <span className="text-gray-600">Loading stakeholder types...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#4CAF50] text-white px-6 py-2 rounded-md hover:bg-[#43A047]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Green Header */}
          <div className="bg-[#4CAF50] px-8 py-6">
            <h1 className="text-white text-2xl md:text-3xl font-bold">
              Membership Application - Step 2
            </h1>
            <p className="text-green-100 text-sm mt-2">
              Select your stakeholder category
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#4CAF50] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Step 1
            </button>

            {/* Section Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Select Stakeholder
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Choose the category that best describes you
            </p>

            {/* Stakeholder Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userTypes.map((userType) => (
                <div
                  key={userType.value}
                  className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent transition-all hover:shadow-lg hover:border-[#4CAF50]"
                >
                  {/* Card Image */}
                  <div className="h-40 overflow-hidden">
                    <img
                      src={imageMapping[userType.value] || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop"}
                      alt={userType.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      {userType.label}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {descriptionMapping[userType.value] || "Join our community and access exclusive benefits."}
                    </p>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-[#4CAF50] text-2xl font-bold">
                        ₹{(priceMapping[userType.value] || 10000).toLocaleString("en-IN")}
                      </p>
                      <p className="text-gray-400 text-xs mb-4">
                        Annual Membership Fee
                      </p>

                      <button
                        onClick={() => handleSelect(userType)}
                        className="w-full py-2 px-4 rounded-md border-2 font-semibold transition-colors bg-white text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipStep2;
