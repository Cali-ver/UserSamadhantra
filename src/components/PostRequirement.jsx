import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
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

  const timelineOptions = [
    "Immediate (Within 7 days)",
    "Within 30 days",
    "1 - 3 months",
    "3 - 6 months",
    "Flexible"
  ];

  const engagementOptions = [
    "One-time",
    "Short-term",
    "Long-term",
    "Subscription",
    "Pilot / PoC"
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validations
    if (!formData.requirementTitle) {
      toast({ title: "Required", description: "Select a category", variant: "destructive" });
      return;
    }
    if (!formData.problemDescription?.trim()) {
      toast({ title: "Required", description: "Enter problem description", variant: "destructive" });
      return;
    }
    if (!formData.expectedOutcome?.trim()) {
      toast({ title: "Required", description: "Enter expected outcome", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);

      const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = passedUserId || storedUser?.id || localStorage.getItem('registeredUserId');

      if (!userId) {
        toast({ title: "Auth Error", description: "Please login again.", variant: "destructive" });
        return;
      }

      const payload = {
        user_id: userId,
        requirement_category: formData.requirementTitle,
        problem_description: (formData.problemDescription || "").trim(),
        expected_outcome: (formData.expectedOutcome || "").trim(),
        timeline: formData.timeline || null,
        budget_range: formData.budgetRange || null,
        preferred_location: formData.preferredLocation || null,
        engagement_types: Array.isArray(formData.engagementTypes) ? formData.engagementTypes : []
      };

      await createRequirement(payload);

      toast({
        title: "Success",
        description: "Requirement posted successfully"
      });

      // Redirect to requirements dashboard
      navigate("/dashboard/requirements");

    } catch (error) {
      console.error("❌ Submission failed:", error);
      const errorMsg = error?.message || (typeof error === 'string' ? error : "Something went wrong.");
      toast({
        title: "Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEngagementChange = (option) => {
    setFormData(prev => {
      const types = [...prev.engagementTypes];
      if (types.includes(option)) {
        return { ...prev, engagementTypes: types.filter(t => t !== option) };
      } else {
        return { ...prev, engagementTypes: [...types, option] };
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-10 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Post New Requirement</h1>
            <p className="text-slate-500 font-medium italic">Describe your project needs for AI matching.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Requirement Category *</Label>
                <Select
                  value={formData.requirementTitle}
                  onValueChange={(val) => setFormData(p => ({ ...p, requirementTitle: val }))}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold">
                    <SelectValue placeholder="Choose Domain" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    {categories.map(c => <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Estimated Timeline</Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(val) => setFormData(p => ({ ...p, timeline: val }))}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold">
                    <SelectValue placeholder="Select Timing" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    {timelineOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Detailed Description *</Label>
              <Textarea
                placeholder="What exactly do you need help with?"
                className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 font-medium p-4 focus-visible:ring-indigo-500/10"
                value={formData.problemDescription}
                onChange={(e) => setFormData(p => ({ ...p, problemDescription: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Expected Outcome *</Label>
              <Textarea
                placeholder="What is your final goal?"
                className="min-h-[100px] rounded-2xl border-slate-100 bg-slate-50 font-medium p-4 focus-visible:ring-indigo-500/10 italic"
                value={formData.expectedOutcome}
                onChange={(e) => setFormData(p => ({ ...p, expectedOutcome: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Budget Range (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input
                    type="text"
                    placeholder="e.g. 50000"
                    className="pl-8 h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"
                    value={formData.budgetRange}
                    onChange={(e) => setFormData(p => ({ ...p, budgetRange: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Preferred Location</Label>
                <Input
                  placeholder="e.g. Delhi, Remote"
                  className="h-12 rounded-xl border-slate-100 bg-slate-50 font-bold"
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData(p => ({ ...p, preferredLocation: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-slate-700">Engagement Preference</Label>
              <div className="flex flex-wrap gap-4">
                {engagementOptions.map(opt => (
                  <label key={opt} className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors border border-transparent has-[:checked]:border-indigo-200 has-[:checked]:bg-white">
                    <Checkbox
                      checked={formData.engagementTypes.includes(opt)}
                      onCheckedChange={() => handleEngagementChange(opt)}
                      className="rounded-md"
                    />
                    <span className="text-sm font-bold text-slate-600">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-12 py-7 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:bg-slate-300"
              >
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Publishing...
                    </span>
                ) : "Submit Project Need"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostRequirement;