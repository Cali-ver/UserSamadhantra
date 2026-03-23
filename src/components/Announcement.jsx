import { useEffect, useState } from "react";
import { getActiveAnnouncements } from "../services/api";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getActiveAnnouncements();

      if (data?.status) {
        setAnnouncements(data.data || []);
      } else {
        setError("Failed to load announcements");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading announcements.......
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-8">Active Announcements</h2>

      {announcements.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-gray-50">
          No active announcements available.
        </div>
      ) : (
        <div className="grid gap-6">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">
                  {item.requirement_category}
                </h3>

                <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>

              <p className="text-gray-700 mb-4">
                {item.problem_description}
              </p>

              <div className="text-sm text-gray-500">
                <p>
                  <strong>Expires At:</strong>{" "}
                  {formatDate(item.expires_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;