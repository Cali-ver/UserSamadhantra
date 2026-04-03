import { useState, useEffect } from "react";
import { getFAQs, searchFAQs } from "../services/api";
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  MessageCircle,
  Lightbulb,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getFAQs();
      setFaqs(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error("❌ FAQ fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const data = await searchFAQs(query);
        setFaqs(Array.isArray(data) ? data : (data?.data || []));
      } catch (error) {
        console.error("❌ FAQ search error:", error);
      }
    } else if (query.length === 0) {
      fetchData();
    }
  };

  const categories = [
    { name: "Getting Started", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Platform Security", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Technical Help", icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Payments", icon: MessageCircle, color: "text-indigo-500", bg: "bg-indigo-50" }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
          How can we <span className="text-blue-600">help you?</span>
        </h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
            Search our knowledge base or browse categories below
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for answers..." 
          className="h-16 pl-14 rounded-[2rem] border-slate-100 bg-white shadow-xl shadow-slate-100/50 font-bold text-slate-700"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <Button key={i} variant="outline" className="h-24 rounded-[2rem] flex flex-col gap-2 border-slate-100 hover:bg-slate-50 group">
             <div className={`p-2 rounded-xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.name}</span>
          </Button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3.5rem] border border-dashed border-slate-200">
             <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No matching articles found</p>
          </div>
        ) : (
          faqs.map((faq, i) => (
            <Card key={i} className="border-slate-50 rounded-[2.5rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-7 flex items-center justify-between text-left group"
              >
                <span className="font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                    {faq.question}
                </span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
              </button>
              {openIndex === i && (
                <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-6">
                  {faq.answer}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Contact Trigger */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-center space-y-6 text-white relative overflow-hidden">
         <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-black italic tracking-tight">Still have questions?</h3>
            <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto">Our support crew is always ready to assist you with your innovations.</p>
            <Button className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-10 py-7 rounded-2xl font-black text-xs uppercase tracking-widest mt-4">
                Chat With Support
            </Button>
         </div>
         <div className="absolute left-[-10%] bottom-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default FAQ;
