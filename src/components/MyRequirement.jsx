import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getAllRequirements, 
  deleteRequirement, 
  getRequirementShortlist, 
  createAgreement 
} from "../services/api";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  FileText, 
  Users, 
  MessageSquare, 
  Star, 
  Edit3, 
  Trash2, 
  Search, 
  Brain, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ChatDrawer from "./ChatDrawer";

const MyRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [filteredReqs, setFilteredReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReq, setSelectedReq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Shortlist/Bids State
  const [shortlist, setShortlist] = useState([]);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [loadingShortlist, setLoadingShortlist] = useState(false);
  
  // Finalize Agreement State
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [targetBid, setTargetBid] = useState(null);
  const [finalizeData, setFinalizeData] = useState({ budget: "", outcome: "", terms: "" });
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState({ id: null, name: "" });

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('registeredUserId');

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await getAllRequirements(0, 100);
      let allReqs = Array.isArray(response) ? response : (response?.data || []);
      const userReqs = allReqs.filter(req => String(req.user_id) === String(currentUserId));
      setRequirements(userReqs);
    } catch (err) {
      console.error('❌ Fetch requirements error:', err);
      setError('Failed to load requirements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...requirements];
    if (statusFilter !== "all") result = result.filter(r => r.status?.toLowerCase() === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.requirement_category?.toLowerCase().includes(q) || r.problem_description?.toLowerCase().includes(q));
    }
    setFilteredReqs(result);
  }, [searchQuery, statusFilter, requirements]);

  const handleViewBids = async (reqId) => {
    try {
      setLoadingShortlist(true);
      setIsShortlistModalOpen(true);
      const data = await getRequirementShortlist(reqId);
      setShortlist(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      toast({ title: "Error", description: "Failed to load bids.", variant: "destructive" });
    } finally {
      setLoadingShortlist(false);
    }
  };

  const handleOpenFinalize = (bid) => {
    setTargetBid(bid);
    setFinalizeData({ budget: bid.amount || bid.estimated_budget || "", outcome: "", terms: "" });
    setIsFinalizeModalOpen(true);
  };

  const handleFinalize = async () => {
    if (!finalizeData.budget || !finalizeData.outcome) {
        toast({ title: "Required", description: "Please enter budget and outcome." });
        return;
    }

    try {
      setIsFinalizing(true);
      await createAgreement(selectedReq.id, {
        requirement_id: selectedReq.id,
        provider_user_id: targetBid.provider_user_id,
        budget: Number(finalizeData.budget),
        agreed_outcome: finalizeData.outcome,
        terms_conditions: finalizeData.terms
      });

      toast({ title: "Success", description: "Agreement created and sent to provider." });
      setIsFinalizeModalOpen(false);
      setIsShortlistModalOpen(false);
    } catch (err) {
      toast({ title: "Error", description: err.message || "Failed to finalize agreement.", variant: "destructive" });
    } finally {
      setIsFinalizing(false);
    }
  };

  const openChat = (bid) => {
    setChatSession({ 
        id: `chat_${selectedReq.id}_${bid.provider_user_id}`, 
        name: `Provider ${bid.provider_user_id.slice(0, 8)}`
    });
    setIsChatOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My <span className="text-blue-600">Requirements</span></h1>
        <Button onClick={() => navigate("/dashboard/post-requirement")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black h-12">
          <Plus className="w-5 h-5 mr-2" /> Post New Need
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requirements..." 
            className="pl-12 h-11 bg-slate-50 border-0 rounded-2xl font-bold"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="bg-slate-50 p-1 rounded-2xl">
          <TabsList className="bg-transparent h-9 border-0">
            <TabsTrigger value="all" className="rounded-xl px-5 font-bold">All</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl px-5 font-bold text-emerald-600">Active</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Requirement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReqs.map((req) => (
          <Card key={req.id} className="border-slate-50 rounded-[2rem] bg-white p-6 shadow-sm hover:shadow-xl transition-all">
            <Badge variant="outline" className="mb-4 bg-slate-50 border-slate-100 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                <span className={`w-2 h-2 rounded-full mr-2 ${req.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                {req.status}
            </Badge>
            <h3 className="text-xl font-black text-slate-900 line-clamp-1">{req.requirement_category}</h3>
            <p className="text-slate-500 text-sm mt-2 line-clamp-2 italic">"{req.problem_description}"</p>
            
            <div className="flex gap-2 pt-6 border-t border-slate-50 mt-4">
                <Button 
                    onClick={() => { setSelectedReq(req); handleViewBids(req.id); }}
                    className="flex-1 h-11 bg-white border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-black text-xs transition-all"
                >
                    <Users className="w-4 h-4 mr-2" /> View Bids
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={() => { setSelectedReq(req); setIsModalOpen(true); }}
                    className="h-11 w-11 rounded-xl text-slate-400"
                >
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Shortlist/Bids Modal */}
      <Dialog open={isShortlistModalOpen} onOpenChange={setIsShortlistModalOpen}>
        <DialogContent className="max-w-3xl p-8 rounded-[2.5rem] bg-white border-0">
          <DialogHeader className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Requirement <span className="text-blue-600">Shortlist</span></h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-2">View other accounts bidding on your request</p>
          </DialogHeader>

          {loadingShortlist ? (
            <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="font-black text-slate-300 text-[10px] uppercase">Retrieving Bids...</p>
            </div>
          ) : shortlist.length === 0 ? (
            <div className="py-20 bg-slate-50 rounded-[2rem] text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-400 uppercase text-xs">No responses found from other users yet.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {shortlist.map((item, idx) => (
                    <Card key={idx} className="p-6 bg-slate-50 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-blue-100 group shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-blue-200 shadow-sm">
                                    <User className="w-7 h-7 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900">Provider ID: {(item.provider_user_id || "").slice(0, 8)}</h4>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
                                        <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3 text-emerald-500" /> {(item.amount || item.estimated_budget || 0).toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.8 Rating</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => openChat(item)} variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-white text-slate-400 hover:text-blue-600 shadow-sm"><MessageSquare className="w-4 h-4" /></Button>
                                <Button onClick={() => handleOpenFinalize(item)} className="h-10 bg-blue-600 text-white rounded-xl font-black text-xs px-6">Finalize</Button>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed shadow-inner">
                            "{item.proposal_text || "Proposal successfully logged in the ecosystem."}"
                        </div>
                    </Card>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Finalize Agreement Modal */}
      <Dialog open={isFinalizeModalOpen} onOpenChange={setIsFinalizeModalOpen}>
        <DialogContent className="max-w-xl p-8 rounded-[2.5rem] border-0">
          <DialogHeader className="mb-8 p-4 bg-slate-900 rounded-[2rem] text-white">
            <h2 className="text-xl font-black italic tracking-tight">Finalize <span className="text-blue-400">Innovation Deal</span></h2>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Final Budget (₹)</label>
                <Input type="number" value={finalizeData.budget} onChange={(e) => setFinalizeData({...finalizeData, budget: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-0 font-bold" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Expected Outcome</label>
                <Textarea value={finalizeData.outcome} onChange={(e) => setFinalizeData({...finalizeData, outcome: e.target.value})} className="min-h-[100px] bg-slate-50 border-0 rounded-2xl p-4 font-medium italic text-sm" />
            </div>
            <Button onClick={handleFinalize} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl" disabled={isFinalizing}>
                {isFinalizing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                Send Agreement To Provider
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} sessionId={chatSession.id} recipientName={chatSession.name} requirementId={selectedReq?.id} />
    </div>
  );
};

export default MyRequirements;