import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRequirements, deleteRequirement, updateRequirement } from "../services/api";
import { toast } from "@/hooks/use-toast";

const MyRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const data = await getUserRequirements();

      if (data?.status) {
        setRequirements(data.data || []);
      } else {
        setError("Failed to load requirements");
      }
    } catch (err) {
      console.error('❌ Fetch requirements error:', err);
      setError(err?.message || err?.response?.data?.message || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading your requirements...
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">My Requirements</h2>

        <button
          onClick={() => navigate("/create-requirement")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Requirement
        </button>
      </div>

      {/* Empty State */}
      {requirements.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">
            You haven’t posted any requirements yet.
          </p>
          <button
            onClick={() => navigate("/create-requirement")}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Create First Requirement
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition"
            >
              {/* Top */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {req.requirement_category}
                </h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    req.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-2">
                <strong>Problem:</strong> {req.problem_description}
              </p>

              <p className="text-gray-700 mb-4">
                <strong>Expected Outcome:</strong> {req.expected_outcome}
              </p>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <p><strong>Timeline:</strong> {req.timeline}</p>
                <p><strong>Budget:</strong> ₹{req.budget_range}</p>
                <p><strong>Location:</strong> {req.preferred_location || "N/A"}</p>
                <p><strong>Engagement:</strong> {req.engagement_types?.join(", ")}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                

                <button
                  onClick={() => navigate(`/dashboard/requirements/edit/${req.id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to delete this requirement?")) return;
                    try {
                      await deleteRequirement(req.id);
                      toast({ title: "Deleted", description: "Requirement removed successfully" });
                      fetchRequirements(); // refresh list
                    } catch (err) {
                      console.error("delete failed", err);
                      // if database integrity error, try a soft‑close
                      const statusCode = err?.response?.status;
                      const errorMsg =
                        err?.response?.data?.message ||
                        err?.response?.data ||
                        err.message;
                      if (statusCode === 422 && /integrity/i.test(errorMsg)) {
                        try {
                          // backend allows only these statuses
                          const fallbackStatus = "cancelled"; // 'completed' or 'cancelled' are safe
                          await updateRequirement(req.id, { status: fallbackStatus });
                          toast({
                            title: "Closed",
                            description: `Requirement could not be deleted (linked data); marked as ${fallbackStatus}.`
                          });
                          fetchRequirements();
                          return;
                        } catch (patchErr) {
                          console.error("fallback close failed", patchErr);
                        }
                      }
                      const msg =
                        errorMsg ||
                        "Failed to delete requirement. It may be linked to other records.";
                      toast({ title: "Error", description: msg, variant: "destructive" });
                    }
                  }}
                  className="bg-red-800 hover:bg-red-900 text-white px-4 py-1.5 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequirements;