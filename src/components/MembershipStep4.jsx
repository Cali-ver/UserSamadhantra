import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";
import { getCommonSchema } from "../services/api";

const MembershipStep4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { personalInfo, stakeholderId, stakeholderTitle, stakeholderPrice, stakeholderFormData } = location.state || {};

  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const [customSubCategory, setCustomSubCategory] = useState("");
  const [describeNeed, setDescribeNeed] = useState("");

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
    const savedData = sessionStorage.getItem('step4Data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSelectedCategories(parsed.selectedCategories || []);
      setSelectedSubCategories(parsed.selectedSubCategories || []);
      setCustomCategory(parsed.customCategory || "");
      setCustomSubCategory(parsed.customSubCategory || "");
      setDescribeNeed(parsed.describeNeed || "");
    }
  }, []);

  // Auto-save function
  const saveToSessionStorage = () => {
    const dataToSave = {
      selectedCategories,
      selectedSubCategories,
      customCategory,
      customSubCategory,
      describeNeed
    };
    sessionStorage.setItem('step4Data', JSON.stringify(dataToSave));
  };

  // Auto-save whenever data changes
  useEffect(() => {
    saveToSessionStorage();
  }, [selectedCategories, selectedSubCategories, customCategory, customSubCategory, describeNeed]);

  const handleBack = () => {
    // Save before going back
    saveToSessionStorage();
    navigate("/step-3", {
      state: { personalInfo, stakeholderId, stakeholderTitle, stakeholderPrice }
    });
  };

  // Get options from schema (sorted alphabetically)
  const categoryOptions = (schema?.category?.options || []).sort();
  const subCategoryOptions = (schema?.sub_category?.options || []).sort();

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategories(prev => {
      if (prev.includes(subCategory)) {
        return prev.filter(s => s !== subCategory);
      }
      return [...prev, subCategory];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Step 4 Submitted:", {
      categories: selectedCategories,
      subCategories: selectedSubCategories,
      customCategory,
      customSubCategory,
      describeNeed,
    });
    // Save before navigation
    saveToSessionStorage();
    // Navigate to Step 5 payment page
    navigate("/step-5", {
      state: {
        personalInfo,
        stakeholderId,
        stakeholderTitle,
        stakeholderPrice,
        stakeholderFormData: {
          ...stakeholderFormData,
          category: selectedCategories,
          custom_category: selectedCategories.includes("Other") && customCategory ? customCategory : undefined,
          sub_category: selectedSubCategories,
          custom_sub_category: selectedSubCategories.includes("Other") && customSubCategory ? customSubCategory : undefined,
          describe_your_need: describeNeed,
        },
      }
    });
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
              Membership Application - Step 4
            </h1>
            <p className="text-green-100 text-sm mt-2">
              Select your preferences and interests
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
              Back to Step 3
            </button>

            <form onSubmit={handleSubmit}>
              {/* Category & Sub Category Section */}
              <div className="mb-8 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-1">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Category & Interests
                  </h2>
                </div>
                <p className="text-gray-500 text-sm mb-6 ml-8">
                  Select your areas of interest
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {schema?.category?.label || "Category"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCategoryChange(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option} disabled={selectedCategories.includes(option)}>
                            {option} {selectedCategories.includes(option) ? "✓" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCategories.map(cat => (
                          <span key={cat} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                            {cat}
                            <button type="button" onClick={() => handleCategoryChange(cat)} className="text-green-600 hover:text-green-800">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-blue-600 mt-1">You Can Choose Multiple Area Of Interest</p>
                    
                    {/* Custom Category - shown when "Other" is selected */}
                    {selectedCategories.includes("Other") && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {schema?.custom_category?.label || "Specify Custom Category"}
                        </label>
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter your custom category"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {schema?.sub_category?.label || "Sub-Category"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSubCategoryChange(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">Select Sub Category</option>
                        {subCategoryOptions.map((option) => (
                          <option key={option} value={option} disabled={selectedSubCategories.includes(option)}>
                            {option} {selectedSubCategories.includes(option) ? "✓" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedSubCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSubCategories.map(sub => (
                          <span key={sub} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                            {sub}
                            <button type="button" onClick={() => handleSubCategoryChange(sub)} className="text-green-600 hover:text-green-800">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-blue-600 mt-1">You Can Choose Multiple Sub-Categories</p>
                    
                    {/* Custom Sub Category - shown when "Other" is selected */}
                    {selectedSubCategories.includes("Other") && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {schema?.custom_sub_category?.label || "Specify Custom Sub-Category"}
                        </label>
                        <input
                          type="text"
                          value={customSubCategory}
                          onChange={(e) => setCustomSubCategory(e.target.value)}
                          placeholder="Enter your custom sub-category"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Describe Your Need */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {schema?.describe_your_need?.label || "Describe Your Need"} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={describeNeed}
                    onChange={(e) => setDescribeNeed(e.target.value)}
                    required
                    rows={4}
                    minLength={schema?.describe_your_need?.min_length}
                    maxLength={schema?.describe_your_need?.max_length}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-y"
                    placeholder="You May Describe Your Future Needs/Requirements Here"
                  />
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

export default MembershipStep4;