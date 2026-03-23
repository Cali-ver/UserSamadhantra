import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../services/api";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please login to view your profile.");
        return;
      }

      // const data = await fetchUserProfile();
      // setProfile(data);
    localStorage.getItem("userData") && setProfile(JSON.parse(localStorage.getItem("userData")));

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading profile...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-xl">
        Profile not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="flex items-center gap-6">

            {/* Profile Image */}
            <div className="relative">
              {profile.profile_photo_url ? (
                <img
                  src={`https://api.samadhantra.com${profile.profile_photo_url}?t=${Date.now()}`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard/profile/photo")}
                className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
              >
                Change
              </button>
            </div>

            {/* Basic Info */}
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 capitalize">
                {profile.user_type}
              </p>

              <div className="flex gap-3 mt-2">
                <StatusBadge
                  label={profile.is_active ? "Active" : "Inactive"}
                  color={profile.is_active ? "green" : "red"}
                />
                <StatusBadge
                  label={profile.is_verified ? "Verified" : "Not Verified"}
                  color={profile.is_verified ? "blue" : "yellow"}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/dashboard/profile/edit")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/dashboard/post-requirement", { state: { userId: profile.id } })}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              Post Requirement
            </button>
          </div>
        </div>

        {/* BASIC INFORMATION */}
        <Section title="Basic Information">
          <Grid>
            <Info label="User ID" value={profile.id} />
            <Info label="Reference Number" value={profile.reference_number} />
            <Info label="Phone" value={profile.phone_number} />
            <Info label="City" value={profile.city} />
            <Info label="State" value={profile.state} />
            <Info label="Address" value={profile.address} />
            <Info label="Latitude" value={profile.latitude} />
            <Info label="Longitude" value={profile.longitude} />
            <Info
              label="Created At"
              value={new Date(profile.created_at).toLocaleString()}
            />
          </Grid>
        </Section>

        {/* ACADEMIC / PROFESSIONAL DETAILS */}
        <Section title="Academic / Professional Details">
          <Grid>
            <Info label="College Name" value={profile.college_name} />
            <Info label="Degree" value={profile.degree} />
            <Info label="Specialization" value={profile.specialization} />
            <Info label="Skills" value={profile.key_skills} />
            <Info label="Preferred Mode" value={profile.preferred_mode} />
            <Info label="Objective" value={profile.objective} />
            <Info label="Payment Status" value={profile.payment_status} />
          </Grid>
        </Section>

        {/* CATEGORY DETAILS */}
        <Section title="Category Details">
          <Grid>
            <Info label="Category" value={profile.category?.join(", ")} />
            <Info label="Sub Category" value={profile.sub_category?.join(", ")} />
            <Info label="Custom Category" value={profile.custom_category} />
            <Info label="Custom Sub Category" value={profile.custom_sub_category} />
          </Grid>
        </Section>

        {/* OPTIONAL SECTIONS */}
        {profile.about_yourself && (
          <Section title="About">
            <p className="text-gray-700">{profile.about_yourself}</p>
          </Section>
        )}

        {profile.describe_your_need && (
          <Section title="Describe Your Need">
            <p className="text-gray-700">{profile.describe_your_need}</p>
          </Section>
        )}

        {profile.experience_projects && (
          <Section title="Experience / Projects">
            <p className="text-gray-700">{profile.experience_projects}</p>
          </Section>
        )}

      </div>
    </div>
  );
};

/* Helper Components */

const Section = ({ title, children }) => (
  <div className="mt-10">
    <h3 className="text-xl font-semibold mb-4 border-b pb-2">
      {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium break-words">{value || "N/A"}</p>
  </div>
);

const StatusBadge = ({ label, color }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${colors[color]}`}>
      {label}
    </span>
  );
};

export default UserProfile;