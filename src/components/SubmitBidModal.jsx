import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { submitBid } from "../services/api";
import { toast } from "sonner";

/**
 * SubmitBidModal - A senior-level implementation of the bidding form.
 * Handles validation, loading states, and API communication internally.
 */
const SubmitBidModal = ({ isOpen, onClose, requirementId, requirementCategory, requirementUserId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    proposal_text: "",
    experience_text: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the user is bidding on their own post
    const currentUserId = localStorage.getItem('registeredUserId');
    if (String(currentUserId) === String(requirementUserId)) {
      toast.error("You cannot bid on your own requirement.");
      return;
    }

    // Basic Client-side Validation (Step 4: Error Handling)
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (formData.proposal_text.length < 20) {
      toast.error("Proposal must be at least 20 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const bidPayload = {
        provider_user_id: currentUserId,
        amount: parseFloat(formData.amount),
        proposal_text: formData.proposal_text,
        experience_text: formData.experience_text || "",
      };

      // Step 3: API Integration Code
      const response = await submitBid(requirementId, bidPayload);
      
      if (response.status) {
        toast.success("Proposal submitted successfully!");
        onClose();
        setFormData({ amount: "", proposal_text: "", experience_text: "" });
      }
    } catch (error) {
      // Step 4: Robust Error Handling
      const errorMessage = error.message || "Something went wrong. Please check your connection.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-0 shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Place <span className="text-indigo-600">Proposal</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Category: <span className="text-indigo-600 font-bold">{requirementCategory}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Proposed Budget (INR)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              className="h-12 bg-slate-50 border-0 rounded-2xl font-bold focus-visible:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_text" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Timeline / Track Record
            </Label>
            <Input
              id="experience_text"
              name="experience_text"
              placeholder="e.g. 15 days / Previous similar projects"
              value={formData.experience_text}
              onChange={handleChange}
              className="h-12 bg-slate-50 border-0 rounded-2xl font-bold focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal_text" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Technical Proposal
            </Label>
            <Textarea
              id="proposal_text"
              name="proposal_text"
              placeholder="Describe your approach and solution..."
              rows={4}
              value={formData.proposal_text}
              onChange={handleChange}
              className="bg-slate-50 border-0 rounded-2xl font-medium focus-visible:ring-indigo-500 resize-none p-4"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || String(localStorage.getItem('registeredUserId')) === String(requirementUserId)}
              className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-white shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Bid
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitBidModal;
