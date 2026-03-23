import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Eye, EyeOff, MapPin, Loader2 } from "lucide-react";
import { getCommonSchema } from "../services/api";

const MembershipStep1 = () => {
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    about_yourself: "",
    reference_number: "",
    objective: "",
  });

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoading(true);
        const data = await getCommonSchema();
        setSchema(data.data.fields);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();

    // Load saved data from sessionStorage
    const savedData = sessionStorage.getItem('step1Data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      // Auto-save to sessionStorage on every change
      sessionStorage.setItem('step1Data', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Step 1 Submitted:", formData);
    // Save before navigation
    sessionStorage.setItem('step1Data', JSON.stringify(formData));
    navigate("/step-2", {
      state: { personalInfo: formData }
    });
  };

  // Get objective options from schema
  const objectiveOptions = schema?.objective?.options || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4CAF50]" />
          <span className="text-gray-600">Loading form...</span>
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
              Membership Application - Step 1
            </h1>
            <p className="text-green-100 text-sm mt-2">
              Fill your details first, then proceed to payment
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-[#4CAF50]" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Please provide your personal details
              </p>

              <div className="grid grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.full_name?.label || "Full Name"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    minLength={schema?.full_name?.min_length}
                    maxLength={schema?.full_name?.max_length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.email?.label || "Email"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your User ID
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.password?.label || "Password"} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.phone_number?.label || "Phone Number"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="Enter your mobile number"
                    pattern={schema?.phone_number?.pattern?.replace(/\\/g, '\\')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Address Details
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.address?.label || "Address"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter your address"
                    minLength={schema?.address?.min_length}
                    maxLength={schema?.address?.max_length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.city?.label || "City"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Enter your city"
                    minLength={schema?.city?.min_length}
                    maxLength={schema?.city?.max_length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.state?.label || "State"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="Enter your state"
                    minLength={schema?.state?.min_length}
                    maxLength={schema?.state?.max_length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Location (Lat/Long) */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.latitude?.label || "Latitude"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    step="any"
                    min={schema?.latitude?.min}
                    max={schema?.latitude?.max}
                    placeholder="Enter latitude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.longitude?.label || "Longitude"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    step="any"
                    min={schema?.longitude?.min}
                    max={schema?.longitude?.max}
                    placeholder="Enter longitude"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Current Location
                  </button>
                </div>
              </div>
            </div>

            {/* About Yourself Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                About Yourself
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {schema?.about_yourself?.label || "About Yourself"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="about_yourself"
                  value={formData.about_yourself}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Write a brief description about yourself..."
                  minLength={schema?.about_yourself?.min_length}
                  maxLength={schema?.about_yourself?.max_length}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Membership Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Membership Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.reference_number?.label || "Reference Number"}
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    placeholder="Enter reference number (if any)"
                    maxLength={schema?.reference_number?.max_length}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - If you have a reference number
                  </p>
                </div>

                {/* Objective */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {schema?.objective?.label || "Objective"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="objective"
                    value={formData.objective}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select Objective</option>
                    {objectiveOptions.map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#4CAF50] hover:bg-[#43a047] text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 text-base"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MembershipStep1;
