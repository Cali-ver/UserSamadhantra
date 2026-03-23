import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfilePhoto, fetchUserProfile } from "../services/api";

const UploadProfilePhoto = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  // Load current profile to show current image
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const updatedProfile = await updateUserProfilePhoto(file);

      alert("✅ Profile photo updated successfully");

      // Redirect to profile with updated data
      navigate("/dashboard/profile", { state: { profile: updatedProfile } });

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">

        <h2 className="text-xl font-bold mb-4">Upload Profile Photo</h2>

        {/* Current or preview image */}
        <div className="flex justify-center mb-4">
          <img
            src={
              preview ||
              (profile?.profile_photo_url
                ? `https://api.samadhantra.com${profile.profile_photo_url}?t=${Date.now()}`
                : "/default-profile.png")
            }
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover border"
          />
        </div>

        {/* File input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        {error && <p className="text-red-500 mb-3">{error}</p>}

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadProfilePhoto;