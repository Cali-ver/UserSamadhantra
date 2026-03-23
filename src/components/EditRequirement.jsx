import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/lib/axios";
import { updateRequirement } from "../services/api";

const EditRequirement = () => {
  const { id } = useParams(); // 🔥 requirement_id from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    requirement_category: "",
    problem_description: "",
    expected_outcome: "",
    timeline: "",
    budget_range: "",
    preferred_location: "",
    engagement_types: [],
    status: "created"
  });

  const categories = [
    "Business & Startup Services",
    "Technology & Digital Solutions",
    "Education & Skill Development",
    "Talent, Internship & Hiring",
    "Investment & Funding",
    "Legal, Compliance & Governance",
    "Marketing, Sales & Growth",
    "Infrastructure & Operations",
    "Research, Innovation & Consulting",
    "Government, CSR & Public Programs",
    "Other"
  ];

  const engagementOptions = [
    "One-time",
    "Short-term",
    "Long-term",
    "Subscription",
    "Pilot / PoC"
  ];

  const timelineOptions = [
    "Immediate (Within 7 days)",
    "Within 30 days",
    "1 - 3 months",
    "3 - 6 months",
    "Flexible"
  ];

  // Fetch existing requirement
  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const res = await apiClient.get(`/requirements/${id}`);
        setFormData(res.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load requirement",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [id]);

  const handleEngagementChange = (value, checked) => {
    setFormData((prev) => ({
      ...prev,
      engagement_types: checked
        ? [...prev.engagement_types, value]
        : prev.engagement_types.filter((item) => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // core validations (same rules backend expects)
    if (!formData.requirement_category) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }
    if (!formData.problem_description.trim()) {
      toast({ title: "Error", description: "Please describe the problem", variant: "destructive" });
      return;
    }
    if (!formData.expected_outcome.trim()) {
      toast({ title: "Error", description: "Please specify the expected outcome", variant: "destructive" });
      return;
    }
    if (!formData.timeline) {
      toast({ title: "Error", description: "Please select a timeline", variant: "destructive" });
      return;
    }
    if (!formData.budget_range.trim()) {
      toast({ title: "Error", description: "Please enter a budget range", variant: "destructive" });
      return;
    }
    if (formData.engagement_types.length === 0) {
      toast({ title: "Error", description: "Please select at least one engagement type", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);

      await updateRequirement(id, formData);

      toast({
        title: "Success",
        description: "Requirement updated successfully"
      });

      navigate("/dashboard/requirements");

    } catch (error) {
      toast({
        title: "Update Failed",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <Card>
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">Edit Requirement</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Category */}
            <div>
              <Label>Requirement Category</Label>
              <Select
                value={formData.requirement_category}
                onValueChange={(value) =>
                  setFormData({ ...formData, requirement_category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Problem */}
            <div>
              <Label>Problem Description</Label>
              <Textarea
                value={formData.problem_description}
                onChange={(e) =>
                  setFormData({ ...formData, problem_description: e.target.value })
                }
              />
            </div>

            {/* Outcome */}
            <div>
              <Label>Expected Outcome</Label>
              <Textarea
                value={formData.expected_outcome}
                onChange={(e) =>
                  setFormData({ ...formData, expected_outcome: e.target.value })
                }
              />
            </div>

            {/* Engagement Types */}
            <div>
              <Label>Engagement Types</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {engagementOptions.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.engagement_types.includes(option)}
                      onCheckedChange={(checked) =>
                        handleEngagementChange(option, checked)
                      }
                    />
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <Label>Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) =>
                  setFormData({ ...formData, timeline: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <Label>Budget Range</Label>
              <Input
                value={formData.budget_range}
                onChange={(e) =>
                  setFormData({ ...formData, budget_range: e.target.value })
                }
              />
            </div>

            {/* Preferred Location */}
            <div>
              <Label>Preferred Location</Label>
              <Input
                value={formData.preferred_location}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_location: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              {isSubmitting ? "Updating..." : "Update Requirement"}
            </button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRequirement;