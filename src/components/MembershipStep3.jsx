import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { getUserTypeSchema } from "../services/api";

const MembershipStep3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { personalInfo, stakeholderId, stakeholderTitle, stakeholderPrice } = location.state || {};

  const [formData, setFormData] = useState({});
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchema = async () => {
      if (!stakeholderId) return;
      try {
        setLoading(true);
        const data = await getUserTypeSchema(stakeholderId);
        setSchema(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();

    // Load saved data from sessionStorage
    const savedData = sessionStorage.getItem('step3Data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, [stakeholderId]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      // Auto-save to sessionStorage on every change
      sessionStorage.setItem('step3Data', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleBack = () => {
    // Save before going back
    sessionStorage.setItem('step3Data', JSON.stringify(formData));
    navigate("/step-2");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Step 3 Submitted:", {
      stakeholder: stakeholderTitle,
      price: stakeholderPrice,
      formData,
    });
    // Save before navigation
    sessionStorage.setItem('step3Data', JSON.stringify(formData));
    // Navigate to Step 4 (Category, Sub Category, Describe Your Need, Subscriptions)
    navigate("/step-4", {
      state: {
        personalInfo,
        stakeholderId,
        stakeholderTitle,
        stakeholderPrice,
        stakeholderFormData: formData,
      }
    });
  };

  if (!stakeholderId) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Please select a stakeholder category first.</p>
            <button
              onClick={() => navigate("/step-2")}
              className="bg-[#4CAF50] text-white px-6 py-2 rounded-md hover:bg-[#43A047]"
            >
              Go to Step 2
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#4CAF50]" />
          <span className="text-gray-600">Loading form fields...</span>
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

  // Convert schema fields to sorted array
  const fields = schema?.fields
    ? Object.entries(schema.fields)
        .map(([key, value]) => ({ name: key, ...value }))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Green Header */}
          <div className="bg-[#4CAF50] px-8 py-6">
            <h1 className="text-white text-2xl md:text-3xl font-bold">
              Membership Application - Step 3
            </h1>
            <p className="text-green-100 text-sm mt-2">
              Complete your {stakeholderTitle} details
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
              Back to Step 2
            </button>

            {/* Selected Stakeholder Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-4">
              <div className="bg-[#4CAF50] p-3 rounded-full">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{stakeholderTitle}</p>
                <p className="text-[#4CAF50] font-bold">₹{stakeholderPrice?.toLocaleString("en-IN")} / Year</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Stakeholder Specific Form */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4CAF50]" />
                  {stakeholderTitle} Details
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Please provide the following details
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={field.type === "textarea" ? "md:col-span-2" : ""}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required !== false && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {(field.type === "string" || field.type === "text") && (
                        <input
                          type="text"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required !== false}
                          minLength={field.min_length}
                          maxLength={field.max_length}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}

                      {field.type === "select" && (
                        <select
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required !== false}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required !== false}
                          rows={4}
                          minLength={field.min_length}
                          maxLength={field.max_length}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-y"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required !== false}
                          min={field.min}
                          max={field.max}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#4CAF50] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#43A047] transition-colors"
                >
                  Next Step
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipStep3;
