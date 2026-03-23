import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createRequirement } from "../services/api";

const PostRequirement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedUserId = location.state?.userId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    requirementTitle: "",
    problemDescription: "",
    expectedOutcome: "",
    timeline: "",
    budgetRange: "",
    preferredLocation: "",
    engagementTypes: []
  });

  // ✅ BACKEND APPROVED CATEGORY LIST
  const requirementTitles = [
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

  const timelineOptions = [
    "Immediate (Within 7 days)",
    "Within 30 days",
    "1 - 3 months",
    "3 - 6 months",
    "Flexible"
  ];

  // ✅ Engagement options (backend expects label values)
  const engagementOptions = [
    "One-time",
    "Short-term",
    "Long-term",
    "Subscription",
    "Pilot / PoC"
  ];

  const resetForm = () => {
    setFormData({
      requirementTitle: "",
      problemDescription: "",
      expectedOutcome: "",
      timeline: "",
      budgetRange: "",
      preferredLocation: "",
      engagementTypes: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDATION
    if (!formData.requirementTitle) {
      return toast({
        title: "Error",
        description: "Please select requirement category",
        variant: "destructive"
      });
    }

    if (!formData.problemDescription.trim()) {
      return toast({
        title: "Error",
        description: "Please enter problem description",
        variant: "destructive"
      });
    }

    if (!formData.expectedOutcome.trim()) {
      return toast({
        title: "Error",
        description: "Please enter expected outcome",
        variant: "destructive"
      });
    }

    if (formData.engagementTypes.length === 0) {
      return toast({
        title: "Error",
        description: "Please select at least one engagement type",
        variant: "destructive"
      });
    }

    try {
      setIsSubmitting(true);

      const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = passedUserId || storedUser?.id;

      if (!userId) {
        throw new Error("User not authenticated. Please login again.");
      }

      const payload = {
        user_id: userId,
        requirement_category: formData.requirementTitle,
        problem_description: formData.problemDescription.trim(),
        expected_outcome: formData.expectedOutcome.trim(),
        timeline: formData.timeline || null,
        budget_range: formData.budgetRange || null,
        preferred_location: formData.preferredLocation || null,
        engagement_types: formData.engagementTypes
      };

      console.log("📤 Final Payload:", payload);

      const response = await createRequirement(payload);

      console.log("✅ Requirement Created:", response);

      toast({
        title: "Success!",
        description: "Your requirement has been submitted successfully"
      });

      resetForm();
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Submit error:", error);

      toast({
        title: "Error",
        description: error || "Failed to submit requirement",
        variant: "destructive"
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEngagementChange = (value) => {
    setFormData(prev => ({
      ...prev,
      engagementTypes: prev.engagementTypes.includes(value)
        ? prev.engagementTypes.filter(item => item !== value)
        : [...prev.engagementTypes, value]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-6">
      <Card>
        <CardContent className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">
            Post Your Requirement
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Category */}
            <div>
              <Label>Requirement Category *</Label>
              <Select
                value={formData.requirementTitle}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    requirementTitle: value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {requirementTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Problem */}
            <div>
              <Label>Problem Description *</Label>
              <Textarea
                value={formData.problemDescription}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    problemDescription: e.target.value
                  }))
                }
              />
            </div>

            {/* Outcome */}
            <div>
              <Label>Expected Outcome *</Label>
              <Textarea
                value={formData.expectedOutcome}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    expectedOutcome: e.target.value
                  }))
                }
              />
            </div>

           

            {/* Timeline */}
            <div>
              <Label>Timeline</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    timeline: value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div>
              <Label>Budget Range</Label>
              <Input
                value={formData.budgetRange}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    budgetRange: e.target.value
                  }))
                }
              />
            </div>

             <div>
              <Label>Preffered Location *</Label>
              <Textarea
                value={formData.preferredLocation}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    preferredLocation: e.target.value
                  }))
                }
              />
            </div>

            {/* Engagement Types */}
            <div>
              <Label>Engagement Type *</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {engagementOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.engagementTypes.includes(option)}
                      onCheckedChange={() =>
                        handleEngagementChange(option)
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-10 py-3 rounded-full font-semibold transition-all
                  ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Requirement"}
              </button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostRequirement;