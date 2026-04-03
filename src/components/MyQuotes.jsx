import { useEffect, useState, useMemo } from "react";
import { 
  getUserAgreements, 
  downloadAgreementPDF, 
  getProviderShortlists, 
  getProviderBids,
  signAgreement,
  generateAgreementPDF
} from "../services/api";
import { toast } from "@/hooks/use-toast";
import { 
  Receipt, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Brain,
  ShieldCheck,
  Calendar,
  IndianRupee,
  ChevronRight,
  Loader2,
  FileCheck,
  MessageSquare,
  Zap,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import ChatDrawer from "./ChatDrawer";

const MyQuotes = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("agreements");
  const [myBids, setMyBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);

  // Sign Flow
  const [isSigning, setIsSigning] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState({ id: null, name: "" });

  const currentUserId = localStorage.getItem('registeredUserId');

  useEffect(() => {
    fetchAgreements();
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      setLoadingBids(true);
      // Fetch both submitted bids AND shortlisted items for a complete view
      const [bidsData, shortlistsData] = await Promise.all([
          getProviderBids().catch(() => ({ data: [] })), 
          getProviderShortlists().catch(() => ({ data: [] }))
      ]);

      const allBids = Array.isArray(bidsData) ? bidsData : (bidsData?.data || []);
      const shortlists = Array.isArray(shortlistsData) ? shortlistsData : (shortlistsData?.data || []);

      // Merge and remove duplicates by requirement_id
      const mergedBids = [...allBids];
      shortlists.forEach(sl => {
          if (!mergedBids.some(b => b.requirement_id === sl.requirement_id)) {
              mergedBids.push({ ...sl, is_shortlisted: true });
          } else {
              // Update existing bid with shortlisted status
              const idx = mergedBids.findIndex(b => b.requirement_id === sl.requirement_id);
              mergedBids[idx] = { ...mergedBids[idx], is_shortlisted: true };
          }
      });

      setMyBids(mergedBids);
    } catch (err) {
      console.error("❌ Fetch bids error:", err);
    } finally {
      setLoadingBids(false);
    }
  };

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const data = await getUserAgreements();
      const agreementsList = Array.isArray(data) ? data : (data?.data || []);
      setAgreements(agreementsList);
    } catch (err) {
      setError("Failed to load quotes and agreements.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = useMemo(() => {
    let result = agreements;
    if (statusFilter !== "all") result = result.filter(q => q.status?.toLowerCase() === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(quote => 
        (quote.requirement_category || quote.id || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [agreements, statusFilter, searchQuery]);

  const filteredBids = useMemo(() => {
     if (searchQuery) {
         const q = searchQuery.toLowerCase();
         return myBids.filter(b => 
            (b.requirement_id || "").toLowerCase().includes(q) || 
            (b.proposal_text || "").toLowerCase().includes(q)
         );
     }
     return myBids;
  }, [myBids, searchQuery]);

  const handleSignAgreement = async (quote) => {
    try {
      setIsSigning(true);
      await signAgreement(quote.id, { 
        agreement_id: quote.id,
        signed_at: new Date().toISOString()
      });
      await generateAgreementPDF(quote.id);
      toast({ title: "Success", description: "Agreement signed and finalized." });
      fetchAgreements();
    } catch (err) {
      toast({ title: "Error", description: "Failed to sign agreement.", variant: "destructive" });
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      setIsDownloading(true);
      const response = await downloadAgreementPDF(id);
      if (response && response.file_url) {
        window.open(response.file_url, '_blank');
      } else { throw new Error(); }
    } catch (err) {
      toast({ title: "Error", description: "PDF not ready yet.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quotes & <span className="text-blue-600">Proposals</span></h1>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-[2rem] shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals..." 
            className="pl-11 h-11 bg-slate-50 border-0 rounded-2xl font-bold"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-50 p-1 rounded-2xl">
          <TabsList className="bg-transparent h-9 border-0">
            <TabsTrigger value="agreements" className="rounded-xl px-5 font-bold">Agreements</TabsTrigger>
            <TabsTrigger value="bids" className="rounded-xl px-5 font-bold">Bids Sent</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "agreements" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote) => {
                const needsSign = !quote.provider_signed_at && quote.status !== 'signed';
                return (
                  <Card key={quote.id} className="border-slate-50 shadow-sm rounded-[2.5rem] bg-white p-8 space-y-6 hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className={`text-[10px] uppercase font-black px-4 py-1.5 rounded-full ${needsSign ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                            {needsSign ? "Pending Signature" : "Finalized"}
                        </Badge>
                        <Button variant="ghost" onClick={() => { setChatSession({id: `chat_${quote.requirement_id}`, name: "Project Chat"}); setIsChatOpen(true); }} className="h-10 w-10 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl">
                            <MessageSquare className="w-5 h-5" />
                        </Button>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-1">{quote.requirement_category}</h3>
                    <div className="flex items-center justify-between py-4 border-y border-slate-50">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</p>
                            <p className="text-lg font-black text-emerald-600">₹{(quote.budget || 0).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {needsSign ? (
                            <Button onClick={() => handleSignAgreement(quote)} className="flex-1 h-12 bg-amber-600 hover:bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-amber-100">Sign Now</Button>
                        ) : (
                            <Button onClick={() => { setSelectedQuote(quote); setIsModalOpen(true); }} className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-black">Details</Button>
                        )}
                        <Button variant="outline" onClick={() => handleDownloadPDF(quote.id)} className="w-12 h-12 rounded-2xl border-slate-100 text-slate-400"><Download className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                );
            })}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBids.map((bid, i) => (
                  <Card key={i} className="border-slate-50 bg-white rounded-[2.5rem] p-8 shadow-sm space-y-6 hover:shadow-xl transition-all">
                      <div className="flex justify-between items-start">
                        <Badge className={`${bid.is_shortlisted ? "bg-emerald-500" : "bg-slate-400"} text-[10px] font-black uppercase px-4 py-1.5`}>
                           {bid.is_shortlisted ? "Shortlisted" : "Submitted"}
                        </Badge>
                        <Button variant="ghost" onClick={() => { setChatSession({id: `chat_${bid.requirement_id}`, name: "Bid Support"}); setIsChatOpen(true); }} className="h-10 w-10 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl"><MessageSquare className="w-5 h-5" /></Button>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">REQ: {(bid.requirement_id || "").slice(0, 8)}</h3>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-500 line-clamp-2">
                         {bid.proposal_text || "Proposal successfully logged in the ecosystem."}
                      </div>
                      <div className="flex items-center justify-between text-xs font-black">
                         <span className="text-slate-400 uppercase tracking-widest text-[10px]">Proposed Budget</span>
                         <span className="text-emerald-600">₹{(bid.amount || bid.estimated_budget || 0).toLocaleString()}</span>
                      </div>
                  </Card>
              ))}
              {filteredBids.length === 0 && !loadingBids && (
                  <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-slate-200 mx-auto" />
                      <p className="font-bold text-slate-400">You haven't submitted any bids yet.</p>
                  </div>
              )}
          </div>
      )}

      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        sessionId={chatSession.id}
        recipientName={chatSession.name}
      />
    </div>
  );
};

export default MyQuotes;
