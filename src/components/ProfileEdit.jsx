import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile } from "../services/api";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    about_yourself: "",
    describe_your_need: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();

      setFormData({
        about_yourself: data.about_yourself || "",
        describe_your_need: data.describe_your_need || "",
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateUserProfile(formData);

      setSuccess("Profile updated successfully ✅");

      // optional auto redirect after 1.5 sec
      setTimeout(() => {
        navigate("/dashboard/profile");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <h2 className="text-2xl font-bold mb-6 border-b pb-4">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* About Yourself */}
          <div>
            <label className="block text-sm font-medium mb-2">
              About Yourself
            </label>
            <textarea
              name="about_yourself"
              value={formData.about_yourself}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Write something about yourself..."
            />
          </div>

          {/* Describe Your Need */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe Your Need
            </label>
            <textarea
              name="describe_your_need"
              value={formData.describe_your_need}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe what you are looking for..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-500">{error}</div>
          )}

          {/* Success */}
          {success && (
            <div className="text-green-600">{success}</div>
          )}

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;